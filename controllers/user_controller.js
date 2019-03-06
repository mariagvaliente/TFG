

const Sequelize = require("sequelize");
const {models} = require("../models");


// Autoload the user with id equals to :userId
exports.load = (req, res, next, userId) => {

    models.user.findById(userId).
        then((user) => {

            if (user) {

                req.user = user;
                next();

            } else {

                req.flash("error", `There is no user with id=${userId}.`);
                throw new Error(`No exist userId=${userId}`);

            }

        }).
        catch((error) => next(error));

};


// GET /users/:userId
exports.show = (req, res) => {

    const {user} = req;

    res.render("users/show", {user});

};

// GET /users/:userId/student

exports.student = (req, res) => {

    const {user} = req;

    res.render("users/student", {user});

};


// GET /users/new
exports.new = (req, res) => {

    const user = {
        "name": "",
        "surname": "",
        "gender": "",
        "username": "",
        "password": ""
    };

    res.render("index", {user,
        "register": true});

};


// POST /users
exports.create = (req, res, next) => {

    const {name, surname, gender, username, password} = req.body,

        user = models.user.build({
            name,
            surname,
            gender,
            username,
            password
        }),

        expresion = /(@upm\.es)/,
        hallado = user.username.match(expresion);

    console.log(hallado);

    user.isStudent = !hallado;

    console.log(user);

    // Save into the data base
    user.save({"fields": [
        "name",
        "surname",
        "gender",
        "username",
        "password",
        "isStudent",
        "salt"
    ]}).
        then(() => { // Render the users page

            req.flash("success", "User created successfully.");
            res.redirect("/"); // Redirection

        }).
        catch(Sequelize.UniqueConstraintError, (error) => {

            console.error(error);
            req.flash("error", `User "${username}" already exists.`);
            res.render("index", {user,
                "register": true});

        }).
        catch(Sequelize.ValidationError, (error) => {

            req.flash("error", "There are errors in the form:");
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

    // Password can not be empty
    if (!body.password) {

        req.flash("error", "Password field must be filled in.");

        return res.render("users/edit", {user});

    }

    user.save({"fields": [
        "password",
        "salt"
    ]}).
        then((user_saved) => {

            req.flash("success", "User updated successfully.");
            res.redirect(`/users/${user_saved.id}`);

        }).
        catch(Sequelize.ValidationError, (error) => {

            req.flash("error", "There are errors in the form:");
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

            req.flash("success", "User deleted successfully.");
            res.redirect("/goback");

        }).
        catch((error) => next(error));

};
