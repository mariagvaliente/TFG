'use strict';

module.exports = {
    up(queryInterface, Sequelize) {

        return queryInterface.bulkInsert('escapeRooms', [
            {
                title: 'Escape Room IWEB 2018-React Redux',
                teacher: 'Sonsoles López',
                subject: "IWEB",
                duration: "2 horas",
                description: "Escape room educativa sobre React y Redux en la que los alumnos tendrán que encontrar los errores en el código que les damos.",
                video: "https://www.youtube.com/watch?v=QYh6mYIJG2Y",
                nmax:"50 participantes",
                invitation: "https://www.escaperoomupm.es/ER/uyt24762/join?token=1234",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: 'Escape Room ADSW 2018-Android',
                teacher: 'Juan Antonio De La Puente',
                subject: "ADSW",
                duration: "1:30 horas",
                description: "Escape room educativa sobre Android en la que los alumnos tendrán que encontrar los errores en el código que les damos.",
                video: "https://www.youtube.com/watch?v=QYh6mYIJG2Y",
                nmax:"60 participantes",
                invitation: "https://www.escaperoomupm.es/ER/uyt24762/join?token=1234",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    down(queryInterface, Sequelize) {

        return queryInterface.bulkDelete('escapeRooms', null, {});
    }
};