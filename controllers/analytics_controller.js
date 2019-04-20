const {models} = require("../models");

// GET /escapeRooms/:escapeRoomId/analytics
exports.analytics = (req, res) => {
    const {escapeRoom} = req;

    res.render("escapeRooms/analytics/analytics", {escapeRoom});
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
