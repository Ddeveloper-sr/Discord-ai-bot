const { REST, Routes } = require('discord.js');
const { config } = require('./config');
const logger = require('./logger');

const ping = require('./commands/ping');
const chat = require('./commands/chat');
const clearMemory = require('./commands/clear-memory');

const commands = [ping.data.toJSON(), chat.data.toJSON(), clearMemory.data.toJSON()];

async function register() {
  const rest = new REST({ version: '10' }).setToken(config.discord.token);

  try {
    logger.info('Register', `Registering ${commands.length} slash command(s)...`);

    if (config.discord.guildId) {
      await rest.put(
        Routes.applicationGuildCommands(
          config.discord.clientId,
          config.discord.guildId
        ),
        { body: commands }
      );
      logger.success('Register', `Commands registered for guild ${config.discord.guildId}`);
    } else {
      await rest.put(Routes.applicationCommands(config.discord.clientId), {
        body: commands,
      });
      logger.success('Register', 'Global commands registered (may take up to 1h to appear)');
    }
  } catch (err) {
    logger.error('Register', 'Failed to register commands', err);
    process.exit(1);
  }
}

register();
