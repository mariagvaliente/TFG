
const Sequelize = require("sequelize");
const {models} = require("../models");
const cloudinary = require("cloudinary");
const fs = require("fs");
const attHelper = require("../helpers/attachments"),
    // Options for the files uploaded to Cloudinary
    cloudinary_upload_options = {
        "folder": "/escapeRoom/attachments",
        "resource_type": "auto",
        "tags": [
            "tfg",
            "escapeRoom"
        ]
    };


// Autoload the escape room with id equals to :escapeRoomId
exports.load = (req, res, next, escapeRoomId) => {


    models.escapeRoom.findById(escapeRoomId, {
        "include": [
            {"model": models.turno},
            models.attachment,
            {"model": models.user,
                "as": "author"}
        ],
        "order": [
            [
                {"model": models.turno},
                "date",
                "asc"
            ]
        ]
    }).
        then((escapeRoom) => {

            if (escapeRoom) {

                req.escapeRoom = escapeRoom;
                next();

            } else {

                throw new Error(`There is no escape room with id=${escapeRoomId}`);

            }

        }).
        catch((error) => next(error));

};

// MW that allows actions only if the user logged in is admin or is the author of the escape room.
exports.adminOrAuthorRequired = (req, res, next) => {

    const isAdmin = Boolean(req.session.user.isAdmin),
        isAuthor = req.escapeRoom.authorId === req.session.user.id;

    if (isAdmin || isAuthor) {

        next();

    } else {

        console.log("Prohibited operation: The logged in user is not the author of the escape room, nor an administrator.");
        res.send(403);

    }

};

// GET /escapeRooms
exports.index = (req, res, next) => {


    const countOptions = {
        "where": {}
    };

    // If there exists "req.user", then only the escape rooms of that user are shown
    if (req.user) {

        countOptions.where.authorId = req.user.id;

    }

    models.escapeRoom.count(countOptions).
        then(() => {

            const findOptions = {
                ...countOptions,
                "include": [
                    models.attachment,
                    {"model": models.user,
                        "as": "author"}
                ]
            };


            return models.escapeRoom.findAll(findOptions);

        }).
        then((escapeRooms) => {

            res.render("escapeRooms/index.ejs", {escapeRooms,
                cloudinary});

        }).
        catch((error) => next(error));

};

// GET /escapeRooms/:escapeRoomId
exports.show = (req, res) => {

    const {escapeRoom} = req;

    res.render("escapeRooms/show", {escapeRoom,
        cloudinary});

};

// /escapeRooms/:escapeRoomId/preview
exports.preview = (req, res) => {

    const {escapeRoom} = req;

    res.render("escapeRooms/preview", {escapeRoom,
        "layout": false,
        cloudinary,
        "theme": req.query.appearance});

};

// GET /escapeRooms/new
exports.new = (req, res) => {

    const escapeRoom = {
        "title": "",
        "teacher": "",
        "subject": "",
        "duration": "",
        "description": "",
        "video": "",
        "nmax": ""
    };

    res.render("escapeRooms/new", {escapeRoom});

};

// POST /escapeRooms/create
exports.create = (req, res, next) => {

    const {title, subject, duration, description, video, nmax} = req.body,

        authorId = req.session.user && req.session.user.id || 0,

        escapeRoom = models.escapeRoom.build({
            title,
            subject,
            duration,
            description,
            video,
            nmax,
            authorId
        });

    // Saves only the fields question and answer into the DDBB
    escapeRoom.save({"fields": [
        "title",
        "teacher",
        "subject",
        "duration",
        "description",
        "video",
        "nmax",
        "authorId"
    ]}).
        then((er) => {

            req.flash("success", "Escape Room created successfully.");
            if (!req.file) {

                req.flash("info", "Escape Room without attachment.");
                res.redirect(`/escapeRooms/${escapeRoom.id}/step1`);

                return;

            }
            // Save the attachment into  Cloudinary

            return attHelper.checksCloudinaryEnv().
                then(() => attHelper.uploadResource(req.file.path, cloudinary_upload_options)).
                then((uploadResult) => models.attachment.create({
                    "public_id": uploadResult.public_id,
                    "url": uploadResult.url,
                    "filename": req.file.originalname,
                    "mime": req.file.mimetype,
                    "escapeRoomId": er.id
                }).
                    catch((error) => { // Ignoring validation errors

                        console.error(error);
                        req.flash("error", `Error al subir la imagen: ${error.message}`);
                        attHelper.deleteResource(uploadResult.public_id);

                    })).
                catch((error) => {

                    console.error(error);

                    req.flash("error", `Error al subir el fichero: ${error.message}`);

                }).
                then(() => {

                    fs.unlink(req.file.path); // Delete the file uploaded at./uploads
                    res.redirect(`/escapeRooms/${er.id}/step1`);

                });

        }).
        catch(Sequelize.ValidationError, (error) => {

            error.errors.forEach(({message}) => req.flash("error", message));
            res.render("escapeRooms/new", {escapeRoom});

        }).
        catch((error) => {

            req.flash("error", `Error creating a new Escape Room: ${error.message}`);
            next(error);

        });

};

