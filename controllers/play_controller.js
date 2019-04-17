const cloudinary = require("cloudinary");
const {parseURL} = require("../helpers/video");


// GET /escapeRooms/:escapeRoomId/play
exports.play = (req, res) => {
    res.render("escapeRooms/play/play", {"escapeRoom": req.escapeRoom,
        cloudinary,
        parseURL,
        "layout": false});
};

// GET /escapeRooms/:escapeRoomId/pretest
exports.preTest = (req, res) => {
    res.render("escapeRooms/play/pretest", {"escapeRoom": req.escapeRoom});
};

// GET /escapeRooms/:escapeRoomId/posttest
exports.postTest = (req, res) => {
    res.render("escapeRooms/play/posttestandsurvey", {"escapeRoom": req.escapeRoom});
};

// GET /escapeRooms/:escapeRoomId/retos
exports.retos = (req, res) => {
    res.render("escapeRooms/play/retos", {"escapeRoom": req.escapeRoom});
};


