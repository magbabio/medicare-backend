'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hashear la contraseña antes de insertarla
    const hashedPassword = await bcrypt.hash('adminpassword', 10); // Reemplaza 'adminpassword' con la contraseña deseada

    await queryInterface.bulkInsert('Users', [
      {
        email: 'admin@example.com',
        password: hashedPassword, // Usar la contraseña hasheada
        role: 'admin',
        deletedAt: null, 
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
