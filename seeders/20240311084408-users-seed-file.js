'use strict'
const bcrypt = require('bcryptjs')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [{ 
      email: 'root@example.com',
      password: await bcrypt.hash('12345678', 10),
      is_admin: true,
      name: 'root',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      email: 'user1@example.com',
      password: await bcrypt.hash('12345678', 10),
      is_admin: false,
      name: 'user1',
      image: "https://i.imgur.com/4W9Iqmj.png",
      created_at: new Date(),
      updated_at: new Date()
    }, {
      email: 'user2@example.com',
      password: await bcrypt.hash('12345678', 10),
      is_admin: false,
      name: 'user2',
      image: "https://i.imgur.com/kqNaaqZ.jpeg",
      created_at: new Date(),
      updated_at: new Date()
    },{
      email: 'test',
      password: await bcrypt.hash('test', 10),
      is_admin: true,
      name: 'test',
      image: "https://i.imgur.com/7BjXmRm.png",
      created_at: new Date(),
      updated_at: new Date()
    },], {})
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', {})
  }
}