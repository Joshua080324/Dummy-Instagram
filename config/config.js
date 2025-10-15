/**
 * Sequelize configuration file
 * Supports Supabase / PostgreSQL with SSL
 */

require('dotenv').config(); // pastikan dotenv dipanggil di awal

const useSSL = process.env.DB_SSL === 'true';

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
    define: { timestamps: true },
    dialectOptions: useSSL ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  },

  test: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
    dialectOptions: useSSL ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  },

  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
    dialectOptions: useSSL ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  },
};
