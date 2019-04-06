const express = require("express"),
    router = express.Router();
const escapeRoomController = require("../controllers/escapeRoom_controller");
const turnController = require("../controllers/turnos_controller");
const puzzleController = require("../controllers/puzzle_controller");
const hintController = require("../controllers/hint_controller");
const userController = require("../controllers/user_controller");
const sessionController = require("../controllers/session_controller");
const teamController = require("../controllers/team_controller");
const participantController = require("../controllers/participants_controller");
const playController = require("../controllers/play_controller");
const membersController = require("../controllers/members_controller");

const multer = require("multer"),
    upload = multer({"dest": "./uploads/"});// Autologout

router.all("*", sessionController.deleteExpiredUserSession);


// History: Restoration routes.

// Redirection to the saved restoration route.
const redirectBack = (req, res) => {
    const url = req.session.backURL;

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
router.param("puzzleId", puzzleController.load);
router.param("hintId", hintController.load);
router.param("userId", userController.load);
router.param("teamId", teamController.load);


// Routes for LOGIN page /
router.get("/", sessionController.new); // Login form
router.post("/", sessionController.create); // Create sesion
router.delete("/", sessionController.destroy); // Close sesion

// Routes for the resource /users
router.get("/users/:userId(\\d+)", sessionController.loginRequired, sessionController.adminOrMyselfRequired, userController.show);
router.get("/users/new", userController.new);
router.post("/users", userController.create);
router.get("/users/index", userController.index);
router.get("/users/:userId(\\d+)/edit", sessionController.loginRequired, sessionController.adminOrMyselfRequired, userController.edit);
router.put("/users/:userId(\\d+)", sessionController.loginRequired, sessionController.adminOrMyselfRequired, userController.update);
router.delete("/users/:userId(\\d+)", sessionController.loginRequired, sessionController.adminOrMyselfRequired, userController.destroy);
router.get("/users/:userId(\\d+)/escapeRooms", sessionController.loginRequired, sessionController.adminOrMyselfRequired, escapeRoomController.index);

// Routes for the resource /escapeRooms
router.get("/escapeRooms", sessionController.loginRequired, escapeRoomController.indexBreakDown);
router.get("/escapeRoomsAdmin", sessionController.loginRequired, sessionController.adminRequired, escapeRoomController.index);
router.get("/escapeRooms/:escapeRoomId(\\d+)", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, escapeRoomController.show);
router.get("/escapeRooms/:escapeRoomId(\\d+)/preview", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, escapeRoomController.preview);

router.get("/escapeRooms/new", sessionController.loginRequired, sessionController.notStudentRequired, escapeRoomController.new);
router.post("/escapeRooms", sessionController.loginRequired, upload.single("image"), escapeRoomController.create);
router.get("/escapeRooms/:escapeRoomId(\\d+)/edit", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, escapeRoomController.edit);
router.put("/escapeRooms/:escapeRoomId(\\d+)", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, upload.single("image"), escapeRoomController.update);
router.delete("/escapeRooms/:escapeRoomId(\\d+)", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, escapeRoomController.destroy);

router.get("/escapeRooms/:escapeRoomId(\\d+)/appearance", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, escapeRoomController.temas);
router.post("/escapeRooms/:escapeRoomId(\\d+)/appearance", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, escapeRoomController.temasUpdate);
router.get("/escapeRooms/:escapeRoomId(\\d+)/turnos", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, escapeRoomController.turnos);
router.post("/escapeRooms/:escapeRoomId(\\d+)/turnos", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, escapeRoomController.turnosUpdate);
router.get("/escapeRooms/:escapeRoomId(\\d+)/puzzles", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, escapeRoomController.retos);
router.post("/escapeRooms/:escapeRoomId(\\d+)/puzzles", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, escapeRoomController.retosUpdate);
router.get("/escapeRooms/:escapeRoomId(\\d+)/hints", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, escapeRoomController.pistas);
router.post("/escapeRooms/:escapeRoomId(\\d+)/hints", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, upload.single("hints"), escapeRoomController.pistasUpdate);
router.get("/escapeRooms/:escapeRoomId(\\d+)/evaluation", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, escapeRoomController.encuestas);
router.post("/escapeRooms/:escapeRoomId(\\d+)/evaluation", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, escapeRoomController.encuestasUpdate);
router.get("/escapeRooms/:escapeRoomId(\\d+)/instructions", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, escapeRoomController.instructions);
router.post("/escapeRooms/:escapeRoomId(\\d+)/instructions", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, escapeRoomController.instructionsUpdate);


router.get("/escapeRooms/:escapeRoomId(\\d+)/join", sessionController.loginRequired, sessionController.studentOrAdminRequired, escapeRoomController.studentToken);
router.post("/escapeRooms/:escapeRoomId(\\d+)/join", sessionController.loginRequired, sessionController.studentOrAdminRequired, turnController.indexStudent);


router.post("/escapeRooms/:escapeRoomId(\\d+)/puzzles/new", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, puzzleController.create);
router.put("/escapeRooms/:escapeRoomId(\\d+)/puzzles/:puzzleId(\\d+)", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, puzzleController.update);
router.delete("/escapeRooms/:escapeRoomId(\\d+)/puzzles/:puzzleId(\\d+)", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, puzzleController.destroy);

router.post("/escapeRooms/:escapeRoomId(\\d+)/puzzles/:puzzleId(\\d+)/hints/new", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, hintController.create);
router.put("/escapeRooms/:escapeRoomId(\\d+)/hints/:hintId(\\d+)", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, hintController.update);
router.delete("/escapeRooms/:escapeRoomId(\\d+)/hints/:hintId(\\d+)", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, hintController.destroy);


router.post("/escapeRooms/:escapeRoomId(\\d+)/turnos/new", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, turnController.create);
router.delete("/escapeRooms/:escapeRoomId(\\d+)/turnos/:turnoId(\\\\d+)", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, turnController.destroy);

router.get("/escapeRooms/:escapeRoomId(\\d+)/hintApp", sessionController.loginRequired, /* EscapeRoomController.isParticipantRequired,*/ hintController.hintApp);
router.get("/escapeRooms/:escapeRoomId(\\d+)/hintAppWrapper", sessionController.loginRequired, /* EscapeRoomController.isParticipantRequired,*/ hintController.hintAppWrapper);

router.get("/escapeRooms/:escapeRoomId(\\d+)/play", sessionController.loginRequired, playController.play);
router.get("/escapeRooms/:escapeRoomId(\\d+)/pretest", sessionController.loginRequired, playController.preTest);
router.get("/escapeRooms/:escapeRoomId(\\d+)/posttest", sessionController.loginRequired, playController.postTest);

router.get("/inspiration", sessionController.loginRequired, (req, res) => res.render("inspiration"));
router.post("/escapeRooms/:escapeRoomId(\\d+)/confirm", sessionController.loginRequired, participantController.confirmAttendance);


// Routes for the resource participants of a turn
router.put(
    "/users/:userId(\\d+)/participants",
    sessionController.loginRequired, sessionController.studentOrAdminRequired,
    participantController.add
);

router.get("/escapeRooms/:escapeRoomId(\\d+)/participants", sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, participantController.index);

// Routes for the resource members of a team
router.put(
    "/turnos/:turnoId(\\d+)/members/:teamId(\\d+)",
    sessionController.loginRequired, sessionController.studentOrAdminRequired,
    membersController.add
);

router.get(
    "/users/:userId(\\d+)/members/:teamId(\\d+)",
    sessionController.loginRequired, sessionController.studentOrAdminRequired,
    membersController.show
);

// Routes for the resource /teams
router.get("/turnos/:turnoId(\\d+)/teams/new", sessionController.loginRequired, sessionController.studentOrAdminRequired, teamController.new);
router.post("/turnos/:turnoId(\\d+)/teams", sessionController.loginRequired, sessionController.studentOrAdminRequired, teamController.create);
router.get("/turnos/:turnoId(\\d+)/teams", sessionController.loginRequired, sessionController.studentOrAdminRequired, teamController.index);



module.exports = router;
