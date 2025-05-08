'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'paymentStatus', {
      type: Sequelize.STRING,
      defaultValue: 'unpaid'
    });
    await queryInterface.addColumn('Orders', 'paymentMethod', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('Orders', 'transactionId', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('Orders', 'transactionToken', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('Orders', 'totalAmount', {
      type: Sequelize.INTEGER
    });
    await queryInterface.addColumn('Orders', 'transferProof', {
      type: Sequelize.STRING
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'paymentStatus');
    await queryInterface.removeColumn('Orders', 'paymentMethod');
    await queryInterface.removeColumn('Orders', 'transactionId');
    await queryInterface.removeColumn('Orders', 'transactionToken');
    await queryInterface.removeColumn('Orders', 'totalAmount');
    await queryInterface.removeColumn('Orders', 'transferProof');
  }
};