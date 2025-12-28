'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Kiểm tra bảng restaurant_views đã tồn tại chưa
    const tableExists = await queryInterface.tableExists('restaurant_views');

    if (!tableExists) {
      // 2. Tạo bảng nếu chưa tồn tại
      await queryInterface.createTable('restaurant_views', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: true, // Hỗ trợ anonymous users
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
        session_id: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: 'Session ID từ frontend để track anonymous users'
        },
        viewed_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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

    // 3. Kiểm tra index trước khi tạo
    const indexes = await queryInterface.showIndex('restaurant_views');
    const indexNames = indexes.map(idx => idx.name);

    if (!indexNames.includes('idx_user_viewed_at')) {
      await queryInterface.addIndex('restaurant_views', ['user_id', 'viewed_at'], { name: 'idx_user_viewed_at' });
    }

    if (!indexNames.includes('idx_session_viewed_at')) {
      await queryInterface.addIndex('restaurant_views', ['session_id', 'viewed_at'], { name: 'idx_session_viewed_at' });
    }

    if (!indexNames.includes('idx_restaurant_id')) {
      await queryInterface.addIndex('restaurant_views', ['restaurant_id'], { name: 'idx_restaurant_id' });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('restaurant_views');
  }
};