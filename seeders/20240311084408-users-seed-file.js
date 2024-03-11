'use strict';
const bcrypt = require('bcryptjs')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [
      {
        email: 'test',
        password: await bcrypt.hash('test', 10),
        is_admin: true,
        name: 'root',
        created_at: new Date(),
        updated_at: new Date()
      }, {
        email: 'user1@123',
        password: await bcrypt.hash('test', 10),
        is_admin: false,
        name: 'user1',
        created_at: new Date(),
        updated_at: new Date()
      }, {
        email: 'user2@123.com',
        password: await bcrypt.hash('test', 10),
        is_admin: false,
        name: 'user2',
        created_at: new Date(),
        updated_at: new Date()
      }

    ])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', {})
  }
};
