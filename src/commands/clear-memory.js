const {
  SlashCommandBuilder,
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
} = require('discord.js');
const { clearConversation } = require('../services/memory');

const data = new SlashCommandBuilder()
  .setName('clear-memory')
  .setDescription('Clear your conversation memory in this channel');

async function execute(interaction) {
  const cleared = await clearConversation(
    interaction.user.id,
    interaction.channelId
  );

  const container = new ContainerBuilder()
    .setAccentColor(cleared ? 0x0fa37f : 0xc47a00)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        cleared
          ? '### Memory cleared\nYour conversation history in this channel has been deleted.'
          : '### Nothing to clear\nNo conversation history found for you in this channel.'
      )
    );

  await interaction.reply({
    components: [container],
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
  });
}

module.exports = { data, execute };
