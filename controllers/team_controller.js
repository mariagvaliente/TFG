const Sequelize = require("sequelize");
const {models} = require("../models");


// Autoload the team with id equals to :teamId
exports.load = (req, res, next, teamId) => {

    models.team.findById(teamId
    ).
        then((team) => {

            if (team) {

                req.team = team;
                next();

            } else {

                req.flash("error", `No existe equipo con id=${teamId}.`);
                throw new Error(`No existe teamId=${teamId}`);

            }

        }).
        catch((error) => next(error));

};


// GET /users/:userId/teams/new

exports.new = (req, res) => {

    const team = {
        "name": ""
    };

    res.render("teams/new", {team});

};


// POST /teams

exports.create = (req, res, next) => {

    const {name} = req.body;
    const team = models.team.build({
        name
    });

    const back = `/users/${req.session.user.id}/teams/index`;


    team.save().
        then(() => {

            req.flash("success", "Team creado correctamente.");
            res.redirect(back);
        }).
        catch(Sequelize.ValidationError, (error) => {

            error.errors.forEach(({message}) => req.flash("error", message));
            res.redirect(back);

        }).
        catch((error) => {

            req.flash("error", `Error creando el team: ${error.message}`);
            next(error);

        });


};

// GET /users/:userId/teams/index

exports.index = (req, res, next) => {

    models.team.findAll().
        then((teams) => {

            res.render("teams/index.ejs", {teams});

        }).
        catch((error) => next(error));

};

