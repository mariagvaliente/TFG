const {models} = require("../models");


// POST /api/escapeRooms/:escapeRoomId/puzzles/:puzzleId/check
exports.check = (req, res, next) => {
  const {puzzle,  body} = req;
  let {solution, token} = body;
    const where = {};

    if (token) {
        where.username = token;
    } else {
        return res.status(401).end();
    }
    solution = (solution === undefined || solution === null )? "": solution;
    const puzzleSol = (puzzle.sol === undefined | puzzle.sol === null ) ? "" : puzzle.sol;
    if (solution.toLowerCase().trim() === puzzleSol.toLowerCase().trim()) {
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
