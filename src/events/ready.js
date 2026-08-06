const logger = require('../logger');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    logger.success(
      'Ready',
      `Logged in as ${client.user?.tag} • ${client.guilds.cache.size} guild(s)`
    );
  },
};
