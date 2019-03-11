const Sequelize = require("sequelize");
const {models} = require("../models");

// Autoload the turn with id equals to :turnId
exports.load = (req, res, next, turnId) => {

    models.turno.findById(turnId).
        then((turn) => {

            if (turn) {

                req.turn = turn;
                next();

            } else {

                next(new Error(`There is no tip with turnId=${turnId}`));

            }

        }).
        catch((error) => next(error));

};

// POST /escapeRooms/:escapeRoomId/turnos
exports.create = (req, res, next) => {

    const turn = models.turno.build({
        "date": req.body.date,
        "start": req.body.start,
        "duration": req.body.durantion,
        "narrative": req.body.narrative,
        "escapeRoomId": req.escapeRoom.id
    });

    turn.save().
        then(() => {

            req.flash("success", "Turn created successfully.");
            res.redirect("back");

        }).
        catch(Sequelize.ValidationError, (error) => {

            error.errors.forEach(({message}) => req.flash("error", message));
            res.redirect("back");

        }).
        catch((error) => {

            req.flash("error", `Error creating the new turn: ${error.message}`);
            next(error);

        });

};

// DELETE /escapeRooms/:escapeRoomId/turnos/:turnoId
exports.destroy = (req, res, next) => {

    req.turn.destroy().
        then(() => {

            req.flash("success", "turn deleted successfully.");
            res.redirect(`/escapeRooms/${req.params.escapeRoomId}`);

        }).
        catch((error) => next(error));

};


