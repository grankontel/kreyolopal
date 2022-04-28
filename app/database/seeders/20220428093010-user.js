'use strict';

const thistime = new Date()

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
     await queryInterface.bulkInsert('Users', [{
      firstname: 'Thierry',
      lastname: 'Malo',
      email: 'thierry.malo@gmail.com',
      // password: 'admin',
      password: '$argon2i$v=19$m=4096,t=3,p=1$J798EU39yRBwFMKZH0AJ3w$f+uuY3j3nQ8Tmr/B6qLeb7d0j8S0WnvtCQ4nD+i0AD0',
      createdAt: thistime,
      updatedAt: thistime,
    }], {});

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     await queryInterface.bulkDelete('Users', null, {});
  }
};
