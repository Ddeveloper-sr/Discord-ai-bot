const { Schema, model } = require('mongoose');

const MessageSchema = new Schema(
  {
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ConversationSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    channelId: { type: String, required: true, index: true },
    guildId: { type: String, default: null },
    messages: { type: [MessageSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast lookup of a user's conversation in a channel
ConversationSchema.index({ userId: 1, channelId: 1 }, { unique: true });

const Conversation = model('Conversation', ConversationSchema);

module.exports = { Conversation };
