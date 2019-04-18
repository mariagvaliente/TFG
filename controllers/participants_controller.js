const {models} = require("../models");// Autoload the user with id equals to :userId
const converter = require("json-2-csv");
const Sequelize = require("sequelize");
const {Op} = Sequelize;

// PUT  /escapeRooms/:escapeRoomId/users/:userId/participants/
exports.add = (req, res, next) => {
    console.log("Marcado como turno");
    const {escapeRoom} = req;
    const direccion = req.body.redir || `/turnos/${req.body.turnSelected}/teams`;


    const options = {
        "attributes": [
            "id",
            "name",
            "surname",
            "gender",
            "username",
            "dni"
        ],
        "include": {
            "model": models.turno,
            "as": "turnosAgregados",
            "duplicating": false,
            "required": true,
            "attributes": [
                "id",
                "date"
            ],
            "where": {
                "escapeRoomId": escapeRoom.id
            }
        }
    }


    if (req.body.turnSelected) {
        options.include.where.id = req.body.turnSelected;
    }

    models.user.findAll(options).
        then((users) => {
            const participants = [];

            users.forEach((user) => {
                const {id, name, gender, username, surname, dni} = user;

                participants.push({
                    id,
                    name,
                    surname,
                    gender,
                    username,
                    dni,
                    "turnId": user.turnosAgregados[0].id,
                    "turnDate": user.turnosAgregados[0].date
                });
            });


            if (participants.length < escapeRoom.nmax) {

                req.user.addTurnosAgregados(req.body.turnSelected).
                    then(function () {
                        res.redirect(direccion);

                    }).
                    catch(function (error) {
                        next(error);
                    });
            } else {
                console.log("Turno completo");
                res.redirect(`/escapeRooms/${escapeRoom.id}/completed`);
            }

        }).
        catch((e) => next(e));

};

// GET /escapeRooms/:escapeRoomId/participants
exports.index = (req, res, next) => {
    const {escapeRoom} = req;
    const options = {
        "attributes": [
            "id",
            "name",
            "surname",
            "gender",
            "username",
            "dni"
        ],
        "include": {
            "model": models.turno,
            "as": "turnosAgregados",
            "duplicating": false,
            "required": true,
            "attributes": [
                "id",
                "date"
            ],
            "where": {
                "escapeRoomId": escapeRoom.id
            },
            "through": {"model": models.participants,
                "attributes": ["attendance"]}
        }
    };

    if (req.query.turnId) {
        options.include.where.id = req.query.turnId;
    }
    if (req.query.orderBy) {
        console.log(req.query.orderBy);
        options.order = [
            [
                req.query.orderBy,
                "ASC"
            ]
        ];
    }
    models.user.findAll(options).then((users) => {
        const participants = [];

        users.forEach((user) => {
            const {id, name, gender, username, surname, dni} = user;

            participants.push({id,
                name,
                surname,
                gender,
                username,
                dni,
                "turnId": user.turnosAgregados[0].id,
                "turnDate": user.turnosAgregados[0].date,
                "attendance": user.turnosAgregados[0].participants.attendance});
        });
        if (req.query.csv) {
            converter.json2csv(
                participants,
                (err, csv) => {
                    if (err) {
                        next(err);
                        return;
                    }
                    res.setHeader("Content-Type", "text/csv");
                    res.setHeader("Content-Disposition", `${"attachment; filename=\"participants-"}${Date.now()}.csv"`);
                    res.write(csv);
                    res.end();
                },
                {
                    "delimiter": {
                        "field": ";"
                    }
                }
            );
        } else {
            res.render("escapeRooms/participants", {escapeRoom,
                participants,
                "turnId": req.query.turnId,
                "orderBy": req.query.orderBy});
        }
    }).
        catch((e) => next(e));
};

// POST /escapeRooms/:escapeRoomId/confirm
exports.confirmAttendance = (req, res) => {
    const turnos = req.escapeRoom.turnos.map((t) => t.id);

    models.participants.update({"attendance": true}, {
        "where": {
            [Op.and]: [
                {"turnId": {[Op.in]: turnos}},
                {"userId": {[Op.in]: req.body.attendance.yes}}
            ]
        }
    }).
        then(() => {
            models.participants.update({"attendance": false}, {
                "where": {
                    [Op.and]: [
                        {"turnId": {[Op.in]: turnos}},
                        {"userId": {[Op.in]: req.body.attendance.no}}
                    ]
                }
            }).then(() => {
                res.end();
            });
        }).
        catch(() => {
            res.status(500);
            res.end();
        });
};
