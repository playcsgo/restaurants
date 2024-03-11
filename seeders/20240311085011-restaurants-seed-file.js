'use strict';
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Restaurants', 
      Array.from({ length: 50 }, (v, k) => ({
        name: k,
        tel: faker.phone.phoneNumber(),
        address: faker.address.streetAddress(),
        opening_hour: '08:00',
        image: `https://loremflickr.com/320/240/restaurant,food/?random=${Math.random() * 100}`,
        description: faker.lorem.text().substring(0, 100),
        created_at: new Date(),
        updated_at: new Date()
      })))
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Restaurants', null, {})
  }
};
