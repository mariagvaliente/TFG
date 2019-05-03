const cloudinary = require("cloudinary");
const {parseURL} = require("../helpers/video");
const {models} = require("../models");


// GET /escapeRooms/:escapeRoomId/play
exports.play = (req, res) => {
    models.team.findAll({
        "include": [
            {
                "model": models.turno,
                "include": {
                    "model": models.escapeRoom,
                    "where": {
                        "id": req.escapeRoom.id
                    }
                },
                "required": true

            },
            {
                "model": models.user,
                "as": "teamMembers",
                "attributes": [],
                "where": {
                    "id": req.session.user.id
                },
                "required": true
            },
            {
                "model": models.puzzle,
                "as": "retos"
            }

        ],
        "required": true
    }).then((teams) => {
        const team = teams && teams[0] ? teams[0] : [];

        models.requestedHint.findAll({
            "where": {
                "teamId": team.id,
                "success": true
            },
            "include": models.hint

        }).then((hints) => {
            res.render("escapeRooms/play/play", {"escapeRoom": req.escapeRoom,
                cloudinary,
                team,
                "hints": hints || [],
                parseURL,
                "layout": false});
        });
    });
};

// GET /escapeRooms/:escapeRoomId/pretest
exports.preTest = (req, res) => {
    res.render("escapeRooms/play/pretest", {"escapeRoom": req.escapeRoom});
};

// GET /escapeRooms/:escapeRoomId/posttest
exports.postTest = (req, res) => {
    res.render("escapeRooms/play/posttestandsurvey", {"escapeRoom": req.escapeRoom});
};


