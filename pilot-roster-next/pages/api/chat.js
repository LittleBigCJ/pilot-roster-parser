import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;

    const headers = [
      "DATE", "TYPE", "REG.", "PILOT IN COMMAND", "STUDENT OR CO-PILOT", "DETAILS",
      "DUAL (SINGLE-ENGINE)", "PIC (SINGLE-ENGINE)",
      "DUAL (MULTI-ENGINE)", "PIC (MULTI-ENGINE)", "CO-PILOT (MULTI-ENGINE)",
      "COMM'D PRACTICE (MULTI-ENGINE)",
      "DUAL (INSTRUMENT)", "PIC (INSTRUMENT)", "CO-PILOT (INSTRUMENT)",
      "COMM'D PRACTICE (INSTRUMENT)",
      "ACTUAL", "SIMULATED", "GROUND",
      "NON-PREC. APPROACHES", "PRECISION APPROACHES",
      "CUSTOM1", "CUSTOM2", "CUSTOM3", "CUSTOM4", "CUSTOM5",
      "DUTY DAY", "DUTY NIGHT", "TAKEOFFS DAY", "TAKEOFFS NIGHT",
      "LANDINGS DAY", "LANDINGS NIGHT"
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-2024-11-20",
      messages: [
        {
          role: "system",
          content:
            "You are a logbook data formatter. You take raw OCR text from flight records and return ONLY a Markdown table in the exact header order provided. No explanations, no extra text."
        },
        {
          role: "user",
          content: `Here are the headers: ${headers.join(", ")}\n\nOCR text:\n${text}`
        }
      ],
      temperature: 0
    });

    res.status(200).json({ table: completion.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({ error: "OpenAI API request failed" });
  }
}