
const Sequelize = require("sequelize");
const {models} = require("../models");

// Autoload the escape room with id equals to :escapeRoomId
exports.load = (req, res, next, escapeRoomId) => {


    models.escapeRoom.findById(escapeRoomId , { include: [ models.turno ] })
        .then(escapeRoom => {
            if (escapeRoom) {
                req.escapeRoom = escapeRoom;
                next();
            } else {
                throw new Error('There is no escape room with id=' + escapeRoomId);
            }
        })
        .catch(error => next(error));
};

// GET /escapeRooms
exports.index = (req, res, next) => {
    models.escapeRoom.findAll()
        .then(escapeRooms => {
            res.render('escapeRooms/index.ejs', {escapeRooms});
        })
        .catch(error => next(error));
};

// GET /escapeRooms/:escapeRoomId
exports.show = (req, res, next) => {

    const {escapeRoom} = req;

    res.render('escapeRooms/show', {escapeRoom});
};


// GET /escapeRooms/new
exports.new = (req, res, next) => {

    const escapeRoom = {
        title: "",
        teacher:"",
        subject: "",
        duration: "",
        description: "",
        video: "",
        nmax: "",
        invitation: ""
    };

    res.render('escapeRooms/new', {escapeRoom});
};

// POST /escapeRooms/create
exports.create = (req, res, next) => {

    const {title,teacher,subject,duration,description,video,nmax,invitation} = req.body;

    const escapeRoom = models.escapeRoom.build({
        title,
        teacher,
        subject,
        duration,
        description,
        video,
        nmax,
        invitation
    });

    // Saves only the fields question and answer into the DDBB
    escapeRoom.save({fields: ["title", "teacher", "subject", "duration", "description", "video","nmax", "invitation"]})
        .then(escapeRoom => {
            req.flash('success', 'Escape Room created successfully.');
            res.redirect('/escapeRooms/' + escapeRoom.id);

        })
        .catch(Sequelize.ValidationError, error => {
            req.flash('error', 'There are errors in the form:');
            error.errors.forEach(({message}) => req.flash('error', message));
            res.render('escapeRooms/new', {escapeRoom});
        })
        .catch(error => {
            req.flash('error', 'Error creating a new Escape Room: ' + error.message);
            next(error);
        });
};

// GET /escapeRooms/:escapeRoomId/edit
exports.edit = (req, res, next) => {

    const {escapeRoom} = req;

    res.render('escapeRooms/edit', {escapeRoom});
};


// PUT /escapeRooms/:escapeRoomId
exports.update = (req, res, next) => {

    const {escapeRoom, body} = req;

    escapeRoom.title = body.title;
    escapeRoom.teacher = body.teacher;

    escapeRoom.save({fields: ["title", "teacher", "subject", "duration", "description", "video", "nmax", "invitation"]})
        .then(escapeRoom => {
            req.flash('success', 'Escape Room edited successfully.');
            res.redirect('/escapeRooms/' + escapeRoom.id);
        })
        .catch(Sequelize.ValidationError, error => {
            req.flash('error', 'There are errors in the form:');
            error.errors.forEach(({message}) => req.flash('error', message));
            res.render('escapeRooms/edit', {escapeRoom});
        })
        .catch(error => {
            req.flash('error', 'Error editing the Escape Room: ' + error.message);
            next(error);
        });
};


// DELETE /escapeRooms/:escapeRoomId
exports.destroy = (req, res, next) => {

    req.escapeRoom.destroy()
        .then(() => {
            req.flash('success', 'Escape Room deleted successfully.');
            res.redirect('/escapeRooms');
        })
        .catch(error => {
            req.flash('error', 'Error deleting the Escape Room: ' + error.message);
            next(error);
        });
};


