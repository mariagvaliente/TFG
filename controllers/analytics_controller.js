const Sequelize = require("sequelize");
const {models} = require("../models");
const converter = require("json-2-csv");

// GET /escapeRooms/:escapeRoomId/analytics
exports.analytics = (req, res) => {
    const {escapeRoom} = req;

    res.render("escapeRooms/analytics/analytics", {escapeRoom});
};

// GET /escapeRooms/:escapeRoomId/analytics/puzzles/participants
exports.puzzlesByParticipants = (req, res, next) => {
    const {escapeRoom, query} = req;
    const {turnId, orderBy, csv} = query;
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
    const puzzleNames = escapeRoom.puzzles.map((puz) => puz.title);

    models.user.findAll(options).
        then((users) => {
            const results = users.map((u) => {
                const {id, name, surname, dni, username} = u;
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
                    dni,
                    username,
                    retosSuperados,
                    "total": Math.round(retosSuperados.filter((r) => r === 1).length * 10000 / retosSuperados.length) / 100};
            });

            if (!csv) {
                res.render("escapeRooms/analytics/retosSuperadosByParticipant", {escapeRoom,
                    results,
                    turnId,
                    orderBy});
            } else {
                const resultsCsv = results.map((rslt) => {
                    const {name, surname, dni, username, retosSuperados, total} = rslt;
                    const rs = {};

                    for (const r in retosSuperados) {
                        rs[puzzleNames[r]] = retosSuperados[r];
                    }
                    return {
                        name,
                        surname,
                        dni,
                        username,
                        ...rs,
                        total
                    };
                });

                converter.json2csv(
                    resultsCsv,
                    (err, csvText) => {
                        if (err) {
                            next(err);
                            return;
                        }
                        res.setHeader("Content-Type", "text/csv");
                        res.setHeader("Content-Disposition", `${"attachment; filename=\"results-"}${Date.now()}.csv"`);
                        res.write(csvText);
                        res.end();
                    },
                    {
                        "delimiter": {
                            "field": ";"
                        }
                    }
                );
            }
        }).
        catch((e) => {
            console.error(e);
            if (csv) {
                res.send("Error");
            } else {
                next("Ha ocurrido un error");
            }
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

// GET /escapeRooms/:escapeRoomId/analytics/summary
exports.summary = (req, res) => {
    res.render("escapeRooms/analytics/summary");
};

// GET /escapeRooms/:escapeRoomId/analytics/ranking
exports.ranking = (req, res, next) => {
    const {escapeRoom, query} = req;
    const {turnId} = query;
    const isPg = process.env.APP_NAME;
    const options = {

        "attributes": [
            "name",
            [
                Sequelize.fn("MAX", 
                    Sequelize.col( isPg ?'"retos->retosSuperados"."createdAt"':'`retos->retosSuperados`.`createdAt`')),
                "latestretosuperado"
            ],
            [
                Sequelize.fn("COUNT", 
                    Sequelize.col( isPg ?'"retos->retosSuperados"."puzzleId"':'`retos->retosSuperados`.`puzzleId`')),
                "countretos"
            ],
            [
               Sequelize.fn("STRING_AGG", 
                   Sequelize.col( isPg ?'"retos->retosSuperados"."createdAt"':'`retos->retosSuperados`.`createdAt`')),
               "rca"
            ],
            [
               Sequelize.fn("STRING_AGG", 
                   Sequelize.col( isPg ?'"retos->retosSuperados"."updatedAt"':'`retos->retosSuperados`.`updatedAt`')),
               "rua"
            ],
            [
               Sequelize.fn("STRING_AGG", 
                   Sequelize.col( isPg ?'"retos->retosSuperados"."puzzleId"':'`retos->retosSuperados`.`puzzleId`')),
               "rpi"
            ],
            [
               Sequelize.fn("STRING_AGG", 
                   Sequelize.col( isPg ?'"retos->retosSuperados"."teamId"':'`retos->retosSuperados`.`teamId`')),
               "rti"
            ],
            [
               Sequelize.fn("STRING_AGG", 
                   Sequelize.col( isPg ?'"teamMembers->members"."teamId"':'`teamMembers->members`.`teamId`')),
               "tti"
            ],
      
        ],
        "group": [
            "team.id",
             "teamMembers.id",
            
        ],
        "include": [
            {
                "model": models.user,
                "as": "teamMembers",
                includeIgnoreAttributes: false,
                "attributes": ['name',"surname"],
                "duplicating": true,
                "through": {
                    "model": models.members,
                    "attributes": []
                }
            },
            {
                "model": models.turno,
                "duplicating": true,
                "attributes": [
                    "id",
                    "date",
                    "startTime"
                ],
                "where": {
                    "status": {[Sequelize.Op.not]: "pending"},
                    "escapeRoomId": escapeRoom.id
                }
            },
            {
                "model": models.puzzle,
                "attributes": [],
                "as": "retos",
                "required": false,
                "duplicating": true,
                includeIgnoreAttributes: false,
                "through": {
                    "model": models.retosSuperados,
                    "attributes": [],
                    "required": true,
                    "duplicating": true,

                }
            }
        ],
        "order": [
            Sequelize.literal("countretos DESC"),
            Sequelize.literal("latestretosuperado ASC")
        ]
    };

   /* if (isPg) {
        options.attributes = [...options.attributes,
         
         [Sequelize.literal(`STRING_AGG("retos->retosSuperados"."createdAt",'')`), 'ca'],
         [Sequelize.literal(`STRING_AGG("retos->retosSuperados"."updatedAt",'')`), 'ua'],
         [Sequelize.literal(`STRING_AGG("retos->retosSuperados"."puzzleId",'')`), 'pi'],
         [Sequelize.literal(`STRING_AGG("retos->retosSuperados"."teamId",'')`), 'ti']

         [Sequelize.literal(`STRING_AGG("teamMembers->members"."createdAt",'')`), 'tca'],
         [Sequelize.literal(`STRING_AGG("teamMembers->members"."updatedAt",'')`), 'tua'],
         [Sequelize.literal(`STRING_AGG("teamMembers->members"."teamId",'')`), 'tti'],
         [Sequelize.literal(`STRING_AGG("teamMembers->members"."userId",'')`), 'tui'],
        ]
    }*/
    if (turnId) {
        options.include[1].where.id = turnId;
    }
    models.team.findAll(options).
        then((teams) => res.json(teams)/*res.render("escapeRooms/analytics/ranking", {teams,
            escapeRoom,
            turnId})*/).
        catch((e) => next(e));
};

// GET /escapeRooms/:escapeRoomId/analytics/timeline
exports.timeline = (req, res) => {
    res.render("escapeRooms/analytics/timeline");
};
