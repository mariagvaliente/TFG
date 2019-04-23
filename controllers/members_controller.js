

// PUT /escapeRooms/:escapeRoomId/turnos/:turnoId/members/:teamId
exports.add = (req, res, next) => {
    const direccion = req.body.redir || "/escapeRooms";
    const {escapeRoom} = req;

    req.team.getTeamMembers().then(function (members) {
        if (members.length < escapeRoom.teamSize){
            req.team.addTeamMembers(req.session.user.id).then(function () {
                res.redirect(direccion);
            }).
                catch(function (error) {
                    next(error);
                });
        } else {
            req.flash("error", "Equipo completo. Por favor, elige otro equipo.");
            res.redirect(`/escapeRooms/${escapeRoom.id}/turnos/${req.turn.id}/teams`);
        }
    }).
        catch((e) => next(e));


};


