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

// Import the definition of the User Table from puzzle.js (Retos)
sequelize.import(path.join(__dirname, "puzzle"));

// Import the definition of the User Table from hint.js (Pistas)
sequelize.import(path.join(__dirname, "hint"));


// Relation between models

const {escapeRoom, turno, attachment, user, puzzle, hint} = sequelize.models;

// Relation 1-to-N between Escape Room and Turn:
turno.belongsTo(escapeRoom);
escapeRoom.hasMany(turno, {"onDelete": "CASCADE",
    "hooks": true});

// Relation 1-to-1 between Escape Room and Attachment:
attachment.belongsTo(escapeRoom);
escapeRoom.hasOne(attachment, {"onDelete": "CASCADE",
    "hooks": true});

// Relation 1-to-N between Escape Room and Puzzle:
puzzle.belongsTo(escapeRoom);
escapeRoom.hasMany(puzzle, {"onDelete": "CASCADE",
    "hooks": true});

// Relation 1-to-N between Puzzle and Hint:
hint.belongsTo(puzzle);
puzzle.hasMany(hint, {"onDelete": "CASCADE",
    "hooks": true});

// Relation 1-to-N between User and Quiz:
user.hasMany(escapeRoom, {"foreignKey": "authorId"});
escapeRoom.belongsTo(user, {"as": "author",
    "foreignKey": "authorId"});


module.exports = sequelize;
