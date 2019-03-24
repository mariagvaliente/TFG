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
    const hint = models.hint.build({
        content,
        "puzzleId": puzzle.id
    });

    const back = `/escapeRooms/${escapeRoom.id}/step3`;

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
    const back = `/escapeRooms/${escapeRoom.id}/step3`;

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

            const back = `/escapeRooms/${req.escapeRoom.id}/step3`;

            req.flash("success", "Reto borrado correctamente");
            res.redirect(back);

        }).
        catch((error) => next(error));

};
