const Sequelize = require("sequelize");
const {models} = require("../models");// Autoload the user with id equals to :userId

exports.load = (req, res, next, userId) => {
    models.user.findById(userId).
        then((user) => {
            if (user) {
                req.user = user;
                next();
            } else {
                req.flash("error", `No existe usuario con id=${userId}.`);
                throw new Error(`No existe userId=${userId}`);
            }
        }).
        catch((error) => next(error));
};


// GET /users/:userId
exports.show = (req, res) => {
    const {user} = req;

    res.render("users/show", {user});
};


// GET /users/new
exports.new = (req, res) => {
    const user = {"name": "",
        "surname": "",
        "gender": "",
        "dni": "",
        "username": "",
        "password": ""};

    res.render("index", {user,
        "register": true});
};


// POST /users
exports.create = (req, res, next) => {
    const {name, surname, gender, username, password, dni} = req.body,

        studentRegex = /(@alumnos\.upm\.es)/,
        teacherRegex = /(@upm\.es)/,
        user = models.user.build({name,
            surname,
            gender,
            "username": (username || "").toLowerCase(),
            "dni": (dni || "").toLowerCase(),
            password}),
        isStudent = user.username.match(studentRegex),
        isTeacher = user.username.match(teacherRegex);

    user.isStudent = Boolean(isStudent);
    if (!isStudent && !isTeacher) {
        req.flash("error", "Debes registrarte con tu cuenta de correo de la UPM");
        res.render("index", {user,
            "register": true});
        return;
    }
    console.log(user);

    // Save into the data base
    user.save({"fields": [
        "name",
        "surname",
        "gender",
        "username",
        "dni",
        "password",
        "isStudent",
        "salt"
    ]}).
        then(() => { // Render the users page
            req.flash("success", "Usuario creado con éxito.");
            res.redirect("/"); // Redirection
        }).
        catch(Sequelize.UniqueConstraintError, (error) => {
            console.error(error);
            req.flash("error", `El usuario "${username}" ya existe`);
            res.render("index", {user,
                "register": true});
        }).
        catch(Sequelize.ValidationError, (error) => {
            error.errors.forEach(({message}) => req.flash("error", message));
            res.render("index", {user,
                "register": true});
        }).
        catch((error) => next(error));
};


// GET /users/:userId/edit
exports.edit = (req, res) => {
    const {user} = req;

    res.render("users/edit", {user});
};


// PUT /users/:userId
exports.update = (req, res, next) => {
    const {user, body} = req;
    // User.username  = body.user.username; // edition not allowed

    user.password = body.password;
    user.name = body.name;
    user.surname = body.surname;
    user.gender = body.gender;
    user.password = body.password;

    // Password can not be empty
    if (!body.password) {
        req.flash("error", "Es obligatorio introducir una contraseña");

        return res.render("users/edit", {user});
    }
    user.save({"fields": [
        "password",
        "salt",
        "name",
        "surname",
        "gender"
    ]}).
        then((user_saved) => {
            req.flash("success", "Usuario actualizado correctamente");
            res.redirect(`/users/${user_saved.id}/escapeRooms`);
        }).
        catch(Sequelize.ValidationError, (error) => {
            error.errors.forEach(({message}) => req.flash("error", message));
            res.render("users/edit", {user});
        }).
        catch((error) => next(error));
};


// DELETE /users/:userId
exports.destroy = (req, res, next) => {
    req.user.destroy().
        then(() => {
            // Deleting logged user.
            if (req.session.user && req.session.user.id === req.user.id) {
                // Close the user session
                delete req.session.user;
            }

            req.flash("success", "Usuario borrado correctamente");
            res.redirect("/goback");
        }).
        catch((error) => next(error));
};

exports.index = (req, res, next) => {
    models.user.count().
        then(() => {
            const findOptions = {"order": ["username"]};

            return models.user.findAll(findOptions);
        }).
        then((users) => {
            res.render("users/index", {users});
        }).
        catch((error) => next(error));
};
