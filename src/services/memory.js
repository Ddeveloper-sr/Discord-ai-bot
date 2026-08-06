const { Conversation } = require('../models/Conversation');
const { config } = require('../config');

async function getConversationHistory(userId, channelId) {
  const doc = await Conversation.findOne({ userId, channelId }).lean();
  return doc?.messages ?? [];
}

async function appendMessages(userId, channelId, guildId, newMessages) {
  const max = config.bot.maxMemoryMessages;

  await Conversation.findOneAndUpdate(
    { userId, channelId },
    {
      $push: {
        messages: {
          $each: newMessages,
          $slice: -max,
        },
      },
      $set: { guildId },
    },
    { upsert: true, new: true }
  );
}

async function clearConversation(userId, channelId) {
  const result = await Conversation.deleteOne({ userId, channelId });
  return result.deletedCount > 0;
}

async function clearAllUserConversations(userId) {
  const result = await Conversation.deleteMany({ userId });
  return result.deletedCount;
}

/**
 * Builds the message array that will be sent to Groq,
 * including the system persona + recent history.
 */
async function buildPrompt(userId, channelId, userMessage, systemPrompt) {
  const history = await getConversationHistory(userId, channelId);

  const messages = [{ role: 'system', content: systemPrompt }];

  for (const msg of history) {
    messages.push({
      role: msg.role,
      content: msg.content,
    });
  }

  messages.push({ role: 'user', content: userMessage });
  return messages;
}

module.exports = {
  getConversationHistory,
  appendMessages,
  clearConversation,
  clearAllUserConversations,
  buildPrompt,
};
