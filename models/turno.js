module.exports = function (sequelize, DataTypes) {

    return sequelize.define(
        "turno",
        {

            "date": {
                "type": DataTypes.DATE,
                "allowNull": false
            },
            "start": {
                "type": DataTypes.STRING,
                "validate": {"notEmpty": {"msg": "La hora no puede estar vacía."}}
            },
            "duration": {
                "type": DataTypes.STRING,
                "validate": {"notEmpty": {"msg": "La duración no puede estar vacía."}}
            },
            "narrative": {
                "type": DataTypes.STRING,
                "validate": {"notEmpty": {"msg": "La narrativa no puede estar vacía."}}
            }
        }
    );

};
