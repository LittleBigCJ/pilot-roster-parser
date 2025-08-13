import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'No text provided' });
  }

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant for analyzing pilot rosters and flight logs." },
        { role: "user", content: text },
      ],
      max_tokens: 500,
    });

    res.status(200).json({ result: completion.data.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'OpenAI API request failed' });
  }
}