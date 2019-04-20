const Sequelize = require("sequelize");
const {models} = require("../models");

// Autoload the puzzle with id equals to :puzzleId
exports.load = (req, res, next, puzzleId) => {
    models.puzzle.findById(puzzleId).
        then((puzzle) => {
            if (puzzle) {
                req.puzzle = puzzle;
                next();
            } else {
                next(new Error(`There is no puzzle with puzzleId=${puzzleId}`));
            }
        }).
        catch((error) => next(error));
};

// POST /escapeRooms/:escapeRoomId/puzzles/new
exports.create = (req, res, next) => {
    const {escapeRoom, body} = req;
    const {reto} = body;
    const {title, sol, desc, hint} = JSON.parse(reto);
    const puzzle = models.puzzle.build({title,
        sol,
        desc,
        hint,
        "escapeRoomId": escapeRoom.id});

    const back = `/escapeRooms/${req.escapeRoom.id}/puzzles`;

    puzzle.save().
        then(() => {
            req.flash("success", "Reto creado correctamente.");
            res.redirect(back);
        }).
        catch(Sequelize.ValidationError, (error) => {
            error.errors.forEach(({message}) => req.flash("error", message));
            res.redirect(back);
        }).
        catch((error) => {
            req.flash("error", `Error creando el reto: ${error.message}`);
            next(error);
        });
};

// PUT /escapeRooms/:escapeRoomId/puzzles/:puzzleId
exports.update = (req, res, next) => {
    const {body, escapeRoom} = req;
    const {reto} = body;
    const back = `/escapeRooms/${escapeRoom.id}/puzzles`;

    console.log(body);
    const {title, sol, desc, hint} = JSON.parse(reto);

    req.puzzle.title = title;
    req.puzzle.sol = sol;
    req.puzzle.desc = desc;
    req.puzzle.hint = hint;
    req.puzzle.save({"fields": [
        "title",
        "sol",
        "desc",
        "hint"
    ]}).
        then(() => {
            req.flash("success", "Reto modificado correctamente.");
            res.redirect(back);
        }).
        catch(Sequelize.ValidationError, (error) => {
            error.errors.forEach(({message}) => req.flash("error", message));
            res.redirect(back);
        }).
        catch((error) => {
            req.flash("error", `Error modificado el reto: ${error.message}`);
            next(error);
        });
};

// DELETE /escapeRooms/:escapeRoomId/puzzles/:puzzleId
exports.destroy = (req, res, next) => {
    req.puzzle.destroy().
        then(() => {
            const back = `/escapeRooms/${req.escapeRoom.id}/puzzles`;

            req.flash("success", "Reto borrado correctamente");
            res.redirect(back);
        }).
        catch((error) => next(error));
};

// GET /escapeRooms/:escapeRoomId/puzzles/:puzzleId/check
exports.check = (req, res, next) => {
    const {puzzle, query} = req;
    const answer = query.answer || "";

    if (answer.toLowerCase().trim() === puzzle.sol.toLowerCase().trim()) {
        models.user.findById(req.session.user.id).then((user) => {
            user.getTeamsAgregados({
                "include": [
                    {
                        "model": models.turno,
                        "required": true,
                        "where": {"escapeRoomId": req.escapeRoom.id} // Aquí habrá que añadir las condiciones de si el turno está activo, etc
                    }
                ]

            }).
                then((team) => {
                    if (team && team.length > 0) {
                        req.puzzle.addSuperados(team[0].id).then(function () {
                            req.flash("success", "Reto superado!");
                            res.redirect(`/escapeRooms/${req.escapeRoom.id}/retos`);
                        }).
                            catch(function (e) {
                                next(e);
                            });
                    } else {
                        next("Ha ocurrido un error. Asegúrate de que te has registrado correctamente en la Escape Room.");
                    }
                });
        }).
            catch((e) => next(e));
    } else {
        req.flash("error", "Respuesta incorecta");
        res.redirect(`/escapeRooms/${req.escapeRoom.id}/retos`);
    }
};


// GET /escapeRooms/:escapeRoomId/analytics/puzzles/participants
exports.puzzlesByParticipants = (req, res) => {
    const {escapeRoom, query} = req;
    const where = {
        "include": [
            {
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
            },
            {
                "model": models.team,
                "as": "teamsAgregados",
                "include": {
                    "model": models.puzzle,
                    "as": "retos",
                    "through": {"model": models.retosSuperados}
                }
            }
        ]
    };
    const puzzles = escapeRoom.puzzles.map((puz) => puz.id);

    models.user.findAll(where).
        then((users) => {
            const results = users.map((u) => {
                const {id, name, surname} = u;
                const retosSuperados = new Array(puzzles.length).fill(0);

                u.teamsAgregados[0].retos.map((reto) => {
                    const idx = puzzles.indexOf(reto.id);

                    if (idx > -1) {
                        retosSuperados[idx] = 1;
                    }
                });
                return {id,
                    name,
                    surname,
                    retosSuperados};
            });

            res.render("escapeRooms/analytics/retosSuperadosByParticipant", {escapeRoom,
                results});
        });
};

// GET /escapeRooms/:escapeRoomId/analytics/puzzles/teams
exports.puzzlesByTeams = (req, res) => {
    const {escapeRoom, query} = req;
    const where = {
        "include": [
            {
                "model": models.turno,
                "where": {
                    "escapeRoomId": escapeRoom.id
                }
            },
            {
                "model": models.puzzle,
                "as": "retos",
                "through": {"model": models.retosSuperados}
            }
        ]
    };
    const puzzles = escapeRoom.puzzles.map((puz) => puz.id);

    models.team.findAll(where).
        then((teams) => {
            const results = teams.map((u) => {
                const {id, name} = u;
                const retosSuperados = new Array(puzzles.length).fill(0);

                u.retos.map((reto) => {
                    const idx = puzzles.indexOf(reto.id);

                    if (idx > -1) {
                        retosSuperados[idx] = 1;
                    }
                });
                return {id,
                    name,
                    retosSuperados};
            });

            res.render("escapeRooms/analytics/retosSuperadosByTeam", {escapeRoom,
                results});
        });
};
