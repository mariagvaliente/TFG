// PUT /users/:userId/participants/

exports.add = (req, res, next) => {

    console.log("Marcado como turno");
    const direccion = req.body.redir || `/users/${req.user.id}/teams/index`;
    req.user.addTurnosAgregados(req.body.turnSelected).then(function () {

        res.redirect(direccion);

    }).
        catch(function (error) {

            next(error);

        });

};


