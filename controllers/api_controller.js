const {models} = require("../models");


// POST /api/escapeRooms/:escapeRoomId/puzzles/:puzzleId/check
exports.check = (req, res, next) => {
    const {puzzle, body} = req;
    const {solution, token} = body;
    const where = {};

    if (token) {
        where.username = token;
    } else {
        return res.status(401).end();
    }
    // eslint-disable-next-line no-undefined
    const answer = solution === undefined || solution === null ? "" : solution;
    // eslint-disable-next-line no-undefined
    const puzzleSol = puzzle.sol === undefined || puzzle.sol === null ? "" : puzzle.sol;

    models.user.findAll({where}).then((users) => {
        if (!users || users.length === 0) {
            res.status(404).send(req.app.locals.user.messages.notFound);
            return;
        }
        users[0].getTeamsAgregados({
            "include": [
                {
                    "model": models.turno,
                    "required": true,
                    "where": {"escapeRoomId": req.escapeRoom.id} // Aquí habrá que añadir las condiciones de si el turno está activo, etc
                }
            ]

        }).
            then((team) => {
                if (answer.toLowerCase().trim() === puzzleSol.toLowerCase().trim()) {
                    if (team && team.length > 0) {
                        if (team[0].turno.status !== "active") {
                            res.status(404)
                            res.send(req.app.locals.i18n.turnos.notActive);
                            return;
                        }

                        req.puzzle.addSuperados(team[0].id).then(function () {
                            res.send(req.app.locals.i18n.puzzle.correctAnswer);
                        }).
                            catch((e) => res.status(500).send(e));
                    } else {
                      res.status(304).send(req.app.locals.i18n.puzzle.correctAnswer + ". " + req.app.locals.i18n.user.messages.ensureRegistered);
                    }
                } else {
                    res.status(401).send(req.app.locals.i18n.puzzle.wrongAnswer);
                }

            });
    }).
        catch((e) => next(e));

};
