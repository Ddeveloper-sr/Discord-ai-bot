const mongoose = require('mongoose');
const { config } = require('../config');
const logger = require('../logger');

async function connectDatabase() {
  try {
    await mongoose.connect(config.mongodb.uri);
    logger.success('Database', 'Connected to MongoDB');
  } catch (err) {
    logger.error('Database', 'Failed to connect to MongoDB', err);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    logger.error('Database', 'MongoDB connection error', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('Database', 'MongoDB disconnected');
  });
}

module.exports = { connectDatabase };
