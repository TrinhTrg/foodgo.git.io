'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const categories = [
      { id: 1, name: 'Coffee', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'Fast Food', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: 'BBQ', createdAt: new Date(), updatedAt: new Date() },
      { id: 4, name: 'Vietnamese', createdAt: new Date(), updatedAt: new Date() },
      { id: 5, name: 'Dessert', createdAt: new Date(), updatedAt: new Date() },
      { id: 6, name: 'Seafood', createdAt: new Date(), updatedAt: new Date() },
      { id: 7, name: 'Ice Cream', createdAt: new Date(), updatedAt: new Date() },
      { id: 8, name: 'Bar', createdAt: new Date(), updatedAt: new Date() },
      { id: 9, name: 'Chè', createdAt: new Date(), updatedAt: new Date() },
      { id: 10, name: 'Restaurant', createdAt: new Date(), updatedAt: new Date() }
    ];

    try {
      // Kiểm tra xem đã có dữ liệu categories chưa
      const existingCategories = await queryInterface.sequelize.query(
        `SELECT name FROM categories`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      const existingNames = existingCategories.map(cat => cat.name);

      // Chỉ insert những category chưa tồn tại
      const categoriesToInsert = categories.filter(cat => !existingNames.includes(cat.name));

      if (categoriesToInsert.length > 0) {
        await queryInterface.bulkInsert('categories', categoriesToInsert, {
          ignoreDuplicates: true
        });
        console.log(`✅ Đã thêm ${categoriesToInsert.length} categories mới`);
      } else {
        console.log('ℹ️  Tất cả categories đã tồn tại, bỏ qua...');
      }
    } catch (error) {
      // Nếu bảng chưa tồn tại hoặc có lỗi, thử insert với ignoreDuplicates
      if (error.name === 'SequelizeDatabaseError' || error.message.includes('doesn\'t exist')) {
        console.log('⚠️  Bảng categories có thể chưa tồn tại, thử insert với ignoreDuplicates...');
        await queryInterface.bulkInsert('categories', categories, {
          ignoreDuplicates: true
        });
        console.log('✅ Đã thêm categories');
      } else {
        // Nếu lỗi khác, thử insert với ignoreDuplicates để bỏ qua duplicate
        await queryInterface.bulkInsert('categories', categories, {
          ignoreDuplicates: true
        });
        console.log('✅ Đã thêm categories (bỏ qua duplicates)');
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};

