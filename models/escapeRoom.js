
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('escapeRoom',
        {
            title:{
                type: DataTypes.STRING,
                validate: {notEmpty: {msg: "El título no puede estar vacío."}}
            },
            teacher:{
                type: DataTypes.STRING,
                validate: {notEmpty: {msg: "El nombre del profesor/a no puede estar vacío."}}
            },
            subject:{
                type: DataTypes.STRING,
                validate: {notEmpty: {msg: "El nombre de la asignatura no puede estar vacío."}}
            },
            duration:{
                type: DataTypes.STRING,
                validate: {notEmpty: {msg: "La duración no puede estar vacía."}}
            },
            description:{
                type: DataTypes.STRING,
                validate: {notEmpty: {msg: "La descripción no puede estar vacía."}}
            },
            video:{
                type: DataTypes.STRING,
                validate: {notEmpty: {msg: "La URL del vídeo no puede estar vacía."}}
            },
            nmax:{
                type: DataTypes.STRING,
                validate: {notEmpty: {msg: "El número de participantes no puede estar vacío."}}
            },
            invitation:{
                type: DataTypes.STRING,
                validate: {notEmpty: {msg: "La URL de la invitación no puede estar vacía."}}
            }
        })
};

