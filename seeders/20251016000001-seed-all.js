'use strict';
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const dataPath = path.join(__dirname, '..', 'data');
      const users = JSON.parse(fs.readFileSync(path.join(dataPath, 'users.json'), 'utf8'));
      const categories = JSON.parse(fs.readFileSync(path.join(dataPath, 'categories.json'), 'utf8'));
      const posts = JSON.parse(fs.readFileSync(path.join(dataPath, 'posts.json'), 'utf8'));
      const likes = JSON.parse(fs.readFileSync(path.join(dataPath, 'likes.json'), 'utf8'));
      const chats = JSON.parse(fs.readFileSync(path.join(dataPath, 'chats.json'), 'utf8'));
      const messages = JSON.parse(fs.readFileSync(path.join(dataPath, 'messages.json'), 'utf8'));

      // Add timestamps to all records
      const timestamp = new Date();
      const addTimestamps = (records) => {
        return records.map(record => ({
          ...record,
          createdAt: timestamp,
          updatedAt: timestamp
        }));
      };

      // Seed categories first
      await queryInterface.bulkInsert('Categories', addTimestamps(categories));

      // Seed users with hashed passwords
      const usersWithHashedPasswords = await Promise.all(
        users.map(async (user) => ({
          ...user,
          password: await bcrypt.hash(user.password, 10)
        }))
      );
      await queryInterface.bulkInsert('Users', addTimestamps(usersWithHashedPasswords));

      // Seed posts and their images
      const postsWithoutImages = posts.map(({ images, ...post }) => post);
      await queryInterface.bulkInsert('Posts', addTimestamps(postsWithoutImages));

      // Seed images
      const images = posts.reduce((acc, post, index) => {
        const postImages = post.images.map(image => ({
          ...image,
          PostId: index + 1
        }));
        return [...acc, ...postImages];
      }, []);
      await queryInterface.bulkInsert('Images', addTimestamps(images));

      // Seed likes
      await queryInterface.bulkInsert('Likes', addTimestamps(likes));

      // Seed chats
      await queryInterface.bulkInsert('Chats', addTimestamps(chats));

      // Seed messages
      await queryInterface.bulkInsert('Messages', addTimestamps(messages));

    } catch (error) {
      console.error('Error seeding data:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Remove all seeded data in reverse order
      await queryInterface.bulkDelete('Messages', null, {});
      await queryInterface.bulkDelete('Chats', null, {});
      await queryInterface.bulkDelete('Likes', null, {});
      await queryInterface.bulkDelete('Images', null, {});
      await queryInterface.bulkDelete('Posts', null, {});
      await queryInterface.bulkDelete('Users', null, {});
      await queryInterface.bulkDelete('Categories', null, {});
    } catch (error) {
      console.error('Error removing data:', error);
      throw error;
    }
  }
};