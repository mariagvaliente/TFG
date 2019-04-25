const Sequelize = require("sequelize");
const {models} = require("../models");


// Autoload the hint with id equals to :hintId
exports.load = (req, res, next, hintId) => {
    models.hint.findById(hintId).
        then((hint) => {
            if (hint) {
                req.hint = hint;
                next();
            } else {
                next(new Error(`There is no hint with hintId=${hintId}`));
            }
        }).
        catch((error) => next(error));
};

// POST /escapeRooms/:escapeRoomId/puzzles/:puzzleId/hints/new
exports.create = (req, res, next) => {
    const {puzzle, body, escapeRoom} = req;
    const {content} = body;
    const hint = models.hint.build({content,
        "puzzleId": puzzle.id});

    const back = `/escapeRooms/${escapeRoom.id}/puzzles`;

    hint.save().
        then(() => {
            req.flash("success", "Pista creada correctamente.");
            res.redirect(back);
        }).
        catch(Sequelize.ValidationError, (error) => {
            error.errors.forEach(({message}) => req.flash("error", message));
            res.redirect(back);
        }).
        catch((error) => {
            req.flash("error", `Error creando la pista: ${error.message}`);
            next(error);
        });
};

// PUT /escapeRooms/:escapeRoomId/hints/:hintId
exports.update = (req, res, next) => {
    const {body, hint, escapeRoom} = req;
    const {content} = body;
    const back = `/escapeRooms/${escapeRoom.id}/puzzles`;

    hint.content = content;
    console.log(hint, content);
    hint.save({"fields": ["content"]}).
        then(() => {
            req.flash("success", "Pista modificada correctamente.");
            res.redirect(back);
        }).
        catch(Sequelize.ValidationError, (error) => {
            error.errors.forEach(({message}) => req.flash("error", message));
            res.redirect(back);
        }).
        catch((error) => {
            req.flash("error", `Error modificando la pista: ${error.message}`);
            next(error);
        });
};

// DELETE /escapeRooms/:escapeRoomId/hints/:hintId
exports.destroy = (req, res, next) => {
    req.hint.destroy().
        then(() => {
            const back = `/escapeRooms/${req.escapeRoom.id}/puzzles`;

            req.flash("success", "Reto borrado correctamente");
            res.redirect(back);
        }).
        catch((error) => next(error));
};

// GET /escapeRooms/:escapeRoomId/hints/hintapp
exports.hintApp = (req, res) => {
    res.render("escapeRooms/hintApp/hintApp", {"layout": false,
        "escapeRoom": req.escapeRoom});
};

// GET /escapeRooms/:escapeRoomId/hints/hintappwrapper
exports.hintAppWrapper = (req, res) => {
    res.render("escapeRooms/hintApp/hintAppScormWrapper", {"layout": false,
        "escapeRoom": req.escapeRoom});
};

exports.requestHint = (req, res) => {
    const {escapeRoom, body} = req;
    const {score, status} = body;
    const success = status === "completed" || status === "passed";

    models.user.findById(req.session.user.id).then((user) => {
        user.getTeamsAgregados({
            "include": [
                {
                    "model": models.turno,
                    "required": true,
                    "where": {"escapeRoomId": escapeRoom.id} // Aquí habrá que añadir las condiciones de si el turno está activo, etc
                }
            ]

        }).
            then((teams) => {
                if (teams && teams.length > 0) {
                    const [team] = teams;

                    if (success) {
                        team.getRetos().then((retosSuperados) => {
                            let currentReto = -1;
                            const puzzleIndexes = escapeRoom.puzzles.map((p) => p.id);

                            for (const p in retosSuperados) {
                                const reto = retosSuperados[p];
                                const idx = puzzleIndexes.indexOf(reto.id);

                                if (idx > currentReto) {
                                    currentReto = idx;
                                }
                            }
                            currentReto++;

                            if (currentReto >= puzzleIndexes.length) {
                                currentReto = -1;
                            } else {
                                currentReto = escapeRoom.puzzles[currentReto].id;
                            }
                            models.requestedHint.findAll({
                                "where": {
                                    "teamId": team.id,
                                    "success": true
                                }
                            }).then((hints) => {
                                const requestedHints = hints.filter((h) => h.id !== null);
                                let currentHint = -1;
                                const allHints = [];
                                const allHintsIndexes = [];
                                const currentRetos = escapeRoom.puzzles.filter((p) => p.id === currentReto);

                                for (const h in currentRetos) {
                                    for (const i in currentRetos[h].hints) {
                                        allHints.push(currentRetos[h].hints[i]);
                                        allHintsIndexes.push(currentRetos[h].hints[i].id);
                                    }
                                }

                                for (const h in requestedHints) {
                                    const hint = requestedHints[h];

                                    const hIndex = allHintsIndexes.indexOf(hint.hintId);

                                    if (hIndex > currentHint) {
                                        currentHint = hIndex;
                                    }
                                }
                                currentHint++;
                                let pista = "No quedan más pistas automáticas para tu situación. Puedes llamar al profesor para que te dé una personalizada.";
                                let hintId = null;

                                if (currentHint < allHintsIndexes.length) {
                                    pista = allHints[currentHint].content;
                                    hintId = allHints[currentHint].id;
                                }

                                models.requestedHint.build({
                                    hintId,
                                    "teamId": team.id,
                                    success,
                                    score
                                }).save().
                                    then(() => {
                                        res.json({"msg": pista, "ok": !!hintId});
                                    });
                            });
                        });
                    } else {
                        models.requestedHint.build({
                            "hintId": null,
                            "teamId": team.id,
                            success,
                            score
                        }).save().
                            then(() => {
                                res.json({"msg": "Lo siento, sigue intentándolo", "ok": false});
                            });
                    }
                } else {
                    res.status(500);
                    res.send({"msg": "Ha ocurrido un error. Asegúrate de que te has registrado correctamente en la Escape Room.", "ok": false});
                }
            });
    }).
        catch((msg) => {
            console.error(msg);
            res.status(500);
            res.send({msg});
        });
};
