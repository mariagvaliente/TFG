// PUT /users/:userId/participants/:turnId

exports.add = (req, res, next) => {

    console.log("Marcado como turno");
    const direccion = req.body.redir || `/users/${req.user.id}/participants`;

    req.user.addTurnosAgregados(req.turn).then(function () {

        res.redirect(direccion);

    }).
        catch(function (error) {

            next(error);

        });

};

// GET /users/:userId/participants

exports.show = function (req, res, next) {

    console.log("show participants");

    req.user.getTurnosAgregados().then(function (turnos) {

        turnos.forEach(function (turno) {

            turno.isAdd = true;
             console.log("turno");
        });
        res.render("turnos/_indexStudent.ejs", {"turnos": turnos,
            "errors": []});

    }).
        catch(function (error) {

            next(error);

        });
};


