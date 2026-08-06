# Discord Groq AI Bot (JavaScript)

A personal Discord AI bot powered by **Groq** (ultra-fast LLM inference) with conversation memory stored in **MongoDB**.

Built with plain JavaScript + discord.js (Components V2).

---

## Features

- ⚡ **Groq AI** – uses up to **4 API keys** with automatic rotation & cooldown
- 🧠 **Conversation Memory** – per-user + per-channel history in MongoDB
- 🎭 **Custom Persona** – edit `persona.js` to change personality
- 🏓 **Components V2 Ping** – modern UI using Discord’s new display components
- 💬 **Two ways to chat**
  - Slash command: `/chat message:...`
  - Mention the bot: `@Bot hello!`
- 🗑️ `/clear-memory` – wipe your history in the current channel
- 📜 Pretty coloured console logger + file logging

---

## Prerequisites

- **Node.js 20+**
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)
- A Discord application + bot token
- 1–4 free Groq API keys → [console.groq.com/keys](https://console.groq.com/keys)

---

## 1. Setup

```bash
cd discord-groq-ai-bot
npm install
```

## 2. Environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Discord
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_client_id
GUILD_ID=optional_guild_id_for_dev   # leave empty for global commands

# Groq – up to 4 keys, comma-separated
GROQ_API_KEYS=gsk_xxxx1,gsk_xxxx2,gsk_xxxx3,gsk_xxxx4
GROQ_MODEL=llama-3.3-70b-versatile

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/discord-ai-bot
# or Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/discord-ai-bot

# Optional
MAX_MEMORY_MESSAGES=20
OWNER_IDS=123456789012345678
```

### Discord setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application → Bot → Reset Token → copy `DISCORD_TOKEN`
3. Under **OAuth2 → General** copy the **Client ID** → `CLIENT_ID`
4. Enable **Message Content Intent** (and Server Members Intent if needed)
5. Invite the bot with scopes `bot` + `applications.commands`

### Groq keys

1. Sign up at [console.groq.com](https://console.groq.com)
2. Create up to 4 API keys
3. Paste them comma-separated in `GROQ_API_KEYS`

Recommended models:

| Model                        | Speed     | Quality      |
|-----------------------------|-----------|--------------|
| `llama-3.3-70b-versatile`   | Fast      | Excellent    |
| `llama-3.1-8b-instant`      | Very fast | Good         |
| `openai/gpt-oss-120b`       | Fast      | Very strong  |

## 3. Create your persona

```bash
cp src/persona.js.example src/persona.js
```

Open `src/persona.js` and edit the `system` prompt.

## 4. Register slash commands

```bash
npm run register
```

- With `GUILD_ID` set → commands appear **instantly**
- Without → global (can take up to 1 hour)

## 5. Run the bot

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

---

## Commands

| Command            | Description                                      |
|--------------------|--------------------------------------------------|
| `/ping`            | Latency check using **Components V2**            |
| `/chat message:`   | Talk to the AI (saves memory)                    |
| `/clear-memory`    | Delete your conversation history in this channel |

You can also just **@mention** the bot in any channel.

---

## Project structure

```
src/
├── commands/
│   ├── ping.js          # Components V2 ping
│   ├── chat.js
│   └── clear-memory.js
├── events/
│   ├── ready.js
│   ├── interactionCreate.js
│   └── messageCreate.js # @mention handling
├── models/
│   └── Conversation.js
├── services/
│   ├── database.js
│   ├── groq.js          # 4-key rotation
│   └── memory.js
├── client.js
├── config.js
├── index.js
├── logger.js
├── persona.js.example
└── register-commands.js
```

---

## Memory system

- Each **user + channel** pair has its own conversation document
- Only the last `MAX_MEMORY_MESSAGES` (default 20) messages are kept
- `/clear-memory` deletes the document for the current channel

---

## Key rotation (Groq)

- Round-robin among healthy keys
- After 3 consecutive failures → 60-second cooldown
- 429 / 5xx errors automatically rotate to the next key

---

## Troubleshooting

| Problem                        | Solution                                              |
|--------------------------------|-------------------------------------------------------|
| Commands don’t appear          | Run `npm run register` again                          |
| “Missing Access”               | Re-invite bot with `applications.commands` scope      |
| MongoDB connection refused     | Check MongoDB is running / Atlas IP allowlist         |
| Groq 429                       | Add more API keys                                     |
| `persona.js` not found         | `cp src/persona.js.example src/persona.js`            |
| Components V2 broken           | `npm i discord.js@latest`                             |

---

## License

MIT

Made with ⚡ Groq + Discord Components V2
