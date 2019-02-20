const express = require('express');
const router = express.Router();
const escapeRoomController = require('../controllers/escapeRoom_controller');
const turnController = require('../controllers/turnos_controller');
const userController = require('../controllers/user_controller');
const sessionController = require('../controllers/session_controller');

const multer = require('multer');
const upload = multer({dest: './uploads/'});

// autologout
router.all('*',sessionController.deleteExpiredUserSession);


// History: Restoration routes.

// Redirection to the saved restoration route.
function redirectBack(req, res, next) {
    const url = req.session.backURL || "/";
    delete req.session.backURL;
    res.redirect(url);
}

// Save the route that will be the current restoration route.
function saveBack(req, res, next) {
    req.session.backURL = req.url;
    next();
}

router.get([
    '/',
    '/users',
    '/escapeRooms'],                 saveBack);

router.get('/goback', redirectBack);

/* GET home page. */
/*
router.get('/', (req, res, next) => {
    res.render('index');
});
*/

// Autoload for routes using :escapeRoomId
router.param('escapeRoomId', escapeRoomController.load);
router.param('turnoId', turnController.load);
router.param('userId', userController.load);


// Routes for the resource /session
router.get('/',    sessionController.new);     // login form
router.post('/',   sessionController.create);  // create sesion
router.delete('/', sessionController.destroy); // close sesion

// Routes for the resource /users
router.get('/users/:userId(\\d+)', sessionController.loginRequired,userController.show);
router.get('/users/new', userController.new);
router.post('/users', userController.create);
router.get('/users/:userId(\\d+)/edit',     sessionController.loginRequired, sessionController.adminOrMyselfRequired,userController.edit);
router.put('/users/:userId(\\d+)',     sessionController.loginRequired, sessionController.adminOrMyselfRequired,userController.update);
router.delete('/users/:userId(\\d+)',     sessionController.loginRequired, sessionController.adminOrMyselfRequired,userController.destroy);

//CUIDADOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOooo
router.get('/users/:userId(\\d+)/escapeRooms', sessionController.loginRequired,escapeRoomController.index);



// Routes for the resource /escapeRooms
router.get('/escapeRooms',                   sessionController.loginRequired, escapeRoomController.index);
router.get('/escapeRooms/:escapeRoomId(\\d+)',      sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, escapeRoomController.show);
router.get('/escapeRooms/new',                sessionController.loginRequired, escapeRoomController.new);
router.post('/escapeRooms',                  sessionController.loginRequired, upload.single('image'), escapeRoomController.create);
router.get('/escapeRooms/:escapeRoomId(\\d+)/edit',  sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, escapeRoomController.edit);
router.put('/escapeRooms/:escapeRoomId(\\d+)',       sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, upload.single('image'),escapeRoomController.update);
router.delete('/escapeRooms/:escapeRoomId(\\d+)',     sessionController.loginRequired, escapeRoomController.adminOrAuthorRequired, escapeRoomController.destroy);

router.post('/escapeRooms/:escapeRoomId(\\d+)/turnos',     turnController.create);
router.delete('/escapeRooms/:escapeRoomId(\\d+)/turnos/:turnoId(\\d+)',  turnController.destroy);

module.exports = router;