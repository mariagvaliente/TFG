"use strict";

module.exports = {

  "up": (queryInterface, Sequelize) => queryInterface.addColumn("escapeRooms", "automatic", Sequelize.STRING, {
    "defaultValue": "si"}),
  "down": (queryInterface, Sequelize) => queryInterface.removeColumn("escapeRooms", "automatic", Sequelize.STRING)

};
