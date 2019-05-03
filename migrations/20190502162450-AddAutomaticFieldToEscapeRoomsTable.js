"use strict";

module.exports = {

    "up": (queryInterface, Sequelize) => queryInterface.addColumn("escapeRooms", "automatic", Sequelize.STRING, {"defaultValue": false}),
    "down": (queryInterface, Sequelize) => queryInterface.removeColumn("escapeRooms", "automatic", Sequelize.STRING)

};
