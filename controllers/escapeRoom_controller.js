
const Sequelize = require("sequelize");
const {models} = require("../models");

// Autoload the escape room with id equals to :escapeRoomId
exports.load = (req, res, next, escapeRoomId) => {

    models.escapeRoom.findById(escapeRoomId)
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
        teacher: "",
        subject: "",
        duration: "",
        description: "",
        video: "",
        invitation: ""
    };

    res.render('escapeRooms/new', {escapeRoom});
};

// POST /escapeRooms/create
exports.create = (req, res, next) => {

    const {title,teacher,subject,duration,description,video,invitation} = req.body;

    const escapeRoom = models.escapeRoom.build({
        title,
        teacher,
        subject,
        duration,
        description,
        video,
        invitation
    });

    // Saves only the fields into the DDBB
    escapeRoom.save({fields: ["title","teacher","subject","duration","description","video","invitation"]})
        .then(escapeRoom => {
            req.flash('success', 'Escape room created successfully.');
            res.redirect('/escapeRooms/' + escapeRoom.id);
        })
        .catch(Sequelize.ValidationError, error => {
            req.flash('error', 'There are errors in the form:');
            error.errors.forEach(({message}) => req.flash('error', message));
            res.render('escapeRooms/new', {escapeRoom});
        })
        .catch(error => {
            req.flash('error', 'Error creating a new escape room: ' + error.message);
            next(error);
        });
};


