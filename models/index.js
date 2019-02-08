
const path = require('path');

// Load ORM
const Sequelize = require('sequelize');

const url = process.env.DATABASE_URL || "sqlite:escapeRoom.sqlite";

const sequelize = new Sequelize(url);

// Import the definition of the Escape Room Table from escapeRoom.js
sequelize.import(path.join(__dirname, 'escapeRoom'));


// Create tables
sequelize.sync()
    .then(() => sequelize.models.escapeRoom.count())
    .then(() => console.log('Data Bases created successfully'))
    .catch(error => {
        console.log("Error creating the data base tables:", error);
        process.exit(1);
    });

