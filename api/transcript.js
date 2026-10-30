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
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  let videoTitle = '';
  let authorName = '';
  let description = '';

  try {
    const oembedUrl = 'https://noembed.com/embed?url=https://www.youtube.com/watch?v=' + videoId;
    const oembedRes = await fetch(oembedUrl);
    if (oembedRes.ok) {
      const oembedData = await oembedRes.json();
      videoTitle = oembedData.title || '';
      authorName = oembedData.author_name || '';
    }
  } catch (e) {
    console.warn('oEmbed failed:', e);
  }

  try {
    const watchUrl = 'https://www.youtube.com/watch?v=' + videoId;
    const watchRes = await fetch(watchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const html = await watchRes.text();

    if (!videoTitle) {
      const titleMatch = html.match(/<title>(.*?) - YouTube<\/title>/);
      if (titleMatch?.[1]) videoTitle = titleMatch[1];
    }

    const descMatch = html.match(/"shortDescription":"((?:[^"\\]|\\.)*)"/);
    if (descMatch?.[1]) {
      description = descMatch[1].replace(/\\n/g, ' ').replace(/\\"/g, '"').slice(0, 1500);
    }

    const captionMatch = html.match(/"captionTracks":(\[.*?\])/);
    if (captionMatch?.[1]) {
      const tracks = JSON.parse(captionMatch[1]);
      const enTrack = tracks.find(t => t.languageCode && t.languageCode.indexOf('en') === 0) || tracks[0];
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
            videoTitle: videoTitle || 'YouTube Video',
            authorName: authorName || 'YouTube Creator',
            description,
            hasRealCaptions: true,
            transcript
          });
        }
      }
    }
  } catch (e) {
    console.warn('Watch scrape fallback:', e);
  }

  return res.status(200).json({
    videoId,
    videoTitle: videoTitle || 'YouTube Video',
    authorName: authorName || 'YouTube Creator',
    description,
    hasRealCaptions: false,
    transcript: []
  });
}