
const Sequelize = require("sequelize");
const {models} = require("../models");
const cloudinary = require("cloudinary");
const fs = require("fs");
const {parseURL} = require("../helpers/video");

const attHelper = require("../helpers/attachments"),
    // Options for the files uploaded to Cloudinary
    cloudinary_upload_options = {"folder": "/escapeRoom/attachments",
        "resource_type": "auto",
        "tags": [
            "tfg",
            "escapeRoom"
        ]},
    cloudinary_upload_options_zip = {"folder": "/escapeRoom/attachments",
        "resource_type": "auto",
        "tags": [
            "tfg",
            "escapeRoom"
        ]};

// Autoload the escape room with id equals to :escapeRoomId
exports.load = (req, res, next, escapeRoomId) => {
    models.escapeRoom.findByPk(escapeRoomId, {"include": [
        {"model": models.turno},
        {"model": models.puzzle,
            "include": [{"model": models.hint}]},
        models.attachment,
        models.hintApp,
        {"model": models.user,
            "as": "author"}
    ],
    "order": [
        [
            {"model": models.turno},
            "date",
            "asc"
        ],
        [
            {"model": models.puzzle},
            "createdAt",
            "asc"
        ],
        [
            {"model": models.puzzle},
            {"model": models.hint},
            "createdAt",
            "asc"
        ]
    ]}).
        then((escapeRoom) => {
            if (escapeRoom) {
                req.escapeRoom = escapeRoom;
                next();
            } else {
                res.status(404);
                throw new Error(404);
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
        res.status(403);
        next(new Error(403));
    }
};

exports.adminOrAuthorOrParticipantRequired = (req, res, next) => {
    const isAdmin = Boolean(req.session.user.isAdmin),
        isAuthor = req.escapeRoom.authorId === req.session.user.id;

    if (isAdmin || isAuthor) {
        next();
        return;
    }
    models.user.findAll({
        "include": [

            {
                "model": models.team,
                "as": "teamsAgregados",
                "required": true,
                "include": [
                    {
                        "model": models.user,
                        "as": "teamMembers",
                        "attributes": [
                            "name",
                            "id",
                            "surname"
                        ]
                    },
                    {
                        "model": models.turno,
                        "where": {
                            "escapeRoomId": req.escapeRoom.id
                        },
                        "required": true
                    }

                ]
            }
        ],
        "where": {
            "id": req.session.user.id
        }
    }).then((participants) => {
        const isParticipant = participants && participants.length > 0;

        req.isParticipant = isParticipant ? participants[0] : null;
        if (isParticipant) {
            next();
        } else {
            throw new Error(403);
        }
    }).
        catch((e) => next(e));
};


// GET /escapeRooms
exports.index = (req, res, next) => {
    if (req.user && !req.user.isStudent) {
        models.escapeRoom.findAll({"attributes": [
            "id",
            "title",
            "invitation"
        ],
        "include": [
            models.attachment,
            {"model": models.user,
                "as": "author",
                "where": {"id": req.user.id}}
        ]}).then((escapeRooms) => res.render("escapeRooms/index.ejs", {escapeRooms,
            cloudinary,
            "user": req.user})).
            catch((error) => next(error));
    } else {
        const findOptions = {
            "attributes": [
                "id",
                "title",
                "invitation"
            ],
            "include": [
                {
                    "model": models.turno,
                    "attributes": [],
                    "duplicating": false,
                    "required": true,
                    "include": [
                        {
                            "model": models.user,
                            "attributes": [],
                            "as": "students",
                            "duplicating": false,
                            "required": false
                            // "where": {"id": req.user.id}
                        }
                    ]
                },
                models.attachment
            ]
        };

        models.escapeRoom.findAll(findOptions).
            then((erAll) => {
                findOptions.include[0].include[0].where = {"id": req.user.id};
                findOptions.include[0].include[0].required = true;
                findOptions.attributes = ["id"];
                models.escapeRoom.findAll(findOptions).
                    then((erFiltered) => {
                        const ids = erFiltered.map((e) => e.id);
                        const escapeRooms = erAll.map((er) => ({
                            "id": er.id,
                            "title": er.title,
                            "invitation": er.invitation,
                            "attachment": er.attachment,
                            "isSignedUp": ids.indexOf(er.id) !== -1
                        }));

                        res.render("escapeRooms/index.ejs", {escapeRooms,
                            cloudinary,
                            "user": req.user});
                    });
            }).
            catch((error) => next(error));
    }
};

// GET /escapeRooms
exports.indexBreakDown = (req, res) => {
    res.redirect("/");
};

// GET /escapeRooms/:escapeRoomId
exports.show = (req, res) => {
    const {escapeRoom} = req;
    const participant = req.isParticipant;
    const hostName = process.env.APP_NAME || "http://localhost:3000";

    if (participant) {
        res.render("escapeRooms/show_student", {escapeRoom,
            cloudinary,
            participant,
            parseURL});
    } else {
        res.render("escapeRooms/show", {escapeRoom,
            cloudinary,
            hostName,
            parseURL});
    }
};

// /escapeRooms/:escapeRoomId/preview
exports.preview = (req, res) => {
    const {escapeRoom} = req;

    res.render("escapeRooms/preview", {escapeRoom,
        "layout": false,
        cloudinary,
        parseURL,
        "appearance": req.query.appearance});
};

// GET /escapeRooms/new
exports.new = (req, res) => {
    const escapeRoom = {"title": "",
        "teacher": "",
        "subject": "",
        "duration": "",
        "description": "",
        "video": "",
        "nmax": "",
        "teamSize": ""};

    res.render("escapeRooms/new", {escapeRoom});
};


// POST /escapeRooms/create
exports.create = (req, res, next) => {
    const {title, subject, duration, description, video, nmax, teamSize} = req.body,

        authorId = req.session.user && req.session.user.id || 0,

        escapeRoom = models.escapeRoom.build({title,
            subject,
            duration,
            description,
            video,
            nmax,
            teamSize,
            authorId}); // Saves only the fields question and answer into the DDBB

    escapeRoom.save({"fields": [
        "title",
        "teacher",
        "subject",
        "duration",
        "description",
        "video",
        "nmax",
        "teamSize",
        "authorId",
        "invitation"
    ]}).
        then((er) => {
            req.flash("success", "Escape Room creada con éxito");
            if (!req.file) {
                req.flash("info", "Escape Room without attachment.");
                res.redirect(`/escapeRooms/${escapeRoom.id}/turnos`);

                return;
            }
            // Save the attachment into  Cloudinary

            return attHelper.checksCloudinaryEnv().
                then(() => attHelper.uploadResource(req.file.path, cloudinary_upload_options)).
                then((uploadResult) => models.attachment.create({"public_id": uploadResult.public_id,
                    "url": uploadResult.url,
                    "filename": req.file.originalname,
                    "mime": req.file.mimetype,
                    "escapeRoomId": er.id}).
                    catch((error) => { // Ignoring validation errors
                        console.error(error);
                        req.flash("error", `${req.app.locals.i18n.common.flash.errorImage}: ${error.message}`);
                        attHelper.deleteResource(uploadResult.public_id);
                    })).
                catch((error) => {
                    console.error(error);

                    req.flash("error", `${req.app.locals.i18n.common.flash.errorFile}: ${error.message}`);
                }).
                then(() => {
                    fs.unlink(req.file.path); // Delete the file uploaded at./uploads
                    res.redirect(`/escapeRooms/${er.id}/turnos`);
                });
        }).
        catch(Sequelize.ValidationError, (error) => {
            error.errors.forEach(({message}) => req.flash("error", message));
            res.render("escapeRooms/new", {escapeRoom});
        }).
        catch((error) => {
            req.flash("error", `${req.app.locals.i18n.common.flash.errorCreatingER}: ${error.message}`);
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
    escapeRoom.teamSize = body.teamSize;
    const progressBar = body.progress;

    escapeRoom.save({"fields": [
        "title",
        "subject",
        "duration",
        "description",
        "video",
        "nmax",
        "teamSize"
    ]}).
        then((er) => {
            req.flash("success", req.app.locals.i18n.common.flash.successCreatingER);
            if (body.keepAttachment === "0") {
                // There is no attachment: Delete old attachment.
                if (!req.file) {
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
                        const old_public_id = er.attachment ? er.attachment.public_id : null; // Update the attachment into the data base.

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
                                req.flash("success", req.app.locals.i18n.common.flash.successImage);
                                if (old_public_id) {
                                    attHelper.deleteResource(old_public_id);
                                }
                            }).
                            catch((error) => { // Ignoring image validation errors
                                req.flash("error", `${req.app.locals.i18n.common.flash.errorFile}: ${error.message}`);
                                attHelper.deleteResource(uploadResult.public_id);
                            });
                    }).
                    catch((error) => {
                        req.flash("error", `${req.app.locals.i18n.common.flash.errorFile}: ${error.message}`);
                    }).
                    then(() => {
                        fs.unlink(req.file.path); // Delete the file uploaded at./uploads
                        res.redirect(`/escapeRooms/${escapeRoom.id}/${progressBar || "turnos"}`);
                    });
            }
        }).
        then(() => {
            res.redirect(`/escapeRooms/${req.escapeRoom.id}/${progressBar || "turnos"}`);
        }).
        catch(Sequelize.ValidationError, (error) => {
            error.errors.forEach(({message}) => req.flash("error", message));
            res.render("escapeRooms/edit", {escapeRoom});
        }).
        catch((error) => {
            req.flash("error", `${req.app.locals.i18n.common.flash.errorEditingER}: ${error.message}`);
            next(error);
        });
};

// GET /escapeRooms/:escapeRoomId/appearance
exports.temas = (req, res) => {
    const {escapeRoom} = req;

    res.render("escapeRooms/steps/appearance", {escapeRoom});
};

// POST /escapeRooms/:escapeRoomId/appearance
exports.temasUpdate = (req, res, next) => {
    const {escapeRoom, body} = req;

    escapeRoom.appearance = body.appearance;
    const isPrevious = Boolean(body.previous);
    const progressBar = body.progress;

    escapeRoom.save({"fields": ["appearance"]}).then(() => {
        res.redirect(`/escapeRooms/${escapeRoom.id}/${isPrevious ? "instructions" : progressBar || "evaluation"}`);
    }).
        catch(Sequelize.ValidationError, (error) => {
            error.errors.forEach(({message}) => req.flash("error", message));
            res.redirect(`/escapeRooms/${escapeRoom.id}/appearance`);
        }).
        catch((error) => {
            req.flash("error", `${req.app.locals.i18n.common.flash.errorEditingER}: ${error.message}`);
            next(error);
        });
};

// GET /escapeRooms/:escapeRoomId/turnos
exports.turnos = (req, res) => {
    const {escapeRoom} = req;
    const {turnos} = escapeRoom;

    res.render("escapeRooms/steps/turnos", {escapeRoom,
        turnos});
};

// POST /escapeRooms/:escapeRoomId/turnos
exports.turnosUpdate = (req, res /* , next*/) => {
    const {escapeRoom, body} = req;

    const isPrevious = Boolean(body.previous);
    const progressBar = body.progress;

    res.redirect(`/escapeRooms/${escapeRoom.id}/${isPrevious ? "edit" : progressBar || "puzzles"}`);
};

// GET /escapeRooms/:escapeRoomId/puzzles
exports.retos = (req, res) => {
    const {escapeRoom} = req;

    res.render("escapeRooms/steps/puzzles", {escapeRoom});
};

// POST /escapeRooms/:escapeRoomId/puzzles
exports.retosUpdate = (req, res, next) => {
    const {escapeRoom, body} = req;
    const {automatic} = body;
    const isPrevious = Boolean(body.previous);
    const progressBar = body.progress;

    escapeRoom.automatic = automatic === "1";
    escapeRoom.save({"fields": ["automatic"]}).then(() => {
        res.redirect(`/escapeRooms/${req.escapeRoom.id}/${isPrevious ? "turnos" : progressBar || "hints"}`);
    }).
        catch(Sequelize.ValidationError, (error) => {
            error.errors.forEach(({message}) => req.flash("error", message));
            res.redirect(`/escapeRooms/${req.escapeRoom.id}/puzzles`);
        }).
        catch((error) => {
            req.flash("error", `${error.message}`);
            next(error);
        });
};

// GET /escapeRooms/:escapeRoomId/hints
exports.pistas = (req, res) => {
    const {escapeRoom} = req;

    res.render("escapeRooms/steps/hints", {escapeRoom});
};

// POST /escapeRooms/:escapeRoomId/hints
exports.pistasUpdate = (req, res, next) => {
    const {escapeRoom, body} = req;
    const isPrevious = Boolean(body.previous);
    const progressBar = body.progress;
    const {numQuestions, numRight, feedback} = body;
    let pctgRight = numRight || 0;

    pctgRight = (numRight >= 0 && numRight <= numQuestions ? numRight : numQuestions) * 100 / (numQuestions || 1);
    escapeRoom.numQuestions = numQuestions;
    escapeRoom.numRight = pctgRight;
    escapeRoom.feedback = Boolean(feedback);

    const back = `/escapeRooms/${escapeRoom.id}/${isPrevious ? "puzzles" : progressBar || "instructions"}`;

    escapeRoom.save({"fields": [
        "numQuestions",
        "numRight",
        "feedback"
    ]}).
        then(() => {
            if (body.keepAttachment === "0") {
                // There is no attachment: Delete old attachment.
                if (!req.file) {
                    // Req.flash("info", "This Escape Room has no attachment.");
                    if (escapeRoom.hintApp) {
                        attHelper.deleteResource(escapeRoom.hintApp.public_id);
                        escapeRoom.hintApp.destroy();
                    }
                    return;
                }

                return attHelper.checksCloudinaryEnv().
                    // Save the new attachment into Cloudinary:
                    then(() => attHelper.uploadResource(req.file.path, cloudinary_upload_options_zip)).
                    then((uploadResult) => {
                        // Remenber the public_id of the old image.
                        const old_public_id = escapeRoom.hintApp ? escapeRoom.hintApp.public_id : null; // Update the attachment into the data base.

                        return escapeRoom.getHintApp().
                            then((att) => {
                                let hintApp = att;

                                if (!hintApp) {
                                    hintApp = models.hintApp.build({"escapeRoomId": escapeRoom.id});
                                }
                                hintApp.public_id = uploadResult.public_id;
                                hintApp.url = uploadResult.url;
                                hintApp.filename = req.file.originalname;
                                hintApp.mime = req.file.mimetype;

                                return hintApp.save();
                            }).
                            then(() => {
                                req.flash("success", "Fichero guardado con éxito.");
                                if (old_public_id) {
                                    attHelper.deleteResource(old_public_id);
                                }
                            }).
                            catch((error) => { // Ignoring image validation errors
                                req.flash("error", `Error al guardar el fichero: ${error.message}`);
                                attHelper.deleteResource(uploadResult.public_id);
                            });
                    }).
                    catch((error) => {
                        req.flash("error", `${req.app.locals.i18n.common.flash.errorFile}: ${error.message}`);
                    }).
                    then(() => {
                        fs.unlink(req.file.path); // Delete the file uploaded at./uploads
                        res.redirect(back);
                    });
            }
        }).
        then(() => {
            res.redirect(back);
        }).
        catch(Sequelize.ValidationError, (error) => {
            error.errors.forEach(({message}) => req.flash("error", message));
            res.render("escapeRooms/hints", {escapeRoom});
        }).
        catch((error) => {
            req.flash("error", `${req.app.locals.i18n.common.flash.errorEditingER}: ${error.message}`);
            next(error);
        });
};

// GET /escapeRooms/:escapeRoomId/evaluation
exports.encuestas = (req, res) => {
    const {escapeRoom} = req;

    res.render("escapeRooms/steps/evaluation", {escapeRoom});
};

// POST /escapeRooms/:escapeRoomId/evaluation
exports.encuestasUpdate = (req, res, next) => {
    const {escapeRoom, body} = req;
    const isPrevious = Boolean(body.previous);
    const progressBar = body.progress;

    escapeRoom.survey = body.survey;
    escapeRoom.pretest = body.pretest;
    escapeRoom.posttest = body.posttest;

    escapeRoom.save({"fields": [
        "survey",
        "pretest",
        "posttest"
    ]}).then(() => {
        res.redirect(`/escapeRooms/${escapeRoom.id}/${isPrevious ? "appearance" : progressBar || ""}`);
    }).
        catch(Sequelize.ValidationError, (error) => {
            error.errors.forEach(({message}) => req.flash("error", message));
            res.redirect(`/escapeRooms/${escapeRoom.id}/evaluation`);
        }).
        catch((error) => {
            req.flash("error", `${req.app.locals.i18n.common.flash.errorEditingER}: ${error.message}`);
            next(error);
        });
};

// GET /escapeRooms/:escapeRoomId/instructions
exports.instructions = (req, res) => {
    const {escapeRoom} = req;

    res.render("escapeRooms/steps/instructions", {escapeRoom});
};


// GET /escapeRooms/:escapeRoomId/instructions
exports.instructionsUpdate = (req, res, next) => {
    const {escapeRoom, body} = req;
    const isPrevious = Boolean(body.previous);

    escapeRoom.instructions = body.instructions;
    const progressBar = body.progress;

    escapeRoom.save({"fields": ["instructions"]}).then(() => {
        res.redirect(`/escapeRooms/${escapeRoom.id}/${isPrevious ? "hints" : progressBar || "appearance"}`);
    }).
        catch(Sequelize.ValidationError, (error) => {
            error.errors.forEach(({message}) => req.flash("error", message));
            res.redirect(`/escapeRooms/${escapeRoom.id}/instructions`);
        }).
        catch((error) => {
            req.flash("error", `${req.app.locals.i18n.common.flash.errorEditingER}: ${error.message}`);
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
            req.flash("success", req.app.locals.i18n.common.flash.successDeletingER);
            res.redirect("/escapeRooms");
        }).
        catch((error) => {
            req.flash("error", `${req.app.locals.i18n.common.flash.errorDeletingER}: ${error.message}`);
            next(error);
        });
};


// GET /escapeRooms/:escapeRoomId/join
exports.studentToken = (req, res) => {
    const {escapeRoom} = req;

    models.participants.findOne({"where": {
        "userId": req.session.user.id,
        "turnId": {[Sequelize.Op.or]: [escapeRoom.turnos.map((t) => t.id)]}
    }}).then((p) => {
        console.log(p);
        console.log([escapeRoom.turnos.map((t) => t.id)]);
        if (p) {
            res.redirect(`/escapeRooms/${escapeRoom.id}`);
        } else if (escapeRoom.invitation === req.query.token) {
            res.render("escapeRooms/indexInvitation", {escapeRoom,
                cloudinary});
        } else {
            res.redirect("/");
        }
    });
};
