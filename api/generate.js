export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, systemInstruction, jsonMode = false } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  const cleanJson = (str) => {
    let cleaned = str.trim();
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return cleaned.slice(firstBrace, lastBrace + 1);
    }
    return cleaned;
  };

  // 1. Try Google Gemini API if GEMINI_API_KEY is configured in Vercel
  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash'];
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
          `[https://generativelanguage.googleapis.com/v1beta/models/$](https://generativelanguage.googleapis.com/v1beta/models/$){model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }
        );

        const data = await response.json();
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          const text = data.candidates[0].content.parts[0].text;
          return res.status(200).json({
            text: jsonMode ? cleanJson(text) : text.trim(),
            provider: model
          });
        }
      } catch (e) {
        console.warn(`Gemini ${model} failed:`, e.message);
      }
    }
  }

  // 2. Automatic Free Keyless LLM Fallback (Always works even without GEMINI_API_KEY)
  try {
    const fallbackRes = await fetch('[https://text.pollinations.ai/](https://text.pollinations.ai/)', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: systemInstruction || 'You are a helpful AI tutor.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'openai',
        jsonMode: Boolean(jsonMode)
      })
    });

    if (fallbackRes.ok) {
      const rawText = await fallbackRes.text();
      return res.status(200).json({
        text: jsonMode ? cleanJson(rawText) : rawText.trim(),
        provider: 'free-ai-engine'
      });
    }
  } catch (err) {
    console.error('Fallback AI error:', err);
  }

  return res.status(500).json({ error: 'AI generation service temporarily unavailable.' });
}