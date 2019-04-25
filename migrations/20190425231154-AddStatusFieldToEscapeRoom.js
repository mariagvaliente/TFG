"use strict";

module.exports = {"up": (queryInterface, Sequelize) => queryInterface.addColumn("escapeRooms", "status", {type: Sequelize.STRING, defaultValue: "pending"}).
then(() => queryInterface.addColumn("escapeRooms", "startTime", Sequelize.DATE)),

    "down": (queryInterface) => queryInterface.removeColumn("escapeRooms", "status").
    then(() => queryInterface.removeColumn("escapeRooms", "startTime"))};

