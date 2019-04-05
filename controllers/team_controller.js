const Sequelize = require("sequelize");
const {models} = require("../models");// Autoload the team with id equals to :teamId

exports.load = (req, res, next, teamId) => {

    models.team.findById(teamId).
        then((team) => {
            if (!team) {
                throw new Error(`No hay equipo con id=${teamId}`);
            } else {
                req.team = team;
                next();
            }
        }).
        catch((error) => next(error));

};

// GET /turnos/:turnoId/teams/new

exports.new = (req, res) => {
    const team = {"name": ""};

    res.render("teams/new", {team});
};


// POST /turnos/:turnId/teams

exports.create = (req, res, next) => {

    const team = models.team.build({"name": req.body.name,
        "turnoId": req.turno.id});

    const back = `/turnos/${req.turno.id}/teams/index`;

    team.save().
        then(() => {
            req.flash("success", "Equipo creado correctamente.");
            res.redirect(back);
        }).
        catch(Sequelize.ValidationError, (error) => {
            error.errors.forEach(({message}) => req.flash("error", message));
            res.redirect(back);
        }).
        catch((error) => {
            req.flash("error", `Error creando el equipo: ${error.message}`);
            next(error);
        });
};

// GET /turnos/:turnoId/teams/index

exports.index = (req, res, next) => {

    models.team.findAll().
        then((teams) => {
            res.render("teams/index.ejs", {teams});
        }).
        catch((error) => next(error));
};

