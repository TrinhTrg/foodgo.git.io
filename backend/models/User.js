'use strict';

const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
    }

    static async findByEmail(email) {
      return await User.findOne({ where: { email } });
    }

    static async findById(id) {
      return await User.findByPk(id, {
        attributes: ['id', 'name', 'email', 'role', 'phone_number', 'createdAt']
      });
    }

    static async create(values, options) {
      const { name, email, password, role = 'user', phone_number, auth_provider = 'local' } = values;
      
      // Chỉ hash password nếu có password (cho Firebase users không có password)
      let hashedPassword = null;
      if (password) {
        const saltRounds = 10;
        hashedPassword = await bcrypt.hash(password, saltRounds);
      }

      return await super.create(
        { name, email, password: hashedPassword, role, phone_number, auth_provider },
        options
      );
    }

    static async updatePasswordByEmail(email, newPassword) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      const [affected] = await User.update(
        { password: hashedPassword },
        { where: { email } }
      );

      return affected > 0;
    }

    static async comparePassword(plainPassword, hashedPassword) {
      return await bcrypt.compare(plainPassword, hashedPassword);
    }
  }

  User.init(
    {
      name: {
        type: DataTypes.STRING(150),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(191),
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: true // Cho phép null vì Firebase users không cần password
      },
      firebase_uid: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true
      },
      auth_provider: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'local'
      },
      avatar: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      role: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'user'
      },
      phone_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Số điện thoại của người dùng'
      }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true
    }
  );

  return User;
};