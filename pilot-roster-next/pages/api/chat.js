import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "No text provided" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant for analyzing pilot rosters and flight logs.",
        },
        { role: "user", content: text },
      ],
      max_tokens: 500,
    });

    res.status(200).json({ result: completion.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({ error: "OpenAI API request failed" });
  }
}