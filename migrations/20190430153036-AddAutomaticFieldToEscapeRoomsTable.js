"use strict";

module.exports = {
  "up": (queryInterface, Sequelize) => queryInterface.addColumn("escapeRooms", "automatic", Sequelize.BOOLEAN, {"allowNull": false,
    "defaultValue": false}),
  "down": (queryInterface) => queryInterface.removeColumn("escapeRooms", "automatic")
};