// GET /escapeRooms/:escapeRoomId/edit
exports.edit = (req, res) => {

    const {escapeRoom} = req;

    res.render("escapeRooms/edit", {escapeRoom});

};

// PUT /escapeRooms/:escapeRoomId
exports.update = (req, res, next) => {

    const {escapeRoom, body} = req;

    escapeRoom.title = body.title;
    escapeRoom.subject = body.subject;
    escapeRoom.duration = body.duration;
    escapeRoom.description = body.description;
    escapeRoom.video = body.video;
    escapeRoom.nmax = body.nmax;
    escapeRoom.appearance = body.appearance;

    escapeRoom.save({"fields": [
        "title",
        "subject",
        "duration",
        "description",
        "video",
        "nmax"
    ]}).
        then((er) => {

            req.flash("success", "Escape Room edited successfully.");
            if (body.keepAttachment === "0") {

                // There is no attachment: Delete old attachment.
                if (!req.file) {

                    req.flash("info", "This Escape Room has no attachment.");
                    if (er.attachment) {

                        attHelper.deleteResource(er.attachment.public_id);
                        er.attachment.destroy();

                    }

                    return;

                }

                // Save the new attachment into Cloudinary:
                return attHelper.checksCloudinaryEnv().
                    then(() => attHelper.uploadResource(req.file.path, cloudinary_upload_options)).
                    then((uploadResult) => {

                        // Remenber the public_id of the old image.
                        const old_public_id = er.attachment ? er.attachment.public_id : null;

                        // Update the attachment into the data base.
                        return er.getAttachment().
                            then((att) => {

                                let attachment = att;

                                if (!attachment) {

                                    attachment = models.attachment.build({"escapeRoomId": er.id});

                                }
                                attachment.public_id = uploadResult.public_id;
                                attachment.url = uploadResult.url;
                                attachment.filename = req.file.originalname;
                                attachment.mime = req.file.mimetype;

                                return attachment.save();

                            }).
                            then(() => {

                                req.flash("success", "Image saved successfully.");
                                if (old_public_id) {

                                    attHelper.deleteResource(old_public_id);

                                }

                            }).
                            catch((error) => { // Ignoring image validation errors

                                req.flash("error", `Failed saving new image: ${error.message}`);
                                attHelper.deleteResource(uploadResult.public_id);

                            });


                    }).
                    catch((error) => {

                        req.flash("error", `Failed saving the new attachment: ${error.message}`);

                    }).
                    then(() => {

                        fs.unlink(req.file.path); // Delete the file uploaded at./uploads
                        res.redirect(`/escapeRooms/${escapeRoom.id}/step1`);

                    });

            }

        }).
        then(() => {

            res.redirect(`/escapeRooms/${req.escapeRoom.id}/step1`);

        }).
        catch(Sequelize.ValidationError, (error) => {

            error.errors.forEach(({message}) => req.flash("error", message));
            res.render("escapeRooms/edit", {escapeRoom});

        }).
        catch((error) => {

            req.flash("error", `Error editing the Escape Room: ${error.message}`);
            next(error);

        });

};

// GET /escapeRooms/:escapeRoomId/step1
exports.temas = (req, res) => {

    const {escapeRoom} = req;

    res.render("escapeRooms/step1", {escapeRoom});

};

// POST /escapeRooms/:escapeRoomId/step1
exports.temasUpdate = (req, res, next) => {

    const {escapeRoom, body} = req;

    escapeRoom.appearance = body.appearance;
    const isPrevious = Boolean(body.previous);

    escapeRoom.save({"fields": ["appearance"]}).then(() => {

        res.redirect(`/escapeRooms/${escapeRoom.id}/${isPrevious ? "edit" : "step2"}`);

    }).
        catch(Sequelize.ValidationError, (error) => {

            error.errors.forEach(({message}) => req.flash("error", message));
            res.redirect(`/escapeRooms/${escapeRoom.id}/step1`);

        }).
        catch((error) => {

            req.flash("error", `Error editing the Escape Room: ${error.message}`);
            next(error);

        });


};

// GET /escapeRooms/:escapeRoomId/step2
exports.turnos = (req, res) => {

    const {escapeRoom} = req;
    const {turnos} = escapeRoom;
    const turnosParsed = turnos;

    res.render("escapeRooms/step2", {escapeRoom,
        "turnos": turnosParsed});

};

