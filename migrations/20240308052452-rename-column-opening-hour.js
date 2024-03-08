'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Restaurants', 'opening_hours', 'opening_hour')
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Restaurants', 'opening_hour', 'opening_hours')
  }
};
