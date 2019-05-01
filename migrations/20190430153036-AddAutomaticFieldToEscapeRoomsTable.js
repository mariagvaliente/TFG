"use strict";

module.exports = {
  "up": (queryInterface, Sequelize) => queryInterface.addColumn("escapeRooms", "automatic", Sequelize.STRING, {"allowNull": false,
    "defaultValue": "no"}),
  "down": (queryInterface) => queryInterface.removeColumn("escapeRooms", "automatic")
};
