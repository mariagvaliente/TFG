const express = require('express');
const router = express.Router();

const escapeRoomController = require('../controllers/escapeRoom_controller');
const turnController = require('../controllers/turnos_controller');

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('index');
});


// Autoload for routes using :escapeRoomId
router.param('escapeRoomId', escapeRoomController.load);
router.param('turnoId', turnController.load);


// Routes for the resource /escapeRooms
router.get('/escapeRooms',                     escapeRoomController.index);
router.get('/escapeRooms/:escapeRoomId(\\d+)',       escapeRoomController.show);
router.get('/escapeRooms/new',                 escapeRoomController.new);
router.post('/escapeRooms',                    escapeRoomController.create);
router.get('/escapeRooms/:escapeRoomId(\\d+)/edit',  escapeRoomController.edit);
router.put('/escapeRooms/:escapeRoomId(\\d+)',       escapeRoomController.update);
router.delete('/escapeRooms/:escapeRoomId(\\d+)',    escapeRoomController.destroy);

router.post('/escapeRooms/:escapeRoomId(\\d+)/turnos',     turnController.create);
router.delete('/escapeRooms/:escapeRoomId(\\d+)/turnos/:turnoId(\\d+)',  turnController.destroy);

module.exports = router;