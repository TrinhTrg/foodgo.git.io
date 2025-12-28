'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Kiểm tra bảng menu_items đã tồn tại chưa
    const tableExists = await queryInterface.tableExists('menu_items');

    if (!tableExists) {
      // 2. Tạo bảng nếu chưa tồn tại
      await queryInterface.createTable('menu_items', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
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
        name: {
          type: Sequelize.STRING(200),
          allowNull: false
        },
        price: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0
        },
        image_url: {
          type: Sequelize.STRING(500),
          allowNull: true
        },
        category: {
          type: Sequelize.ENUM('appetizer', 'main_course', 'dessert', 'drink', 'other'),
          allowNull: false,
          defaultValue: 'other'
        },
        is_popular: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        status: {
          type: Sequelize.ENUM('pending_approval', 'approved', 'rejected'),
          allowNull: false,
          defaultValue: 'pending_approval'
        },
        rejection_reason: {
          type: Sequelize.TEXT,
          allowNull: true
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
    const indexes = await queryInterface.showIndex('menu_items');
    const indexNames = indexes.map(idx => idx.name);

    if (!indexNames.includes('idx_menu_items_restaurant_id')) {
      await queryInterface.addIndex('menu_items', ['restaurant_id'], { name: 'idx_menu_items_restaurant_id' });
    }

    if (!indexNames.includes('idx_menu_items_status')) {
      await queryInterface.addIndex('menu_items', ['status'], { name: 'idx_menu_items_status' });
    }

    if (!indexNames.includes('idx_menu_items_category')) {
      await queryInterface.addIndex('menu_items', ['category'], { name: 'idx_menu_items_category' });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('menu_items');
  }
};
