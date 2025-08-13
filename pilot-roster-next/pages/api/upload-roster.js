
import { IncomingForm } from 'formidable';
import { readFileSync } from 'fs';
import { OpenAI } from 'openai';

export const config = {
  api: {
    bodyParser: false, // Required to use formidable for file uploads
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: 'Error parsing the form data' });
    if (!files.roster) return res.status(400).json({ error: 'No roster file uploaded' });

    try {
      const file = files.roster;
      const fileContent = readFileSync(file.filepath, 'utf-8');

      const prompt = `
Parse this pilot roster CSV text and extract flights with these fields:
Date, Flight Number, Departure ICAO, Arrival ICAO, Aircraft Type, Block Out Time, Block In Time, Position

CSV Text:
${fileContent}

Respond ONLY with a JSON array of flight objects.
`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
      });

      let parsedFlights = [];
      try {
        parsedFlights = JSON.parse(completion.choices[0].message.content);
      } catch {
        return res.status(500).json({
          error: 'Failed to parse AI response as JSON',
          aiResponse: completion.choices[0].message.content,
        });
      }

      res.status(200).json({ parsedFlights });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });
}