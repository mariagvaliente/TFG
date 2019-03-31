"use strict";

const crypt = require("../helpers/crypt");

module.exports = {up (queryInterface) {
    return queryInterface.bulkInsert("users", [
        {"name": "Maria",
            "surname": "Garcia Valiente",
            "gender": "Femenino",
            "username": "admin@upm.es",
            "password": crypt.encryptPassword("1234", "aaaa"),
            "salt": "aaaa",
            "isAdmin": true,
            "dni": "18737085C",
            "createdAt": new Date(),
            "updatedAt": new Date()},
        {"name": "Pepe",
            "surname": "Lopez Garcia",
            "gender": "Masculino",
            "username": "pepe@alumnos.upm.es",
            "password": crypt.encryptPassword("5678", "bbbb"),
            "salt": "bbbb",
            "isStudent": true,
            "dni": "79881145Y",
            "createdAt": new Date(),
            "updatedAt": new Date()}
    ]);
},

down (queryInterface) {
    return queryInterface.bulkDelete("users", null, {});
}};
