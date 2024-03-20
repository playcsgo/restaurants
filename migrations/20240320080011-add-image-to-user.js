'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'image',{
      type: Sequelize.STRING,
      defaultValue: 'https://i.imgur.com/30jGE3e.jpeg'
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'image')
  }
};
