module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        "turno",
        {"date": {"type": DataTypes.DATE,
            "validate": {"notEmpty": {"msg": "La fecha no puede estar vacía."}}},
        "indications": {"type": DataTypes.STRING}}
    );
};
