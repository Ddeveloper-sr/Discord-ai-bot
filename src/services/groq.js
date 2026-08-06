const Groq = require('groq-sdk');
const { config } = require('../config');
const logger = require('../logger');

class GroqService {
  constructor() {
    this.keys = config.groq.apiKeys.map((key) => ({
      key,
      failures: 0,
      cooldownUntil: 0,
    }));
    this.currentIndex = 0;
    this.MAX_FAILURES = 3;
    this.COOLDOWN_MS = 60_000; // 60 seconds

    logger.info('Groq', `Loaded ${this.keys.length} API key(s) for rotation`);
  }

  getNextKey() {
    const now = Date.now();
    const available = this.keys.filter((k) => k.cooldownUntil <= now);

    if (available.length === 0) {
      const soonest = [...this.keys].sort((a, b) => a.cooldownUntil - b.cooldownUntil)[0];
      logger.warn('Groq', 'All keys on cooldown – using the soonest available');
      return soonest.key;
    }

    const idx = this.currentIndex % available.length;
    this.currentIndex = (this.currentIndex + 1) % Math.max(available.length, 1);
    return available[idx].key;
  }

  markFailure(apiKey) {
    const state = this.keys.find((k) => k.key === apiKey);
    if (!state) return;

    state.failures += 1;
    if (state.failures >= this.MAX_FAILURES) {
      state.cooldownUntil = Date.now() + this.COOLDOWN_MS;
      state.failures = 0;
      logger.warn('Groq', `Key ...${apiKey.slice(-6)} entered cooldown for 60s`);
    }
  }

  markSuccess(apiKey) {
    const state = this.keys.find((k) => k.key === apiKey);
    if (state) {
      state.failures = 0;
    }
  }

  async chat(messages, options = {}) {
    const maxRetries = this.keys.length;
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const apiKey = this.getNextKey();
      const client = new Groq({ apiKey });

      try {
        const completion = await client.chat.completions.create({
          model: config.groq.model,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 1024,
        });

        this.markSuccess(apiKey);
        const content = completion.choices[0]?.message?.content?.trim();
        if (!content) {
          throw new Error('Empty response from Groq');
        }
        return content;
      } catch (err) {
        lastError = err;
        const status = err?.status ?? err?.response?.status;

        if (status === 429 || status >= 500) {
          this.markFailure(apiKey);
          logger.warn('Groq', `Request failed (status ${status}) – rotating key`);
          continue;
        }

        logger.error('Groq', `Non-retryable error: ${err.message || err}`);
        throw err;
      }
    }

    throw lastError ?? new Error('All Groq API keys failed');
  }
}

const groqService = new GroqService();

module.exports = { groqService };
