

// PUT /turnos/:turnoId/members/:teamId
exports.add = (req, res, next) => {
    const direccion = req.body.redir || "/escapeRooms";

    req.team.addTeamMembers(req.session.user.id).then(function () {
        res.redirect(direccion);
    }).
        catch(function (error) {
            next(error);
        });
};


