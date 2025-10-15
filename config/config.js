/**
 * Sequelize configuration file
 * Provides sensible defaults for development/test/production
 * Uses environment variables when available so CI/production can override.
 */

module.exports = {
  development: {
    // Use single env var 'db' as connection URL for now (e.g. postgres://user:pass@host:port/db)
    url: process.env.db || null,
    dialect: 'postgres',
    logging: false,
    define: { timestamps: true },
    dialectOptions: process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {},
  },

  test: {
    url: process.env.db || null,
    dialect: 'postgres',
    logging: false,
    dialectOptions: process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {},
  },

  production: {
    url: process.env.db || null,
    dialect: 'postgres',
    logging: false,
    dialectOptions: process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {},
  },
};
