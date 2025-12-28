'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('favorite_places');

    if (!tableExists) {
      await queryInterface.createTable('favorite_places', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        restaurant_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'restaurants',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      });
    }

    const indexes = await queryInterface.showIndex('favorite_places');
    const indexNames = indexes.map(i => i.name);

    if (!indexNames.includes('unique_user_restaurant_favorite')) {
      await queryInterface.addIndex(
        'favorite_places',
        ['user_id', 'restaurant_id'],
        {
          unique: true,
          name: 'unique_user_restaurant_favorite'
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('favorite_places');
  }
};
