const Sequelize = require("sequelize");
const {models} = require("../models");

// Autoload the puzzle with id equals to :puzzleId
exports.load = (req, res, next, puzzleId) => {
    models.puzzle.findByPk(puzzleId).
        then((puzzle) => {
            if (puzzle) {
                req.puzzle = puzzle;
                next();
            } else {
                next(new Error(404));
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
            req.flash("success", req.app.locals.i18n.common.flash.successCreatingPuzzle);
            res.redirect(back);
        }).
        catch(Sequelize.ValidationError, (error) => {
            error.errors.forEach(({message}) => req.flash("error", message));
            res.redirect(back);
        }).
        catch((error) => {
            req.flash("error", `${req.app.locals.i18n.common.flash.errorCreatingPuzzle}: ${error.message}`);
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
            req.flash("success", req.app.locals.i18n.common.flash.successEditingPuzzle);
            res.redirect(back);
        }).
        catch(Sequelize.ValidationError, (error) => {
            error.errors.forEach(({message}) => req.flash("error", message));
            res.redirect(back);
        }).
        catch((error) => {
            req.flash("error", `%{req.app.locals.i18n.common.flash.errorEditingPuzzle}: ${error.message}`);
            next(error);
        });
};

// DELETE /escapeRooms/:escapeRoomId/puzzles/:puzzleId
exports.destroy = (req, res, next) => {
    req.puzzle.destroy().
        then(() => {
            const back = `/escapeRooms/${req.escapeRoom.id}/puzzles`;

            req.flash("success", req.app.locals.i18n.common.flash.errorDeletingPuzzle);
            res.redirect(back);
        }).
        catch((error) => next(error));
};

// GET /escapeRooms/:escapeRoomId/puzzles/:puzzleId/check
exports.check = (req, res, next) => {
    const {puzzle, query} = req;
    const answer = query.answer || "";

    if (answer.toLowerCase().trim() === puzzle.sol.toLowerCase().trim()) {
        models.user.findByPk(req.session.user.id).then((user) => {
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
                            req.flash("success", req.app.locals.i18n.puzzle.correctAnswer);
                            res.redirect(`/escapeRooms/${req.escapeRoom.id}/play`);
                        }).
                            catch(function (e) {
                                next(e);
                            });
                    } else {
                        next(req.app.locals.i18n.user.messages.ensureRegistered);
                    }
                });
        }).
            catch((e) => next(e));
    } else {
        req.flash("error", req.app.locals.i18n.puzzle.wrongAnswer);
        res.redirect(`/escapeRooms/${req.escapeRoom.id}/play`);
    }
};


