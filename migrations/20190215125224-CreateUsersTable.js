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
            name: {
                type: Sequelize.STRING,
                unique: true,
                validate: {notEmpty: {msg: "Name must not be empty."}}
            },
            surname: {
                type: Sequelize.STRING,
                unique: true,
                validate: {notEmpty: {msg: "Surname must not be empty."}}
            },
            gender: {
                type: Sequelize.STRING,
                unique: true,
                validate: {notEmpty: {msg: "Gender must not be empty."}}
            },
            username: {
                type: Sequelize.STRING,
                unique: true,
                validate: {
                notEmpty: {msg: "Username must not be empty."}}
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
            isStudent: {
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
