module.exports = function (sequelize, DataTypes) {

    return sequelize.define(
        "escapeRoom",
        {
            "title": {
                "type": DataTypes.STRING,
                "validate": {"notEmpty": {"msg": "El título no puede estar vacío."}}
            },
            "subject": {
                "type": DataTypes.STRING,
                "validate": {"notEmpty": {"msg": "El nombre de la asignatura no puede estar vacío."}}
            },
            "duration": {
                "type": DataTypes.STRING,
                "validate": {"notEmpty": {"msg": "La duración no puede estar vacía."}}
            },
            "description": {
                "type": DataTypes.STRING
            },
            "video": {
                "type": DataTypes.STRING
            },
            "nmax": {
                "type": DataTypes.STRING,
                "validate": {"notEmpty": {"msg": "El número de participantes no puede estar vacío."}}
            },
            "invitation": {
                "type": DataTypes.STRING,
                "validate": {"notEmpty": {"msg": "La URL de la invitación no puede estar vacía."}}
            },
            "appearance": {
                "type": DataTypes.STRING,
                "defaultValue": "litera"
            },
            "survey": {
                "type": DataTypes.STRING
            },
            "pretest": {
                "type": DataTypes.STRING
            },
            "posttest": {
                "type": DataTypes.STRING
            }

        }
    );

};
