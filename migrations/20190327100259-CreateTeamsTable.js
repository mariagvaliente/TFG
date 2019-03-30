"use strict";

module.exports = {"up" (queryInterface, Sequelize) {
    return queryInterface.createTable(
        "teams",
        {"id": {"type": Sequelize.INTEGER,
            "allowNull": false,
            "primaryKey": true,
            "autoIncrement": true,
            "unique": true},
        "name": {"type": Sequelize.STRING,
            "validate": {"notEmpty": {"msg": "El nombre no puede estar vacío."}}},
        "createdAt": {"type": Sequelize.DATE,
            "allowNull": false},
        "updatedAt": {"type": Sequelize.DATE,
            "allowNull": false}},
        {"sync": {"force": true}}
    );
},
down (queryInterface) {
    return queryInterface.dropTable("teams");
}};
