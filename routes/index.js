const express = require("express"),
    router = express.Router();
const escapeRoomController = require("../controllers/escapeRoom_controller");
const turnController = require("../controllers/turnos_controller");
const userController = require("../controllers/user_controller");
const sessionController = require("../controllers/session_controller");

const multer = require("multer"),
    upload = multer({"dest": "./uploads/"});

// Autologout
router.all("*", sessionController.deleteExpiredUserSession);


// History: Restoration routes.

// Redirection to the saved restoration route.
const redirectBack = (req, res) => {

    const url = req.session.backURL || "/";

    delete req.session.backURL;
    res.redirect(url);

};

// Save the route that will be the current restoration route.
const saveBack = (req, res, next) => {

    req.session.backURL = req.url;
    next();

};

router.get([
    "/",
    "/users",
    "/users/:id(\\d+)/escapeRooms",
    "/escapeRooms"
], saveBack);

router.get("/goback", redirectBack);

// Autoload for routes using :escapeRoomId
router.param("escapeRoomId", escapeRoomController.load);
router.param("turnoId", turnController.load);
router.param("userId", userController.load);


// Routes for LOGIN page /
router.get("/", sessionController.new); // Login form
router.post("/", sessionController.create); // Create sesion
router.delete("/", sessionController.destroy); // Close sesion

// Routes for the resource /users
router.get("/users/:userId(\\d+)", sessionController.loginRequired, sessionController.notStudentRequired, sessionController.adminOrMyselfRequired, userController.show);
router.get("/users/new", userController.new);
router.post("/users", userController.create);
router.get("/users/:userId(\\d+)/edit", sessionController.loginRequired, sessionController.notStudentRequired, sessionController.adminOrMyselfRequired, userController.edit);
router.put("/users/:userId(\\d+)", sessionController.loginRequired, sessionController.notStudentRequired, sessionController.adminOrMyselfRequired, userController.update);
router.delete("/users/:userId(\\d+)", sessionController.loginRequired, sessionController.notStudentRequired, sessionController.adminOrMyselfRequired, userController.destroy);

router.get("/users/:userId(\\d+)/escapeRooms", sessionController.loginRequired, sessionController.notStudentRequired, sessionController.adminOrMyselfRequired, escapeRoomController.index);

router.get("/users/:userId(\\d+)/student", sessionController.loginRequired, sessionController.studentOrAdminRequired, userController.student);

// Routes for the resource /escapeRooms
router.get("/escapeRooms", sessionController.loginRequired, sessionController.adminRequired, escapeRoomController.index);
router.get("/escapeRooms/:escapeRoomId(\\d+)", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, escapeRoomController.show);
router.get("/escapeRooms/new", sessionController.loginRequired, escapeRoomController.new);
router.post("/escapeRooms", sessionController.loginRequired, upload.single("image"), escapeRoomController.create);
router.get("/escapeRooms/:escapeRoomId(\\d+)/edit", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, escapeRoomController.edit);
router.put("/escapeRooms/:escapeRoomId(\\d+)", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, upload.single("image"), escapeRoomController.update);
router.delete("/escapeRooms/:escapeRoomId(\\d+)", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, escapeRoomController.destroy);

router.post("/escapeRooms/:escapeRoomId(\\d+)/turnos", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, turnController.create);
router.delete("/escapeRooms/:escapeRoomId(\\d+)/turnos/:turnoId(\\d+)", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, turnController.destroy);


module.exports = router;
