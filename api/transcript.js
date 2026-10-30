export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { videoUrl } = req.body;
  if (!videoUrl) {
    return res.status(400).json({ error: 'videoUrl is required' });
  }

  const videoIdMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;

  if (!videoId) {
    return res.status(400).json({ error: 'Invalid YouTube URL provided.' });
  }

  let videoTitle = "YouTube Video";
  let authorName = "Creator";
  let description = "";

  // 1. Fetch official title & author via YouTube oEmbed
  try {
    const oembedRes = await fetch(`[https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=$](https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=$){videoId}&format=json`);
    if (oembedRes.ok) {
      const oembedData = await oembedRes.json();
      videoTitle = oembedData.title || videoTitle;
      authorName = oembedData.author_name || authorName;
    }
  } catch (e) {
    console.warn("oEmbed error:", e);
  }

  // 2. Fetch page metadata & attempt caption extraction
  try {
    const watchRes = await fetch(`[https://www.youtube.com/watch?v=$](https://www.youtube.com/watch?v=$){videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const html = await watchRes.text();

    const descMatch = html.match(/"shortDescription":"((?:[^"\\]|\\.)*)"/);
    if (descMatch && descMatch[1]) {
      description = descMatch[1].replace(/\\n/g, ' ').replace(/\\"/g, '"').slice(0, 1500);
    }

    const captionMatch = html.match(/"captionTracks":(\[.*?\])/);
    if (captionMatch && captionMatch[1]) {
      const tracks = JSON.parse(captionMatch[1]);
      const enTrack = tracks.find(t => t.languageCode?.startsWith('en')) || tracks[0];
      if (enTrack?.baseUrl) {
        const xmlRes = await fetch(enTrack.baseUrl);
        const xml = await xmlRes.text();
        const transcript = [];
        const regex = /<text start="([\d.]+)" dur="([\d.]+)">(.*?)<\/text>/g;
        let m;
        while ((m = regex.exec(xml)) !== null) {
          const clean = m[3]
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/\n/g, ' ')
            .trim();
          if (clean) {
            transcript.push({ start: parseFloat(m[1]), text: clean });
          }
        }
        if (transcript.length > 0) {
          return res.status(200).json({
            videoId,
            videoTitle,
            authorName,
            description,
            hasRealCaptions: true,
            transcript
          });
        }
      }
    }
  } catch (e) {
    console.warn("Caption scrape fallback:", e);
  }

  // Return metadata so Gemini can generate topic-accurate timestamped notes & study tools
  return res.status(200).json({
    videoId,
    videoTitle,
    authorName,
    description,
    hasRealCaptions: false,
    transcript: []
  });
}