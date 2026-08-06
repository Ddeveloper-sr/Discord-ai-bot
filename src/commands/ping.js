const {
  SlashCommandBuilder,
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
} = require('discord.js');

const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Check bot latency with Components V2');

async function execute(interaction) {
  await interaction.deferReply({
    flags: MessageFlags.IsComponentsV2,
  });

  const wsPing = interaction.client.ws.ping;
  const roundtrip = Date.now() - interaction.createdTimestamp;

  const avatar = interaction.client.user?.displayAvatarURL({
    extension: 'png',
    size: 128,
  });

  const container = new ContainerBuilder()
    .setAccentColor(0x2f6fd6)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent('### 🏓 Pong!')
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setDivider(true)
        .setSpacing(SeparatorSpacingSize.Small)
    )
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            [
              `**WebSocket**  \`${wsPing}ms\``,
              `**Round-trip**  \`${roundtrip}ms\``,
              `**API Latency**  \`${Math.max(0, roundtrip - wsPing)}ms\``,
            ].join('\n')
          )
        )
        .setThumbnailAccessory(
          avatar
            ? new ThumbnailBuilder().setURL(avatar)
            : new ThumbnailBuilder().setURL('https://cdn.discordapp.com/embed/avatars/0.png')
        )
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setDivider(false)
        .setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# Components V2 • ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}`
      )
    );

  await interaction.editReply({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  });
}

module.exports = { data, execute };
