"use strict";

module.exports = {
  "up" (queryInterface, Sequelize) {

    return queryInterface.addColumn(
        "turnos",
        "participantId",
        {"type": Sequelize.INTEGER}
    );

  },

  "down" (queryInterface) {

    return queryInterface.removeColumn("turnos", "participantId");

  }
};
