const Sequelize = require("sequelize");
const {models} = require("../models");

// Autoload the turn with id equals to :turnId
exports.load = (req, res, next, turnId) => {

    const options = {"include": []};

    if (req.session.user) {
        options.include.push({"model": models.user,
            "as": "participantes",
            "where": {"id": req.session.user.id},
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

// GET /escapeRooms/:escapeRoomId/turnos
exports.indexStudent = (req, res, next) => {

    models.turno.findAll().
        then((turnos) => {

            res.render("turnos/_indexStudent.ejs", {turnos});

        }).
        catch((error) => next(error));

    turn.save(["participantId"]).
        then(() => {

            req.flash("success", "Participant added successfully.");
            res.redirect(`/escapeRoom/${req.params.escapeRoomId}/join`);

        }).
        catch((error) => {

            req.flash("error", `Error adding the participant: ${error.message}`);
            next(error);

        });

};


// POST /escapeRooms/:escapeRoomId/turnos
exports.create = (req, res, next) => {

    const {date, indications} = req.body;
    const modDate = new Date(date);
    const turn = models.turno.build({
        "date": modDate,
        indications,
        "escapeRoomId": req.escapeRoom.id
    });

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


