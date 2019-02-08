const express = require('express');
const router = express.Router();

const escapeRoomController = require('../controllers/escapeRoom_controller');

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('index');
});


// Autoload for routes using :escapeRoomId
router.param('escapeRoomId', escapeRoomController.load);


// Routes for the resource /escapeRooms
router.get('/escapeRooms',                     escapeRoomController.index);
router.get('/escapeRooms/:escapeRoomId(\\d+)',       escapeRoomController.show);
router.get('/escapeRooms/new',                 escapeRoomController.new);
router.post('/escapeRooms',                    escapeRoomController.create);

module.exports = router;