
const crypt = require("../helpers/crypt");// Definition of the User model:

module.exports = function (sequelize, DataTypes) {
    const User = sequelize.define("user", {"name": {"type": DataTypes.STRING,
        "validate": {"notEmpty": {"msg": "Name must not be empty."}}},
    "surname": {"type": DataTypes.STRING,
        "validate": {"notEmpty": {"msg": "Surname must not be empty."}}},
    "gender": {"type": DataTypes.STRING,
        "validate": {"notEmpty": {"msg": "Gender must not be empty."}}},
    "username": {"type": DataTypes.STRING,
        "unique": true,
        "isEmail": true},
    "password": {"type": DataTypes.STRING,
        "validate": {"notEmpty": {"msg": "Password must not be empty."}},
        set (password) {
            // Random String used as salt.
            this.salt = String(Math.round(new Date().valueOf() * Math.random()));
            this.setDataValue("password", crypt.encryptPassword(password, this.salt));
        }},
    "salt": {"type": DataTypes.STRING},
    "dni": {"type": DataTypes.STRING,
        "unique": true,
        "validate": {"notEmpty": {"msg": "DNI must not be empty."},
            "isValidDNI": (dni) => {
                const expresion_regular_dni = /^\d{8}[a-zA-Z]$/;

                if (expresion_regular_dni.test(dni) === true) {
                    let numero = dni.substr(0, dni.length - 1);
                    const letr = dni.substr(dni.length - 1, 1);

                    numero %= 23;
                    const letra = "TRWAGMYFPDXBNJZSQVHLCKET".substring(numero, numero + 1);

                    if (letra !== letr.toUpperCase()) {
                        throw new Error("Dni erroneo, la letra del NIF no se corresponde");
                    }
                } else {
                    throw new Error("Dni erroneo, formato no válido");
                }
            }}},
    "isAdmin": {"type": DataTypes.BOOLEAN,
        "defaultValue": false},
    "isStudent": {"type": DataTypes.BOOLEAN,
        "defaultValue": false}});

    User.prototype.verifyPassword = function (password) {
        return crypt.encryptPassword(password, this.salt) === this.password;
    };

    return User;
};
