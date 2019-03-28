// PUT /users/:userId/members/

exports.add = (req, res, next) => {

    console.log("Marcado como team");
    const direccion = req.body.redir || `/users/${req.user.id}/teams/index`;


    req.user.addTeamsAgregados(req.team.id).then(function () {


        res.redirect(direccion);

    }).
        catch(function (error) {

            next(error);

        });

};
