const Sequelize = require("sequelize");
const {models} = require("../models");
const cloudinary = require("cloudinary");
const {parseURL}= require("../helpers/video")
// GET /escapeRooms/:escapeRoomId
exports.play = (req, res, next) => {
  res.render("escapeRooms/play/play", {escapeRoom: req.escapeRoom, cloudinary, parseURL, layout: false});
}