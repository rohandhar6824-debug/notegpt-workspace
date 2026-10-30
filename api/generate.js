export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, systemInstruction, videoId } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash'];
    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      try {
        const parts = [{ text: prompt }];

        const payload = {
          contents: [{ parts: parts }],
          generationConfig: {
            temperature: 0.3
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
            text: candidateText.trim(),
            provider: model
          });
        }
      } catch (e) {
        console.warn('Gemini error:', e.message);
      }
    }
  }

  // Automatic Keyless Fallback
  try {
    const fallbackRes = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai',
        messages: [
          { role: 'system', content: systemInstruction || 'You are an expert academic tutor.' },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (fallbackRes.ok) {
      const fbData = await fallbackRes.json();
      const rawText = fbData.choices?.[0]?.message?.content || '';
      if (rawText) {
        return res.status(200).json({
          text: rawText.trim(),
          provider: 'fallback-ai'
        });
      }
    }
  } catch (err) {
    console.error('Fallback error:', err);
  }

  return res.status(500).json({ error: 'AI service temporarily unavailable' });
}