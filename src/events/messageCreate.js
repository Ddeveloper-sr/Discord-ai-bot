const {
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

module.exports = {
  name: 'messageCreate',
  once: false,
  async execute(message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const client = message.client;
    const mentioned =
      message.mentions.has(client.user) &&
      !message.mentions.everyone &&
      !message.mentions.roles.size;

    if (!mentioned) return;

    const content = message.content
      .replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '')
      .trim();

    if (!content) {
      await message.reply("Hey! Mention me with a message and I'll reply.");
      return;
    }

    await message.channel.sendTyping().catch(() => null);

    try {
      const persona = loadPersona();

      const messages = await buildPrompt(
        message.author.id,
        message.channel.id,
        content,
        persona.system
      );

      const reply = await groqService.chat(messages);

      await appendMessages(
        message.author.id,
        message.channel.id,
        message.guild.id,
        [
          { role: 'user', content, timestamp: new Date() },
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

      await message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { repliedUser: true },
      });
    } catch (err) {
      logger.error('Message', 'Failed to reply to mention', err);
      await message.reply('❌ Something went wrong while generating a reply.').catch(() => null);
    }
  },
};
