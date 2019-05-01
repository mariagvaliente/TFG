const Sequelize = require("sequelize");
const {models} = require("../models");

// Autoload the turn with id equals to :turnId
exports.load = (req, res, next, turnId) => {
    const options = {"include": [
        {"model": models.team,
            "include": {
                "model": models.user,
                "as": "teamMembers"
            }}
    ]};

    if (req.session.user) {
        options.include.push({"model": models.user,
            "as": "students",
            // "where": {"id": req.session.user.id}, // TODO Comprobar
            "required": false});
    }

    models.turno.findById(turnId, options).
        then((turn) => {
            if (turn) {
                req.turn = turn;
                next();
            } else {
                next(new Error(`There is no turn with turnId=${turnId}`));
            }
        }).
        catch((error) => next(error));
};


// POST /escapeRooms/:escapeRoomId/join
exports.indexStudent = (req, res, next) => {
    const {escapeRoom} = req;

    models.turno.findAll({
        "where": {"escapeRoomId": req.escapeRoom.id},
        "include": {
            "model": models.user,
            "as": "students"
        }
    }).
        then((turnos) => {
            res.render("turnos/_indexStudent.ejs", {turnos,
                escapeRoom});
        }).
        catch((error) => next(error));
};


// GET /escapeRooms/:escapeRoomId/activarTurno
exports.indexActivarTurno = (req, res, next) => {
    const {escapeRoom} = req;

    models.turno.findAll({"where": {"escapeRoomId": req.escapeRoom.id}}).
        then((turnos) => {
            res.render("turnos/_indexActivarTurno.ejs", {turnos,
                escapeRoom});
        }).
        catch((error) => next(error));
};


// PUT /escapeRooms/:escapeRoomId/activar
exports.activar = (req, res, next) => {
    const {escapeRoom, body} = req;

    models.turno.findAll({"where": {"id": body.turnSelected}}).
        each((turno) => {
            const back = `/escapeRooms/${escapeRoom.id}`;

            turno.status = turno.status === "pending" ? "active" : "finished";
            if (turno.status === "active") {
                turno.startTime = new Date();
                setTimeout(function () {
                    turno.status = "finished";

                    turno.save({"fields": ["status"]}).then(() => {
                        res.redirect(back);
                    }).
                        catch(Sequelize.ValidationError, (error) => {
                            error.errors.forEach(({message}) => req.flash("error", message));
                            res.redirect(back);
                        }).
                        catch((error) => {
                            req.flash("error", `Error desactivando el turno: ${error.message}`);
                            next(error);
                        });
                }, escapeRoom.duration * 60000);
            }

            turno.save({"fields": [
                "startTime",
                "status"
            ]}).then((t) => {
                console.log(t);
                req.flash("success", turno.status === "active" ? "Turno activo." : "Turno desactivado");
                res.redirect(back);
            }).
                catch(Sequelize.ValidationError, (error) => {
                    error.errors.forEach(({message}) => req.flash("error", message));
                    res.redirect(back);
                }).
                catch((error) => {
                    req.flash("error", `Error activando/desactivando el turno: ${error.message}`);
                    next(error);
                });
        }).
        catch((error) => next(error));
};

// POST /escapeRooms/:escapeRoomId/turnos
exports.create = (req, res, next) => {
    const {date, indications} = req.body;
    const modDate = new Date(date);

    console.log(modDate);
    const turn = models.turno.build({"date": modDate,
        indications,
        "escapeRoomId": req.escapeRoom.id});

    const back = `/escapeRooms/${req.escapeRoom.id}/turnos?date=${modDate.getFullYear()}-${modDate.getMonth() + 1}-${modDate.getDate()}`;

    turn.save().
        then(() => {
            req.flash("success", "Turno creado correctamente.");
            res.redirect(back);
        }).
        catch(Sequelize.ValidationError, (error) => {
            error.errors.forEach(({message}) => req.flash("error", message));
            res.redirect(back);
        }).
        catch((error) => {
            req.flash("error", `Error creando el turno: ${error.message}`);
            next(error);
        });
};

// DELETE /escapeRooms/:escapeRoomId/turnos/:turnoId
exports.destroy = (req, res, next) => {
    const modDate = new Date(req.turn.date);

    req.turn.destroy().
        then(() => {
            const back = `/escapeRooms/${req.params.escapeRoomId}/turnos?date=${modDate.getFullYear()}-${modDate.getMonth() + 1}-${modDate.getDate()}`;

            req.flash("success", "Turno borrado correctamente");
            res.redirect(back);
        }).
        catch((error) => next(error));
};

