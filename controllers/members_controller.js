// PUT /users/:userId/members/:teamId

exports.add = (req, res, next) => {

    console.log("Usuario agregado al team");
    const direccion = req.body.redir || `/users/${req.user.id}/members/${req.team.id}`;


    req.team.addTeamMembers(req.user.id).then(function () {


        res.redirect(direccion);

    }).
        catch(function (error) {

            next(error);

        });

};

// GET /users/:userId/members/:teamId

exports.show = (req, res, next) => {

    req.team.getTeamMembers().then(function (usuarios) {

        usuarios.forEach(function (usuario) {

            usuario.isAdd = true;
        });

        res.render("teams/show", {"usuarios": usuarios, "team": req.team,
            "errors": []});
        }).
        catch(function (error) {

            next(error);

        });

};
