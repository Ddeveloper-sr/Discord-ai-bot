const logger = require('../logger');

const ping = require('../commands/ping');
const chat = require('../commands/chat');
const clearMemory = require('../commands/clear-memory');

const commands = new Map([
  [ping.data.name, ping],
  [chat.data.name, chat],
  [clearMemory.data.name, clearMemory],
]);

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      logger.error('Command', `Error in /${interaction.commandName}`, err);

      const reply = {
        content: '❌ An unexpected error occurred while running this command.',
        ephemeral: true,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply).catch(() => null);
      } else {
        await interaction.reply(reply).catch(() => null);
      }
    }
  },
};
