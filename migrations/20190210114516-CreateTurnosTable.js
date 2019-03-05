"use strict";

module.exports = {
    up (queryInterface, Sequelize) {

        return queryInterface.createTable(
            "turnos",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true,
                    "unique": true
                },
                "escapeRoomId": {
                    "type": Sequelize.INTEGER
                },
                "date": {
                    "type": Sequelize.DATE,
                    "allowNull": false
                },
                "start": {
                    "type": Sequelize.STRING,
                    "validate": {"notEmpty": {"msg": "La hora no puede estar vacía."}}
                },
                "duration": {
                    "type": Sequelize.STRING,
                    "validate": {"notEmpty": {"msg": "La duración no puede estar vacía."}}
                },
                "narrative": {
                    "type": Sequelize.STRING,
                    "validate": {"notEmpty": {"msg": "La narrativa no puede estar vacía."}}
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "allowNull": false
                }
            },
            {
                "sync": {"force": true}
            }
        );

    },
    down (queryInterface) {

        return queryInterface.dropTable("turnos");

    }
};
