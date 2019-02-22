
const Sequelize = require("sequelize");
const {models} = require("../models");
const cloudinary = require('cloudinary');
const fs = require('fs');
const attHelper = require("../helpers/attachments");


// Options for the files uploaded to Cloudinary
const cloudinary_upload_options = {
    async: true,
    folder: '/tfg/escapeRoom/attachments',
    resource_type: 'auto',
    tags: ['tfg', 'escapeRoom']
};



// Autoload the escape room with id equals to :escapeRoomId
exports.load = (req, res, next, escapeRoomId) => {


    models.escapeRoom.findById(escapeRoomId , { include: [ models.turno, models.attachment, {model: models.user, as: 'author'} ] })
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

// MW that allows actions only if the user logged in is admin or is the author of the escape room.
exports.adminOrAuthorRequired = (req, res, next) => {

    const isAdmin  = !!req.session.user.isAdmin;
    const isAuthor = req.escapeRoom.authorId === req.session.user.id;

    if (isAdmin || isAuthor) {
        next();
    } else {
        console.log('Prohibited operation: The logged in user is not the author of the escape room, nor an administrator.');
        res.send(403);
    }
};


// GET /escapeRooms
exports.index = (req, res, next) => {


    let countOptions = {
        where: {}
    };

    // If there exists "req.user", then only the escape rooms of that user are shown
    if (req.user) {
        countOptions.where.authorId = req.user.id;
    }

    models.escapeRoom.count(countOptions)
        .then(count => {

            const findOptions = {
                ...countOptions,
                include : [
                    models.attachment,
                    {model: models.user, as: 'author'}
                ]
            };
            return models.escapeRoom.findAll(findOptions);
        })
        .then(escapeRooms => {
            res.render('escapeRooms/index.ejs', {escapeRooms, cloudinary});
        }).catch(error => next(error));
};

// GET /escapeRooms/:escapeRoomId
exports.show = (req, res, next) => {

    const {escapeRoom} = req;

    res.render('escapeRooms/show', {escapeRoom, cloudinary});
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

    const authorId = req.session.user && req.session.user.id || 0;

    const escapeRoom = models.escapeRoom.build({
        title,
        teacher,
        subject,
        duration,
        description,
        video,
        nmax,
        invitation,
        authorId
    });

    // Saves only the fields question and answer into the DDBB
    escapeRoom.save({fields: ["title", "teacher", "subject", "duration", "description", "video","nmax", "invitation", "authorId"]})
        .then(escapeRoom => {
            req.flash('success', 'Escape Room created successfully.');

            if (!req.file) {
                req.flash('info', 'Escape Room without attachment.');
                res.redirect('/escapeRooms/' + escapeRoom.id);
                return;
            }

            // Save the attachment into  Cloudinary
            return attHelper.checksCloudinaryEnv()
                .then(() => {
                    return attHelper.uploadResourceToCloudinary(req.file.path, cloudinary_upload_options);
                })
                .then(uploadResult => {

                    // Create the new attachment into the data base.
                    return models.attachment.create({
                        public_id: uploadResult.public_id,
                        url: uploadResult.url,
                        filename: req.file.originalname,
                        mime: req.file.mimetype,
                        escapeRoomId: escapeRoom.id })
                        .then(attachment => {
                            req.flash('success', 'Image saved successfully.');
                        })
                        .catch(error => { // Ignoring validation errors
                            req.flash('error', 'Failed to save file: ' + error.message);
                            cloudinary.api.delete_resources(uploadResult.public_id);
                        });

                })
                .catch(error => {
                    req.flash('error', 'Failed to save attachment: ' + error.message);
                })
                .then(() => {
                    fs.unlink(req.file.path); // delete the file uploaded at./uploads
                    res.redirect('/escapeRooms/' + escapeRoom.id);
                });

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
    escapeRoom.subject = body.subject;
    escapeRoom.duration = body.duration;
    escapeRoom.description = body.description;
    escapeRoom.video = body.video;
    escapeRoom.nmax = body.nmax;
    escapeRoom.invitation = body.invitation;

    escapeRoom.save({fields: ["title", "teacher", "subject", "duration", "description", "video", "nmax", "invitation"]})
        .then(escapeRoom => {
            req.flash('success', 'Escape Room edited successfully.');

            if (!body.keepAttachment) {

                // There is no attachment: Delete old attachment.
                if (!req.file) {
                    req.flash('info', 'This Escape Room has no attachment.');
                    if (escapeRoom.attachment) {
                        cloudinary.api.delete_resources(escapeRoom.attachment.public_id);
                        escapeRoom.attachment.destroy();
                    }
                    return;
                }

                // Save the new attachment into Cloudinary:
                return attHelper.checksCloudinaryEnv()
                    .then(() => {
                        return attHelper.uploadResourceToCloudinary(req.file.path, cloudinary_upload_options);
                    })
                    .then(function (uploadResult) {

                        // Remenber the public_id of the old image.
                        const old_public_id = escapeRoom.attachment ? escapeRoom.attachment.public_id : null;

                        // Update the attachment into the data base.
                        return escapeRoom.getAttachment()
                            .then(function(attachment) {
                                if (!attachment) {
                                    attachment = models.attachment.build({ escapeRoomId: escapeRoom.id });
                                }
                                attachment.public_id = uploadResult.public_id;
                                attachment.url = uploadResult.url;
                                attachment.filename = req.file.originalname;
                                attachment.mime = req.file.mimetype;
                                return attachment.save();
                            })
                            .then(function(attachment) {
                                req.flash('success', 'Image saved successfully.');
                                if (old_public_id) {
                                    cloudinary.api.delete_resources(old_public_id);
                                }
                            })
                            .catch(function(error) { // Ignoring image validation errors
                                req.flash('error', 'Failed saving new image: '+error.message);
                                cloudinary.api.delete_resources(uploadResult.public_id);
                            });


                    })
                    .catch(function(error) {
                        req.flash('error', 'Failed saving the new attachment: ' + error.message);
                    })
                    .then(function () {
                        fs.unlink(req.file.path); // delete the file uploaded at./uploads
                    });
            }
        })
        .then(function () {
            res.redirect('/escapeRooms/' + req.escapeRoom.id);
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

    // Delete the attachment at Cloudinary (result is ignored)
    if (req.escapeRoom.attachment) {
        attHelper.checksCloudinaryEnv()
            .then(() => {
                cloudinary.api.delete_resources(req.escapeRoom.attachment.public_id);
            });
    }

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


