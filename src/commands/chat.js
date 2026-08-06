const {
  SlashCommandBuilder,
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} = require('discord.js');
const { groqService } = require('../services/groq');
const { buildPrompt, appendMessages } = require('../services/memory');
const logger = require('../logger');

function loadPersona() {
  try {
    return require('../persona').persona;
  } catch {
    return {
      name: 'AI',
      system: 'You are a helpful Discord AI assistant. Be concise and friendly.',
      description: 'Default persona',
    };
  }
}

const data = new SlashCommandBuilder()
  .setName('chat')
  .setDescription('Talk to the AI')
  .addStringOption((opt) =>
    opt
      .setName('message')
      .setDescription('What do you want to say?')
      .setRequired(true)
      .setMaxLength(2000)
  );

async function execute(interaction) {
  const userMessage = interaction.options.getString('message', true);
  const persona = loadPersona();

  await interaction.deferReply();

  try {
    const messages = await buildPrompt(
      interaction.user.id,
      interaction.channelId,
      userMessage,
      persona.system
    );

    const reply = await groqService.chat(messages);

    await appendMessages(
      interaction.user.id,
      interaction.channelId,
      interaction.guildId,
      [
        { role: 'user', content: userMessage, timestamp: new Date() },
        { role: 'assistant', content: reply, timestamp: new Date() },
      ]
    );

    const container = new ContainerBuilder()
      .setAccentColor(0x0fa37f)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`### ${persona.name}`)
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(reply.slice(0, 3900))
      );

    await interaction.editReply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  } catch (err) {
    logger.error('Chat', 'Failed to generate reply', err);

    await interaction.editReply({
      content: '❌ Sorry, I ran into an error while thinking. Please try again in a moment.',
    });
  }
}

module.exports = { data, execute };
