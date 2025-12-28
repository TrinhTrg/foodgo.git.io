'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Kiểm tra bảng restaurant_categories đã tồn tại chưa
    const tableExists = await queryInterface.tableExists('restaurant_categories');

    if (!tableExists) {
      // 2. Tạo bảng nếu chưa tồn tại
      await queryInterface.createTable('restaurant_categories', {
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
        category_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'categories',
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

    // 3. Kiểm tra index unique trước khi tạo
    const indexes = await queryInterface.showIndex('restaurant_categories');
    const indexNames = indexes.map(idx => idx.name);
    if (!indexNames.includes('unique_restaurant_category')) {
      await queryInterface.addIndex(
        'restaurant_categories',
        ['restaurant_id', 'category_id'],
        {
          unique: true,
          name: 'unique_restaurant_category'
        }
      );
    }

    // 4. Migrate dữ liệu từ category_id cũ sang bảng mới nếu chưa có dữ liệu
    const [results] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) as count FROM restaurant_categories
    `);
    if (results[0].count === 0) {
      await queryInterface.sequelize.query(`
        INSERT INTO restaurant_categories (restaurant_id, category_id, createdAt, updatedAt)
          SELECT 
          restaurants.id,
          restaurants.category_id,
          restaurants.createdAt,
          restaurants.updatedAt
        FROM restaurants
        WHERE category_id IS NOT NULL
        ON DUPLICATE KEY UPDATE
        restaurant_categories.updatedAt = restaurant_categories.updatedAt
      `);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('restaurant_categories');
  }
};