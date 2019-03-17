'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('escapeRooms','survey',  Sequelize.STRING)
      .then(()=>{
        return queryInterface.addColumn('escapeRooms','pretest',  Sequelize.STRING)
          .then(()=>{
            return queryInterface.addColumn('escapeRooms','posttest',  Sequelize.STRING);
          });
      });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('escapeRooms','survey')
      .then(()=>{
        return queryInterface.removeColumn('escapeRooms','pretest')
          .then(()=>{
             return queryInterface.removeColumn('escapeRooms','posttest');
          });
      });
  }
};
