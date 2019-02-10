
const path = require('path');

// Load ORM
const Sequelize = require('sequelize');

const url = process.env.DATABASE_URL || "sqlite:escapeRoom.sqlite";

const sequelize = new Sequelize(url);

// Import the definition of the Escape Room Table from escapeRoom.js
sequelize.import(path.join(__dirname, 'escapeRoom'));

// Session
sequelize.import(path.join(__dirname,'session'));

// Import the definition of the Turns Table from turno.js
sequelize.import(path.join(__dirname,'turno'));

// Relation between models

const {escapeRoom, turno} = sequelize.models;

turno.belongsTo(escapeRoom);
escapeRoom.hasMany(turno);

module.exports=sequelize;