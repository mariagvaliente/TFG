const Sequelize = require("sequelize");
const {models} = require("../models");// Autoload the puzzle with id equals to :puzzleId

exports.load = (req, res, next, puzzleId) => {
    models.puzzle.findById(puzzleId).
        then((puzzle) => {
            if (puzzle) {
                req.puzzle = puzzle;
                next();
            } else {
                next(new Error(`There is no puzzle with puzzleId=${puzzleId}`));
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
        then((puz) => {
            console.log("*******************************");
            console.log(puz);
            req.flash("success", "Reto creado correctamente.");
            res.redirect(back);
        }).
        catch(Sequelize.ValidationError, (error) => {
            error.errors.forEach(({message}) => req.flash("error", message));
            res.redirect(back);
        }).
        catch((error) => {
            req.flash("error", `Error creando el reto: ${error.message}`);
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
            req.flash("success", "Reto modificado correctamente.");
            res.redirect(back);
        }).
        catch(Sequelize.ValidationError, (error) => {
            error.errors.forEach(({message}) => req.flash("error", message));
            res.redirect(back);
        }).
        catch((error) => {
            req.flash("error", `Error modificado el reto: ${error.message}`);
            next(error);
        });
};

// DELETE /escapeRooms/:escapeRoomId/puzzles/:puzzleId
exports.destroy = (req, res, next) => {
    req.puzzle.destroy().
        then(() => {
            const back = `/escapeRooms/${req.escapeRoom.id}/puzzles`;

            req.flash("success", "Reto borrado correctamente");
            res.redirect(back);
        }).
        catch((error) => next(error));
};

// GET /escapeRooms/:escapeRoomId/puzzles/:puzzleId/check
exports.check = (req, res, next) => {

    const {puzzle, query} = req;

    const answer = query.answer || "";

   if (answer.toLowerCase().trim() === puzzle.sol.toLowerCase().trim()){
       console.log("Reto superado");

      // const direccion = req.body.redir || `/escapeRooms`;
       /*
       req.puzzle.addSuperados(req.team.id).then(function () {
           res.redirect(direccion);
       }).
           catch(function (error) {
               next(error);
           });
           */
   } else {
       console.log("Reto no superado");
       res.redirect(`/escapeRooms/${req.escapeRoom.id}/retos`);
   }
};
