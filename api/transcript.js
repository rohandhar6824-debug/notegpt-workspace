function extractJsonArray(sourceHtml, marker) {
  const idx = sourceHtml.indexOf(marker);
  if (idx === -1) return null;
  const startBracket = sourceHtml.indexOf('[', idx + marker.length);
  if (startBracket === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = startBracket; i < sourceHtml.length; i++) {
    const ch = sourceHtml[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\') {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (ch === '[') depth++;
      else if (ch === ']') {
        depth--;
        if (depth === 0) {
          return sourceHtml.slice(startBracket, i + 1);
        }
      }
    }
  }
  return null;
}

function decodeHtmlEntities(str) {
  return (str || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/\s+/g, ' ')
    .trim();
}

function parseCaptionPayload(rawText) {
  const items = [];
  const trimmed = (rawText || '').trim();

  if (trimmed.indexOf('{') === 0) {
    try {
      const json = JSON.parse(trimmed);
      if (Array.isArray(json.events)) {
        for (let i = 0; i < json.events.length; i++) {
          const ev = json.events[i];
          if (Array.isArray(ev.segs)) {
            const text = decodeHtmlEntities(ev.segs.map(s => s.utf8 || '').join(''));
            if (text) {
              items.push({
                start: Math.floor((ev.tStartMs || 0) / 1000),
                text
              });
            }
          }
        }
      }
      if (items.length > 0) return items;
    } catch (e) {
      // Fall through
    }
  }

  const textRegex = /<text[^>]*start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
  let m;
  while ((m = textRegex.exec(trimmed)) !== null) {
    const clean = decodeHtmlEntities(m[2].replace(/<[^>]+>/g, ''));
    if (clean) {
      items.push({ start: Math.floor(parseFloat(m[1])), text: clean });
    }
  }
  if (items.length > 0) return items;

  const pRegex = /<p[^>]*t="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  while ((m = pRegex.exec(trimmed)) !== null) {
    const clean = decodeHtmlEntities(m[2].replace(/<[^>]+>/g, ''));
    if (clean) {
      items.push({ start: Math.floor(parseInt(m[1], 10) / 1000), text: clean });
    }
  }

  return items;
}

function groupIntoParagraphs(subtitles) {
  if (!Array.isArray(subtitles) || subtitles.length === 0) return [];
  const paragraphs = [];
  let currentStart = subtitles[0].start;
  let buffer = [];
  let wordCount = 0;

  for (let i = 0; i < subtitles.length; i++) {
    const seg = subtitles[i];
    if (buffer.length === 0) {
      currentStart = seg.start;
    }
    buffer.push(seg.text);
    wordCount += seg.text.split(' ').length;

    const timeSpan = seg.start - currentStart;
    const endsSentence = /[.!?]$/.test(seg.text);

    if ((wordCount >= 55 && endsSentence) || wordCount >= 80 || timeSpan >= 35 || i === subtitles.length - 1) {
      paragraphs.push({
        start: currentStart,
        text: buffer.join(' ')
      });
      buffer = [];
      wordCount = 0;
    }
  }
  return paragraphs;
}

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
  let rawSubtitles = [];

  try {
    const oembedRes = await fetch('https://noembed.com/embed?url=https://www.youtube.com/watch?v=' + videoId);
    if (oembedRes.ok) {
      const oe = await oembedRes.json();
      videoTitle = oe.title || '';
      authorName = oe.author_name || '';
    }
  } catch (e) {
    console.warn('oEmbed warning:', e.message);
  }

  try {
    const playerRes = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip'
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: 'ANDROID',
            clientVersion: '19.09.37',
            androidSdkVersion: 30,
            hl: 'en',
            gl: 'US'
          }
        },
        videoId: videoId
      })
    });

    if (playerRes.ok) {
      const playerData = await playerRes.json();
      if (!videoTitle && playerData.videoDetails?.title) {
        videoTitle = playerData.videoDetails.title;
      }
      if (!authorName && playerData.videoDetails?.author) {
        authorName = playerData.videoDetails.author;
      }
      if (playerData.videoDetails?.shortDescription) {
        description = playerData.videoDetails.shortDescription.slice(0, 2000);
      }

      const tracks = playerData.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      if (Array.isArray(tracks) && tracks.length > 0) {
        const enTrack = tracks.find(t => t.languageCode && t.languageCode.indexOf('en') === 0) || tracks[0];
        if (enTrack?.baseUrl) {
          const capRes = await fetch(enTrack.baseUrl);
          const capText = await capRes.text();
          rawSubtitles = parseCaptionPayload(capText);
        }
      }
    }
  } catch (e) {
    console.warn('InnerTube ANDROID fallback:', e.message);
  }

  if (rawSubtitles.length === 0) {
    try {
      const watchRes = await fetch('https://www.youtube.com/watch?v=' + videoId, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      const html = await watchRes.text();

      if (!videoTitle) {
        const titleMatch = html.match(/<title>(.*?) - YouTube<\/title>/);
        if (titleMatch?.[1]) videoTitle = decodeHtmlEntities(titleMatch[1]);
      }

      if (!description) {
        const descMatch = html.match(/"shortDescription":"((?:[^"\\]|\\.)*)"/);
        if (descMatch?.[1]) {
          description = descMatch[1].replace(/\\n/g, ' ').replace(/\\"/g, '"').slice(0, 2000);
        }
      }

      const tracksJsonStr = extractJsonArray(html, '"captionTracks":');
      if (tracksJsonStr) {
        const tracks = JSON.parse(tracksJsonStr);
        const enTrack = tracks.find(t => t.languageCode && t.languageCode.indexOf('en') === 0) || tracks[0];
        if (enTrack?.baseUrl) {
          const xmlRes = await fetch(enTrack.baseUrl);
          const xmlText = await xmlRes.text();
          rawSubtitles = parseCaptionPayload(xmlText);
        }
      }
    } catch (e) {
      console.warn('Watch scrape warning:', e.message);
    }
  }

  const paragraphs = groupIntoParagraphs(rawSubtitles);

  return res.status(200).json({
    videoId,
    videoTitle: videoTitle || 'YouTube Video',
    authorName: authorName || 'YouTube Creator',
    description,
    hasRealCaptions: rawSubtitles.length > 0,
    paragraphs,
    subtitles: rawSubtitles
  });
}
// === END OF FILE ===