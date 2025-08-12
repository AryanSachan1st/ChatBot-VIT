const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);
module.exports = {
  openai,
  async embedding(text) {
    const res = await openai.createEmbedding({ model: 'text-embedding-3-small', input: text });
    return res.data.data[0].embedding;
  },
  async chat(messages, opts = {}) {
    const res = await openai.createChatCompletion({
      model: opts.model || 'gpt-4o-mini',
      messages,
      max_tokens: opts.max_tokens || 512,
      temperature: typeof opts.temperature === 'number' ? opts.temperature : 0.2,
    });
    return res.data.choices[0].message;
  },
};