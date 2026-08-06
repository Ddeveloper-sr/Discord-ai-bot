const { createClient } = require('./client');
const { connectDatabase } = require('./services/database');
const { config } = require('./config');
const logger = require('./logger');

async function main() {
  logger.banner();
  logger.info('Boot', 'Starting Discord AI bot...');

  await connectDatabase();

  const client = createClient();

  client.login(config.discord.token).catch((err) => {
    logger.error('Boot', 'Failed to login', err);
    process.exit(1);
  });
}

main();
