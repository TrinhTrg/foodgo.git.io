'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Kiểm tra bảng categories đã tồn tại chưa
    const tableExists = await queryInterface.tableExists('categories');

    if (tableExists) {
      console.log('Table categories already exists, checking indexes...');

      // Lấy danh sách index hiện có
      const indexes = await queryInterface.showIndex('categories');
      const indexNames = indexes.map(idx => idx.name);

      // Index cho name (unique)
      if (!indexNames.includes('categories_name_unique')) {
        await queryInterface.addIndex('categories', ['name'], {
          unique: true,
          name: 'categories_name_unique'
        });
      }

      return;
    }

    // 2. Tạo bảng nếu chưa tồn tại
    await queryInterface.createTable('categories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
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

    // 3. Tạo index nếu chưa tồn tại
    const indexes = await queryInterface.showIndex('categories');
    const indexNames = indexes.map(idx => idx.name);

    if (!indexNames.includes('categories_name_unique')) {
      await queryInterface.addIndex('categories', ['name'], {
        unique: true,
        name: 'categories_name_unique'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('categories');
  }
};
