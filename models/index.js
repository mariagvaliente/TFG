const path = require("path");

// Load ORM
const Sequelize = require("sequelize");

const url = process.env.DATABASE_URL || "sqlite:escapeRoom.sqlite";

const sequelize = new Sequelize(url);

// Import the definition of the Escape Room Table from escapeRoom.js
sequelize.import(path.join(__dirname, "escapeRoom"));

// Session
sequelize.import(path.join(__dirname, "session"));

// Import the definition of the Turns Table from turno.js
sequelize.import(path.join(__dirname, "turno"));

// Import the definition of the Attachment Table from attachment.js
sequelize.import(path.join(__dirname, "attachment"));

// Import the definition of the User Table from user.js
sequelize.import(path.join(__dirname, "user"));


// Relation between models

const {escapeRoom, turno, attachment, user} = sequelize.models;

// Relation 1-to-1 between Escape Room and Turn:
turno.belongsTo(escapeRoom);
escapeRoom.hasMany(turno);

// Relation 1-to-1 between Escape Room and Attachment:
attachment.belongsTo(escapeRoom);
escapeRoom.hasOne(attachment);


// Relation 1-to-N between User and Quiz:
user.hasMany(escapeRoom, {"foreignKey": "authorId"});
escapeRoom.belongsTo(user, {"as": "author",
    "foreignKey": "authorId"});


module.exports = sequelize;
