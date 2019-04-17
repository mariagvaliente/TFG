const {models} = require("../models");// Autoload the user with id equals to :userId
const converter = require("json-2-csv");
const Sequelize = require("sequelize");
const {Op} = Sequelize;


// PUT /turnos/:turnoId/members/:teamId
exports.add = (req, res, next) => {
    console.log("Usuario agregado al team");
    const direccion = req.body.redir || `/escapeRooms`;
    req.team.addTeamMembers(req.session.user.id).then(function () {
        res.redirect(direccion);

    }).
        catch(function (error) {
            next(error);
        });
};


