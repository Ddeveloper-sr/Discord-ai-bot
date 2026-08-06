require('dotenv').config();

function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const config = {
  discord: {
    token: requireEnv('DISCORD_TOKEN'),
    clientId: requireEnv('CLIENT_ID'),
    guildId: process.env.GUILD_ID || null,
  },

  groq: {
    apiKeys: (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '')
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean),
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  },

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/discord-ai-bot',
  },

  bot: {
    maxMemoryMessages: Number(process.env.MAX_MEMORY_MESSAGES) || 20,
    ownerIds: (process.env.OWNER_IDS || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean),
  },
};

if (config.groq.apiKeys.length === 0) {
  throw new Error('At least one GROQ_API_KEY / GROQ_API_KEYS is required');
}

if (config.groq.apiKeys.length > 4) {
  console.warn('[Config] More than 4 Groq keys provided – only the first 4 will be used');
  config.groq.apiKeys = config.groq.apiKeys.slice(0, 4);
}

module.exports = { config };
