const {models} = require("../models");


// GET /api/escapeRooms/:escapeRoomId/puzzles/:puzzleId/check
exports.check = (req, res, next) => {
    const {puzzle, query} = req;
    const answer = query.answer || "";
    const where = {};

    if (query.id) {
        where.id = query.id;
    } else if (query.username) {
        where.username = `${query.username}@alumnos.upm.es`;
    } else {
        return res.status(401).end();
    }
    if (answer.toLowerCase().trim() === puzzle.sol.toLowerCase().trim()) {
        models.user.findAll({where}).then((users) => {
            if (!users || users.length === 0) {
                res.status(404).send("Usuario no encontrado");
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
                    if (team && team.length > 0) {
                        req.puzzle.addSuperados(team[0].id).then(function () {
                            res.send("Respuesta correcta");
                        }).
                            catch((e) => res.status(500).send(e));
                    } else {
                        res.status(500).send("Ha ocurrido un error. Asegúrate de que te has registrado correctamente en la Escape Room.");
                    }
                });
        }).
            catch((e) => next(e));
    } else {
        res.status(401).send("Respuesta incorrecta");
    }
};
