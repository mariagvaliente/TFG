"use strict";

module.exports = {
    up (queryInterface, Sequelize) {

        return queryInterface.createTable(
            "escapeRooms",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true,
                    "unique": true
                },
                "title": {
                    "type": Sequelize.STRING,
                    "validate": {"notEmpty": {"msg": "El título no puede estar vacío."}}
                },
                "teacher": {
                    "type": Sequelize.STRING,
                    "validate": {"notEmpty": {"msg": "El nombre del profesor no puede estar vacío."}}
                },
                "subject": {
                    "type": Sequelize.STRING,
                    "validate": {"notEmpty": {"msg": "El nombre de la asignatura no puede estar vacío."}}
                },
                "duration": {
                    "type": Sequelize.STRING,
                    "validate": {"notEmpty": {"msg": "La duración no puede estar vacía."}}
                },
                "description": {
                    "type": Sequelize.STRING,
                    "validate": {"notEmpty": {"msg": "La descripción no puede estar vacía."}}
                },
                "video": {
                    "type": Sequelize.STRING,
                    "validate": {"notEmpty": {"msg": "La URL del vídeo no puede estar vacía."}}
                },
                "nmax": {
                    "type": Sequelize.STRING,
                    "allowNull": false
                },
                "invitation": {
                    "type": Sequelize.STRING,
                    "defaultValue": Math.random().toString(36).substr(2),
                    "validate": {"notEmpty": {"msg": "La URL de la invitación no puede estar vacía."}}
                },
                "appearance": {
                    "type": Sequelize.STRING,
                    "defaultValue": "litera",
                    "validate": {"notEmpty": {"msg": "La apariencia no puede estar vacía."}}
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "validate": {"notEmpty": {"msg": "El número de participantes no puede estar vacío."}}
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

        return queryInterface.dropTable("escapeRooms");

    }
};

// Generate random token

function random() {
    return Math.random().toString(36).substr(2); // Eliminar `0.`
};
