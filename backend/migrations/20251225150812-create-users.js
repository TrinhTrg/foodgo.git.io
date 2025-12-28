'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Kiểm tra bảng users đã tồn tại chưa
    const tableExists = await queryInterface.tableExists('users');

    if (tableExists) {
      console.log('Table users already exists, checking indexes...');

      // Lấy danh sách 
      const indexes = await queryInterface.showIndex('users');
      const indexNames = indexes.map(idx => idx.name);

      // Index cho firebase_uid (unique)
      if (!indexNames.includes('users_firebase_uid_unique')) {
        await queryInterface.addIndex('users', ['firebase_uid'], {
          unique: true,
          name: 'users_firebase_uid_unique'
        });
      }

      return;
    }

    // 2. Tạo bảng nếu chưa tồn tại
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(191),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: true // Firebase user không cần password
      },
      firebase_uid: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true
      },
      auth_provider: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'local'
      },
      avatar: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      phone_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Số điện thoại của người dùng'
      },
      role: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'user'
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
    const indexes = await queryInterface.showIndex('users');
    const indexNames = indexes.map(idx => idx.name);

    if (!indexNames.includes('users_firebase_uid_unique')) {
      await queryInterface.addIndex('users', ['firebase_uid'], {
        unique: true,
        name: 'users_firebase_uid_unique'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};