// POST /escapeRooms/:escapeRoomId/step2
exports.turnosUpdate = (req, res /* , next*/) => {

    const {escapeRoom, body} = req;

    escapeRoom.appearance = body.appearance;
    const isPrevious = Boolean(body.previous);

    res.redirect(`/escapeRooms/${escapeRoom.id}/${isPrevious ? "step1" : "step3"}`);
    /* EscapeRoom.save({"fields": ["turnos"]}).then(() => {

        res.redirect(`/escapeRooms/${escapeRoom.id}/${isPrevious ? "step1" : "step3"}`);

    }).
        catch(Sequelize.ValidationError, (error) => {

            error.errors.forEach(({message}) => req.flash("error", message));
            res.redirect(`/escapeRooms/${escapeRoom.id}/step2`);

        }).
        catch((error) => {

            req.flash("error", `Error editing the Escape Room: ${error.message}`);
            next(error);

        });*/

};

// GET /escapeRooms/:escapeRoomId/step3
exports.retos = (req, res) => {

    const {escapeRoom} = req;

    res.render("escapeRooms/step3", {escapeRoom});

};

// POST /escapeRooms/:escapeRoomId/step3
exports.retosUpdate = (req, res, next) => {

    const {escapeRoom, body} = req;

    escapeRoom.retos = body.retos;
    const isPrevious = Boolean(body.previous);

    escapeRoom.save({"fields": ["retos"]}).then(() => {

        res.redirect(`/escapeRooms/${escapeRoom.id}/${isPrevious ? "step2" : "step4"}`);

    }).
        catch(Sequelize.ValidationError, (error) => {

            error.errors.forEach(({message}) => req.flash("error", message));
            res.redirect(`/escapeRooms/${escapeRoom.id}/step3`);

        }).
        catch((error) => {

            req.flash("error", `Error editing the Escape Room: ${error.message}`);
            next(error);

        });

};

// GET /escapeRooms/:escapeRoomId/step4
exports.pistas = (req, res) => {

    const {escapeRoom} = req;

    res.render("escapeRooms/step4", {escapeRoom});

};

// POST /escapeRooms/:escapeRoomId/step4
exports.pistasUpdate = (req, res, next) => {

    const {escapeRoom, body} = req;
    const isPrevious = Boolean(body.previous);

    escapeRoom.pistas = body.pistas;

    escapeRoom.save({"fields": ["retos"]}).then(() => {

        res.redirect(`/escapeRooms/${escapeRoom.id}/${isPrevious ? "step3" : "step5"}`);

    }).
        catch(Sequelize.ValidationError, (error) => {

            error.errors.forEach(({message}) => req.flash("error", message));
            res.redirect(`/escapeRooms/${escapeRoom.id}/step4`);

        }).
        catch((error) => {

            req.flash("error", `Error editing the Escape Room: ${error.message}`);
            next(error);

        });


};

// GET /escapeRooms/:escapeRoomId/step5
exports.encuestas = (req, res) => {

    const {escapeRoom} = req;

    res.render("escapeRooms/step5", {escapeRoom});

};

// POST /escapeRooms/:escapeRoomId/step5
exports.encuestasUpdate = (req, res, next) => {

    const {escapeRoom, body} = req;
    const isPrevious = Boolean(body.previous);

    escapeRoom.survey = body.survey;
    escapeRoom.pretest = body.pretest;
    escapeRoom.posttest = body.posttest;

    escapeRoom.save({"fields": [
        "survey",
        "pretest",
        "posttest"
    ]}).then(() => {

        res.redirect(`/escapeRooms/${escapeRoom.id}/${isPrevious ? "step4" : ""}`);

    }).
        catch(Sequelize.ValidationError, (error) => {

            error.errors.forEach(({message}) => req.flash("error", message));
            res.redirect(`/escapeRooms/${escapeRoom.id}/step5`);

        }).
        catch((error) => {

            req.flash("error", `Error editing the Escape Room: ${error.message}`);
            next(error);

        });

};


// DELETE /escapeRooms/:escapeRoomId
exports.destroy = (req, res, next) => {

    // Delete the attachment at Cloudinary (result is ignored)
    if (req.escapeRoom.attachment) {

        attHelper.checksCloudinaryEnv().
            then(() => {

                attHelper.deleteResource(req.escapeRoom.attachment.public_id);

            });

    }

    req.escapeRoom.destroy().
        then(() => {

            req.flash("success", "Escape Room deleted successfully.");
            res.redirect("/escapeRooms");

        }).
        catch((error) => {

            req.flash("error", `Error deleting the Escape Room: ${error.message}`);
            next(error);

        });

};
