export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, systemInstruction, jsonMode = false } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  const extractJsonBlock = (str) => {
    const text = (str || '').trim();
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) {
      return text.slice(first, last + 1);
    }
    return text;
  };

  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash'];
    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      try {
        const payload = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            ...(jsonMode ? { responseMimeType: 'application/json' } : {})
          }
        };

        if (systemInstruction) {
          payload.systemInstruction = { parts: [{ text: systemInstruction }] };
        }

        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (response.ok && candidateText) {
          return res.status(200).json({
            text: jsonMode ? extractJsonBlock(candidateText) : candidateText.trim(),
            provider: model
          });
        }
      } catch (e) {
        console.warn('Gemini error:', e.message);
      }
    }
  }

  try {
    const fallbackRes = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai',
        messages: [
          { role: 'system', content: systemInstruction || 'You are a helpful AI tutor.' },
          { role: 'user', content: prompt }
        ],
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
      })
    });

    if (fallbackRes.ok) {
      const fbData = await fallbackRes.json();
      const rawText = fbData.choices?.[0]?.message?.content || '';
      if (rawText) {
        return res.status(200).json({
          text: jsonMode ? extractJsonBlock(rawText) : rawText.trim(),
          provider: 'fallback-ai'
        });
      }
    }
  } catch (err) {
    console.error('Fallback error:', err);
  }

  return res.status(500).json({ error: 'AI generation service unavailable' });
}