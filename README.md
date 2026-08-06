# Discord Groq AI Bot

A personal Discord AI bot powered by **Groq** (ultra-fast LLM inference) with conversation memory stored in **MongoDB**.

Built with TypeScript + discord.js (Components V2).

---

## Features

- ⚡ **Groq AI** – uses up to **4 API keys** with automatic rotation & cooldown
- 🧠 **Conversation Memory** – per-user + per-channel history in MongoDB
- 🎭 **Custom Persona** – edit `persona.ts` to change personality
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

## 1. Clone / create the project

```bash
# if you already have the files, just open the folder
cd discord-groq-ai-bot
```

## 2. Install dependencies

```bash
npm install
```

## 3. Environment variables

Copy the example and fill in your values:

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

### How to get the Discord values

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application → Bot → Reset Token → copy `DISCORD_TOKEN`
3. Under **OAuth2 → General** copy the **Client ID** → `CLIENT_ID`
4. Enable these **Privileged Gateway Intents**:
   - Message Content Intent
   - Server Members Intent (optional)
5. Invite the bot with scopes `bot` + `applications.commands` and permissions:
   - Send Messages, Embed Links, Read Message History, Use Slash Commands

### How to get Groq keys

1. Sign up at [console.groq.com](https://console.groq.com)
2. Create up to 4 API keys
3. Paste them comma-separated in `GROQ_API_KEYS`

Recommended models (2026):

| Model                        | Speed     | Quality      | Notes                    |
|-----------------------------|-----------|--------------|--------------------------|
| `llama-3.3-70b-versatile`   | Fast      | Excellent    | Default – best balance   |
| `llama-3.1-8b-instant`      | Very fast | Good         | Lowest latency           |
| `openai/gpt-oss-120b`       | Fast      | Very strong  | Larger context           |
| `moonshotai/kimi-k2-instruct` | Fast    | Strong       | Long context             |

## 4. Create your persona

```bash
cp src/persona.ts.example src/persona.ts
```

Open `src/persona.ts` and edit the `system` prompt to match the personality you want.

## 5. Register slash commands

```bash
npm run register
```

- If you set `GUILD_ID` the commands appear **instantly** in that server (recommended while developing).
- Without `GUILD_ID` they are registered globally (can take up to 1 hour).

## 6. Run the bot

Development (auto-reload):

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

You should see the banner and:

```
● Ready  Logged in as YourBot#1234 • 1 guild(s)
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
│   ├── ping.ts          # Components V2 ping
│   ├── chat.ts          # /chat slash command
│   └── clear-memory.ts
├── events/
│   ├── ready.ts
│   ├── interactionCreate.ts
│   └── messageCreate.ts # @mention handling
├── models/
│   └── Conversation.ts  # MongoDB schema
├── services/
│   ├── database.ts
│   ├── groq.ts          # 4-key rotation client
│   └── memory.ts        # conversation history helpers
├── client.ts
├── config.ts
├── index.ts
├── logger.ts
├── persona.ts.example
└── register-commands.ts
```

---

## Memory system

- Each **user + channel** pair has its own conversation document.
- Only the last `MAX_MEMORY_MESSAGES` (default 20) messages are kept.
- Memory is automatically trimmed with `$slice`.
- `/clear-memory` deletes the document for the current channel.

---

## Key rotation (Groq)

The bot keeps an internal state for each of the (up to) 4 keys:

- Round-robin selection among healthy keys
- After 3 consecutive failures a key is put on a **60-second cooldown**
- Rate-limit (429) and 5xx errors automatically rotate to the next key

This lets you stay under Groq’s free-tier rate limits for much longer.

---

## Troubleshooting

| Problem                        | Solution                                              |
|--------------------------------|-------------------------------------------------------|
| Commands don’t appear          | Run `npm run register` again, wait a few minutes      |
| “Missing Access”               | Re-invite the bot with `applications.commands` scope  |
| MongoDB connection refused     | Make sure MongoDB is running / check Atlas IP allowlist |
| Groq 429 / rate limit          | Add more API keys or lower usage                      |
| `persona.ts` not found         | Copy the example file: `cp src/persona.ts.example src/persona.ts` |
| Components V2 looks broken     | Update discord.js: `npm i discord.js@latest`          |

---

## License

MIT – feel free to use and modify for your own personal bots.

Made with ⚡ Groq + Discord Components V2
