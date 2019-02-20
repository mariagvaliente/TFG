'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('users',
        {
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
          },
          username: {
            type: Sequelize.STRING,
            unique: true,
            validate: {
              notEmpty: {msg: "Username must not be empty."}
            }
          },
          password: {
            type: Sequelize.STRING,
            validate: {notEmpty: {msg: "Password must not be empty."}}
          },
          salt: {
            type: Sequelize.STRING
          },
          isAdmin: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false
          }
        },
        {
          sync: {force: true}
        }
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('users');
  }
};
