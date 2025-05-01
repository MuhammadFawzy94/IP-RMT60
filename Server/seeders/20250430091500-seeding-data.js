'use strict';
const {hashPassword} = require('../helpers/bcrypt')
const fs = require('fs').promises

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let dataUser = JSON.parse(await fs.readFile('./data/user.json', 'utf-8')).map(el => {
      el.password = hashPassword(el.password)
      el.createdAt = new Date()
      el.updatedAt = new Date()
      return el
    }
    )
    let dataMechanic = JSON.parse(await fs.readFile('./data/mechanic.json', 'utf-8')).map(el => {
      el.password = hashPassword(el.password)
      el.createdAt = new Date()
      el.updatedAt = new Date()
      return el
    }
    )
    let dataPackage = JSON.parse(await fs.readFile('./data/servicePackage.json', 'utf-8')).map(el => {
      el.createdAt = new Date()
      el.updatedAt = new Date()
      return el
    }
    )
    let dataPost = JSON.parse(await fs.readFile('./data/post.json', 'utf-8')).map(el => {
      el.createdAt = new Date()
      el.updatedAt = new Date()
      return el
    }
    )
    await queryInterface.bulkInsert('Users', dataUser, {})
    await queryInterface.bulkInsert('Mechanics', dataMechanic, {})
    await queryInterface.bulkInsert('Packages', dataPackage, {})
    await queryInterface.bulkInsert('Posts', dataPost, {})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {})
    await queryInterface.bulkDelete('Mechanics', null, {})
    await queryInterface.bulkDelete('Packages', null, {})
    await queryInterface.bulkDelete('Posts', null, {})
  }
};
