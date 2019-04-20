const Sequelize = require("sequelize");
const {models} = require("../models");

// Autoload the team with id equals to :teamId
exports.load = (req, res, next, teamId) => {
    models.team.findById(teamId).
        then((team) => {
            if (!team) {
                throw new Error(`No hay equipo con id=${teamId}`);
            } else {
                req.team = team;
                next();
            }
        }).
        catch((error) => next(error));
};

// GET /turnos/:turnoId/teams/new
exports.new = (req, res) => {
    const team = {"name": ""};

    res.render("teams/new", {team,
        "turno": req.turn});
};


// POST /turnos/:turnId/teams
exports.create = (req, res, next) => {
    const team = models.team.build({"name": req.body.name,
        "turnoId": req.turn.id,
        "members": [req.session.user.id]});

    const back = "/escapeRooms";

    team.save().
        then((teamCreated) => {
            teamCreated.addTeamMembers(req.session.user.id).then(() => {
                req.flash("success", "Team creado correctamente.");
                res.redirect(back);
            });
        }).
        catch(Sequelize.ValidationError, (error) => {
            error.errors.forEach(({message}) => req.flash("error", message));
            res.redirect(back);
        }).
        catch((error) => {
            req.flash("error", `Error creando el equipo: ${error.message}`);
            next(error);
        });
};

// GET /escapeRooms/:escapeRoomId/teams
exports.index = (req, res, next) => {
    const {escapeRoom, query} = req;
    const {turnId} = query;
    const where = {
        "include": [
            {
                "model": models.turno,
                "where": {
                    "escapeRoomId": escapeRoom.id
                }
            },
            {
                "model": models.user,
                "as": "teamMembers",
                "attributes": [
                    "name",
                    "surname"
                ]

            }
        ]
    };

    if (turnId) {
        where.include[0].where.id = turnId;
    }
    models.team.findAll(where).then((teams) => {
        res.render("escapeRooms/teams", {teams,
            escapeRoom,
            turnId});
    }).
        catch((e) => {
            console.error(e);
            next(e);
        });
};

// GET /turnos/:turnoId/teams
exports.indexTurnos = (req, res) => {
    res.render("teams/index", {"turno": req.turn});
};


