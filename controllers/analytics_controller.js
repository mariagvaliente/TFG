const Sequelize = require("sequelize");
const {models} = require("../models");

// GET /escapeRooms/:escapeRoomId/analytics
exports.analytics = (req, res) => {
    const {escapeRoom} = req;

    res.render("escapeRooms/analytics/analytics", {escapeRoom});
};

// GET /escapeRooms/:escapeRoomId/analytics/puzzles/participants
exports.puzzlesByParticipants = (req, res) => {
    const {escapeRoom, query} = req;
    const {turnId, orderBy} = query;
    const options = {
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

    if (turnId) {
        options.include[0].where.id = turnId;
    }
    if (orderBy) {
        options.order = Sequelize.literal(`lower(user.${orderBy}) ASC`);
    }
    const puzzles = escapeRoom.puzzles.map((puz) => puz.id);

    models.user.findAll(options).
        then((users) => {
            const results = users.map((u) => {
                const {id, name, surname} = u;
                const retosSuperados = new Array(puzzles.length).fill(0);

                u.teamsAgregados[0].retos.map((reto) => {
                    const idx = puzzles.indexOf(reto.id);

                    if (idx > -1) {
                        retosSuperados[idx] = 1;
                    }
                    return 0;
                });
                return {id,
                    name,
                    surname,
                    retosSuperados};
            });

            res.render("escapeRooms/analytics/retosSuperadosByParticipant", {escapeRoom,
                results,
                turnId,
                orderBy});
        });
};

// GET /escapeRooms/:escapeRoomId/analytics/puzzles/teams
exports.puzzlesByTeams = (req, res) => {
    const {escapeRoom, query} = req;
    const {turnId} = query;
    const options = {
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
        ],
        "order": Sequelize.literal("lower(team.name) ASC")
    };

    if (turnId) {
        options.include[0].where.id = turnId;
    }
    const puzzles = escapeRoom.puzzles.map((puz) => puz.id);

    models.team.findAll(options).
        then((teams) => {
            const results = teams.map((u) => {
                const {id, name} = u;
                const retosSuperados = new Array(puzzles.length).fill(0);

                u.retos.map((reto) => {
                    const idx = puzzles.indexOf(reto.id);

                    if (idx > -1) {
                        retosSuperados[idx] = 1;
                    }
                    return 0;
                });
                return {id,
                    name,
                    retosSuperados,
                    turnId};
            });

            res.render("escapeRooms/analytics/retosSuperadosByTeam", {escapeRoom,
                results,
                turnId});
        });
};


exports.summary = (req, res) => {
    res.render("escapeRooms/analytics/summary");
};
exports.ranking = (req, res) => {
    res.render("escapeRooms/analytics/ranking");
};
exports.timeline = (req, res) => {
    res.render("escapeRooms/analytics/timeline");
};
