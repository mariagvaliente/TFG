'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
        'escapeRooms',
        'authorId',
        {type: Sequelize.INTEGER}
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('escapeRooms', 'authorId');
  }
};