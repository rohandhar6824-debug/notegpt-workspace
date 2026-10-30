export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, systemInstruction, jsonMode = false } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is missing in Vercel Environment Variables.' });
  }

  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastError = null;

  for (const model of models) {
    try {
      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          ...(jsonMode ? { responseMimeType: "application/json" } : {})
        }
      };

      if (systemInstruction) {
        payload.systemInstruction = { parts: [{ text: systemInstruction }] };
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        let rawText = data.candidates[0].content.parts[0].text.trim();
        if (jsonMode) {
          rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();
        }
        return res.status(200).json({ text: rawText, modelUsed: model });
      } else {
        lastError = data.error?.message || `HTTP ${response.status}`;
      }
    } catch (err) {
      lastError = err.message;
    }
  }

  return res.status(500).json({ error: lastError || 'Failed to generate AI response.' });
}