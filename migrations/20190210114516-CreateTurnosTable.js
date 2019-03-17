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
                    "type": Sequelize.STRING,
                    "validate": {"notEmpty": {"msg": "La fecha no puede estar vacía."}}
                },
                "indications": {
                    "type": Sequelize.STRING
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
