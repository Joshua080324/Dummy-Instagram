/**
 * Sequelize configuration file
 * Supports Supabase / PostgreSQL with SSL
 */

require('dotenv').config(); // load environment variables first

const useSSL = process.env.DB_SSL === 'true';

// Test database should use SQLite for faster tests
const testConfig = {
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
  define: { timestamps: true }
};

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
    define: { timestamps: true },
    dialectOptions: useSSL ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  },

  test: testConfig,

  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres', 
    logging: false,
    define: { timestamps: true },
    dialectOptions: useSSL ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  }
};