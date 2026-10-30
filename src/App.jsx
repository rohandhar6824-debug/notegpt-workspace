import React, { useState } from 'react';
import {
  Share2, Rocket, Plus, FileText, MessageSquare, ListFilter,
  Network, LayoutGrid, Presentation, Mic, HelpCircle,
  CreditCard, Cpu, RefreshCw, Send, Copy, Check, ExternalLink, X, Loader2,
  Play, Pause, Video, ChevronLeft, Download, Search, BookOpen, Layers, Compass, Settings
} from 'lucide-react';

function formatSec(sec) {
  const total = Math.max(0, Math.floor(Number(sec) || 0));
  const mm = String(Math.floor(total / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return mm + ':' + ss;
}

function parseTimeToSec(timeStr) {
  if (!timeStr) return 0;
  const parts = String(timeStr).trim().split(':').map(Number);
  if (parts.length === 2) return (parts[0] || 0) * 60 + (parts[1] || 0);
  if (parts.length === 3) return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  return 0;
}

function parseStructuredNotes(rawText, defaultTitle, defaultAuthor) {
  const getSection = (tag) => {
    const marker = '===' + tag + '===';
    const startIdx = rawText.indexOf(marker);
    if (startIdx === -1) return '';
    const contentStart = startIdx + marker.length;
    const nextMatch = rawText.slice(contentStart).search(/===[A-Z_]+===/);
    const sectionText = nextMatch === -1
      ? rawText.slice(contentStart)
      : rawText.slice(contentStart, contentStart + nextMatch);
    return sectionText.trim();
  };

  const headline = getSection('HEADLINE') || ('Deep-Dive Analysis: ' + defaultTitle);

  const summaryRaw = getSection('SUMMARY');
  const summaryParagraphs = summaryRaw
    ? summaryRaw.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
    : ['This video provides a comprehensive exploration of ' + defaultTitle + ' by ' + defaultAuthor + ', breaking down its foundational principles, architecture, and practical mechanics.'];

  const highlightsRaw = getSection('HIGHLIGHTS');
  const highlights = highlightsRaw
    .split('\n')
    .map(l => l.replace(/^[-*•]\s*/, '').trim())
    .filter(l => l.indexOf('|') !== -1)
    .map(l => {
      const parts = l.split('|').map(s => s.trim());
      return {
        time: parts[0] || '00:00',
        title: parts[1] || 'Key Concept',
        detail: parts.slice(2).join(' ') || ''
      };
    });

  const takeawaysRaw = getSection('TAKEAWAYS');
  const takeaways = takeawaysRaw
    .split('\n')
    .map(l => l.replace(/^[-*•\d.]+\s*/, '').trim())
    .filter(Boolean);

  const chaptersRaw = getSection('CHAPTERS');
  const chapters = chaptersRaw
    .split('\n')
    .map(l => l.replace(/^[-*•]\s*/, '').trim())
    .filter(l => l.indexOf('|') !== -1)
    .map(l => {
      const parts = l.split('|').map(s => s.trim());
      return { time: parts[0] || '00:00', title: parts[1] || 'Section' };
    });

  const mindmapRaw = getSection('MINDMAP');
  const mindmapBranches = mindmapRaw
    .split('\n')
    .map(l => l.replace(/^[-*•]\s*/, '').trim())
    .filter(l => l.indexOf('|') !== -1)
    .map(l => {
      const parts = l.split('|').map(s => s.trim());
      return {
        branch: parts[0] || 'Core Topic',
        children: parts.slice(1).filter(Boolean)
      };
    });

  const infoRaw = getSection('INFOGRAPHIC');
  const infographic = infoRaw
    .split('\n')
    .map(l => l.replace(/^[-*•]\s*/, '').trim())
    .filter(l => l.indexOf('|') !== -1)
    .map(l => {
      const parts = l.split('|').map(s => s.trim());
      return {
        metric: parts[0] || 'Key',
        badge: parts[1] || 'Concept',
        title: parts[2] || 'Insight',
        content: parts.slice(3).join(' ') || ''
      };
    });

  const slidesRaw = getSection('SLIDES');
  const slides = slidesRaw
    .split('\n')
    .map(l => l.replace(/^[-*•]\s*/, '').trim())
    .filter(l => l.indexOf('|') !== -1)
    .map(l => {
      const parts = l.split('|').map(s => s.trim());
      const bullets = (parts[1] || '').split(';').map(b => b.trim()).filter(Boolean);
      return {
        title: parts[0] || 'Slide',
        bullets: bullets.length > 0 ? bullets : [parts[1] || 'Key point'],
        notes: parts[2] || ''
      };
    });

  const audioRaw = getSection('AUDIO');
  const audioScript = audioRaw
    .split('\n')
    .map(l => l.replace(/^[-*•]\s*/, '').trim())
    .filter(l => l.indexOf('|') !== -1)
    .map(l => {
      const parts = l.split('|').map(s => s.trim());
      return { speaker: parts[0] || 'Host Alex', text: parts.slice(1).join(' ') };
    });

  const quizRaw = getSection('QUIZ');
  const quiz = quizRaw
    .split('\n')
    .map(l => l.replace(/^[-*•]\s*/, '').trim())
    .filter(l => l.indexOf('|') !== -1)
    .map(l => {
      const parts = l.split('|').map(s => s.trim());
      return {
        prompt: parts[0] || 'Question',
        options: [parts[1] || 'A', parts[2] || 'B', parts[3] || 'C', parts[4] || 'D'],
        answer: parseInt(parts[5], 10) || 0,
        explanation: parts[6] || ''
      };
    });

  const cardsRaw = getSection('FLASHCARDS');
  const flashcards = cardsRaw
    .split('\n')
    .map(l => l.replace(/^[-*•]\s*/, '').trim())
    .filter(l => l.indexOf('|') !== -1)
    .map(l => {
      const parts = l.split('|').map(s => s.trim());
      return { q: parts[0] || 'Concept', a: parts.slice(1).join(' ') || '' };
    });

  const transcriptRaw = getSection('TRANSCRIPT');
  const generatedParagraphs = transcriptRaw
    .split('\n')
    .map(l => l.replace(/^[-*•]\s*/, '').trim())
    .filter(l => l.indexOf('|') !== -1)
    .map(l => {
      const parts = l.split('|').map(s => s.trim());
      return { time: parts[0] || '00:00', text: parts.slice(1).join(' ') };
    });

  return {
    title: defaultTitle,
    author: defaultAuthor,
    headline,
    summaryParagraphs,
    highlights,
    takeaways,
    chapters,
    mindmapBranches,
    infographic,
    slides,
    audioScript,
    quiz,
    flashcards,
    generatedParagraphs
  };
}

export default function App() {
  const [rightTab, setRightTab] = useState('notes'); // 'notes' | 'chat'
  const [leftSubTab, setLeftSubTab] = useState('transcript'); // 'transcript' | 'subtitles' | 'chapter'
  const [activeTool, setActiveTool] = useState('summarize');

  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState(null);
  const [seekSeconds, setSeekSeconds] = useState(0);
  const [videoTitle, setVideoTitle] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [copied, setCopied] = useState(false);

  const [paragraphs, setParagraphs] = useState([]);
  const [subtitles, setSubtitles] = useState([]);
  const [studyData, setStudyData] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [showShareModal, setShowShareModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const extractVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const callAiEngine = async (promptText, sysText, vidId) => {
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          systemInstruction: sysText,
          videoId: vidId
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.text) return data.text;
      }
    } catch (e) {
      console.warn('Server AI fallback:', e);
    }

    const directRes = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai',
        messages: [
          { role: 'system', content: sysText },
          { role: 'user', content: promptText }
        ]
      })
    });
    const directData = await directRes.json();
    return directData.choices?.[0]?.message?.content || '';
  };

  const handleSeek = (timeStr) => {
    const sec = parseTimeToSec(timeStr);
    setSeekSeconds(sec);
  };

  const handleFetch = async () => {
    const extractedId = extractVideoId(videoUrl);
    if (!extractedId) {
      alert('Please paste a valid YouTube link first.');
      return;
    }

    window.speechSynthesis?.cancel();
    setVideoId(extractedId);
    setSeekSeconds(0);
    setIsFetching(true);
    setStudyData(null);
    setParagraphs([]);
    setSubtitles([]);
    setChatMessages([]);

    let localTitle = '';
    let localAuthor = 'YouTube Creator';
    let localDesc = '';
    let localParagraphs = [];
    let localSubtitles = [];

    try {
      try {
        const clientOembed = await fetch('https://noembed.com/embed?url=https://www.youtube.com/watch?v=' + extractedId);
        if (clientOembed.ok) {
          const oe = await clientOembed.json();
          if (oe.title) localTitle = oe.title;
          if (oe.author_name) localAuthor = oe.author_name;
        }
      } catch (e) {
        console.warn('Client oembed warning:', e);
      }

      try {
        const res = await fetch('/api/transcript', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoUrl })
        });
        if (res.ok) {
          const meta = await res.json();
          if (!localTitle && meta.videoTitle) localTitle = meta.videoTitle;
          if (meta.authorName) localAuthor = meta.authorName;
          if (meta.description) localDesc = meta.description;

          if (Array.isArray(meta.paragraphs) && meta.paragraphs.length > 0) {
            localParagraphs = meta.paragraphs.map(p => ({
              time: formatSec(p.start),
              text: p.text
            }));
            setParagraphs(localParagraphs);
          }

          if (Array.isArray(meta.subtitles) && meta.subtitles.length > 0) {
            localSubtitles = meta.subtitles.map(s => ({
              time: formatSec(s.start),
              text: s.text
            }));
            setSubtitles(localSubtitles);
          }
        }
      } catch (e) {
        console.warn('Transcript API warning:', e);
      }

      if (!localTitle) localTitle = 'YouTube Video Lecture';
      setVideoTitle(localTitle);

      const transcriptSample = localParagraphs.length > 0
        ? localParagraphs.map(p => '[' + p.time + '] ' + p.text).join('\n').slice(0, 8000)
        : ('Video Title: "' + localTitle + '" by ' + localAuthor + '.\nDescription: ' + localDesc);

      const prompt = 'Analyze the YouTube video "' + localTitle + '" by "' + localAuthor + '".\n' +
        'Transcript / Video Content:\n' + transcriptSample + '\n\n' +
        'Produce an exhaustive, NoteGPT-grade study breakdown using the EXACT section headers below. Do not wrap in code blocks.\n\n' +
        '===HEADLINE===\n' +
        'Write a compelling academic headline summarizing the core theme of ' + localTitle + '\n\n' +
        '===SUMMARY===\n' +
        'Write 3 rich, detailed paragraphs explaining the video from start to finish. Include specific examples, concrete numbers, mathematical or structural details, and how the concepts connect.\n\n' +
        '===HIGHLIGHTS===\n' +
        '00:04 | Specific Concept Title | 2-sentence deep explanation of what happens in this segment.\n' +
        '02:15 | Specific Concept Title | 2-sentence deep explanation of the mechanism and examples.\n' +
        '05:40 | Specific Concept Title | 2-sentence deep explanation of the architecture or math.\n' +
        '09:30 | Specific Concept Title | 2-sentence deep explanation of the conclusion and implications.\n\n' +
        '===TAKEAWAYS===\n' +
        '- Core Principle: Detailed explanation of takeaway 1.\n' +
        '- Technical Mechanism: Detailed explanation of takeaway 2.\n' +
        '- Quantitative Insight: Detailed explanation of takeaway 3.\n' +
        '- Practical Application: Detailed explanation of takeaway 4.\n\n' +
        '===CHAPTERS===\n' +
        '00:00 | Introduction & Core Problem\n' +
        '02:15 | Foundational Structure & Components\n' +
        '05:40 | Deep Dive into the Mechanism\n' +
        '09:30 | Mathematical Intuition & Examples\n' +
        '13:45 | Summary & Final Conclusions\n\n' +
        '===MINDMAP===\n' +
        'Core Architecture | Sub-point 1 | Sub-point 2 | Sub-point 3\n' +
        'Key Mechanisms | Sub-point 1 | Sub-point 2 | Sub-point 3\n' +
        'Mathematical Model | Sub-point 1 | Sub-point 2 | Sub-point 3\n' +
        'Real-World Impact | Sub-point 1 | Sub-point 2 | Sub-point 3\n\n' +
        '===INFOGRAPHIC===\n' +
        'metric_or_number | Badge | Card Title | 2-sentence explanation of this metric or core concept.\n' +
        'metric_or_number | Badge | Card Title | 2-sentence explanation of this mechanism.\n' +
        'metric_or_number | Badge | Card Title | 2-sentence explanation of this outcome.\n' +
        'metric_or_number | Badge | Card Title | 2-sentence explanation of this takeaway.\n\n' +
        '===SLIDES===\n' +
        'Slide 1 Title | Bullet 1 ; Bullet 2 ; Bullet 3 | Detailed speaker notes for slide 1\n' +
        'Slide 2 Title | Bullet 1 ; Bullet 2 ; Bullet 3 | Detailed speaker notes for slide 2\n' +
        'Slide 3 Title | Bullet 1 ; Bullet 2 ; Bullet 3 | Detailed speaker notes for slide 3\n' +
        'Slide 4 Title | Bullet 1 ; Bullet 2 ; Bullet 3 | Detailed speaker notes for slide 4\n\n' +
        '===AUDIO===\n' +
        'Host Alex | Engaging opening welcoming listeners to the deep-dive on ' + localTitle + '.\n' +
        'Dr. Jordan | Detailed explanation of the first major example and technical concept in the video.\n' +
        'Host Alex | Follow-up question exploring how the internal components or math actually work.\n' +
        'Dr. Jordan | Clear breakdown of the parameters, architecture, and key takeaway.\n\n' +
        '===QUIZ===\n' +
        'Specific question 1 testing a concept from ' + localTitle + '? | Option A | Option B | Option C | Option D | 1 | Explanation of why the answer is correct.\n' +
        'Specific question 2 testing a mechanism from ' + localTitle + '? | Option A | Option B | Option C | Option D | 2 | Explanation of why the answer is correct.\n' +
        'Specific question 3 testing an example from ' + localTitle + '? | Option A | Option B | Option C | Option D | 0 | Explanation of why the answer is correct.\n\n' +
        '===FLASHCARDS===\n' +
        'Specific question 1 on ' + localTitle + ' | Clear, detailed answer 1\n' +
        'Specific question 2 on ' + localTitle + ' | Clear, detailed answer 2\n' +
        'Specific question 3 on ' + localTitle + ' | Clear, detailed answer 3\n' +
        'Specific question 4 on ' + localTitle + ' | Clear, detailed answer 4\n\n' +
        '===TRANSCRIPT===\n' +
        '00:04 | Detailed spoken-style paragraph 1 (4-5 sentences) reconstructing the opening explanation and examples in ' + localTitle + '.\n' +
        '01:12 | Detailed spoken-style paragraph 2 (4-5 sentences) explaining the core definitions and structure.\n' +
        '03:25 | Detailed spoken-style paragraph 3 (4-5 sentences) walking through the intermediate steps and mechanisms.\n' +
        '06:40 | Detailed spoken-style paragraph 4 (4-5 sentences) covering the mathematical intuition and worked examples.\n' +
        '10:15 | Detailed spoken-style paragraph 5 (4-5 sentences) summarizing the conclusions and big picture.';

      const rawAiOutput = await callAiEngine(
        prompt,
        'You are NoteGPT AI engine. Produce exhaustive, accurate, textbook-grade notes strictly following the requested ===SECTION=== markers.',
        extractedId
      );

      const parsedData = parseStructuredNotes(rawAiOutput, localTitle, localAuthor);
      setStudyData(parsedData);

      if (localParagraphs.length === 0 && parsedData.generatedParagraphs.length > 0) {
        setParagraphs(parsedData.generatedParagraphs);
        setSubtitles(parsedData.generatedParagraphs);
      }

      setChatMessages([
        { role: 'assistant', text: 'I have generated the complete study notes for "' + localTitle + '". Ask me anything about specific timestamps, formulas, or concepts!' }
      ]);
    } catch (err) {
      console.error('Error in handleFetch:', err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleNewSession = () => {
    window.speechSynthesis?.cancel();
    setVideoUrl('');
    setVideoId(null);
    setVideoTitle('');
    setParagraphs([]);
    setSubtitles([]);
    setStudyData(null);
    setChatMessages([]);
    setSearchQuery('');
    setActiveTool('summarize');
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTranscript = () => {
    const content = paragraphs.map(p => p.time + '\n' + p.text).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (videoTitle || 'transcript') + '.txt';
    a.click();
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const contextStr = paragraphs.map(p => '[' + p.time + '] ' + p.text).join(' ').slice(0, 5000);
      const chatPrompt = 'Video: ' + videoTitle + '\nSummary: ' + (studyData?.summaryParagraphs?.join(' ') || '') + '\nTranscript: ' + contextStr + '\n\nUser Question: ' + userMsg;
      const reply = await callAiEngine(
        chatPrompt,
        'You are a knowledgeable AI tutor inside FreeNoteGPT. Answer questions clearly using concrete details from the video.',
        videoId
      );
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        text: reply || 'Could not generate a response.'
      }]);
    } catch {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Error communicating with AI service.'
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getToolBtnClass = (toolName) => {
    return activeTool === toolName
      ? 'flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all bg-slate-800/90 border-cyan-500/60 text-white shadow-sm'
      : 'flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800/50';
  };

  const activeList = leftSubTab === 'subtitles' ? subtitles : paragraphs;

  return (
    <div className="flex h-screen w-screen bg-[#0b0f19] text-slate-100 overflow-hidden select-none">
      
      {/* FAR-LEFT ICON SIDEBAR RAIL (Matches Real NoteGPT) */}
      <aside className="w-14 border-r border-slate-800/80 bg-[#070a12] flex flex-col items-center py-4 justify-between z-30 flex-shrink-0">
        <div className="flex flex-col items-center gap-5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg cursor-pointer" onClick={handleNewSession}>
            F
          </div>
          <button onClick={() => setActiveTool('summarize')} title="AI Summary" className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-900 transition-colors">
            <BookOpen className="w-4 h-4" />
          </button>
          <button onClick={() => setActiveTool('mindmap')} title="Mind Map" className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-900 transition-colors">
            <Network className="w-4 h-4" />
          </button>
          <button onClick={() => setActiveTool('flashcards')} title="Flashcards" className="p-2 rounded-xl text-slate-400 hover:text-yellow-400 hover:bg-slate-900 transition-colors">
            <Layers className="w-4 h-4" />
          </button>
          <button onClick={() => setRightTab('chat')} title="AI Copilot" className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-900 transition-colors">
            <Compass className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button onClick={() => setShowUpgradeModal(true)} className="p-2 rounded-xl text-slate-500 hover:text-slate-300">
            <Settings className="w-4 h-4" />
          </button>
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
            R
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP HEADER BAR (Matches Real NoteGPT) */}
        <header className="h-14 border-b border-slate-800/80 bg-[#0b0f19] px-4 flex items-center justify-between gap-4 z-20">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={handleNewSession}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 flex-shrink-0"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            {videoTitle ? (
              <h1 className="font-semibold text-sm text-slate-100 truncate max-w-md" title={videoTitle}>
                {videoTitle}
              </h1>
            ) : (
              <span className="font-bold text-sm text-slate-200">FreeNoteGPT Workspace</span>
            )}

            {/* URL Input Bar always accessible */}
            <div className="flex items-center gap-1.5 flex-1 max-w-md ml-2">
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                placeholder="Paste YouTube link here..."
                className="w-full bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <button
                onClick={handleFetch}
                disabled={isFetching}
                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 flex-shrink-0"
              >
                {isFetching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{isFetching ? 'Analyzing' : 'Fetch'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setShowShareModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200">
              <Share2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Share</span>
            </button>
            <button onClick={() => setShowUpgradeModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/50 hover:bg-blue-900/50 border border-blue-800/60 text-xs text-blue-300 font-medium">
              <Rocket className="w-3.5 h-3.5 text-rose-400" />
              <span>Upgrade</span>
            </button>
            <button onClick={handleNewSession} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-950 font-semibold text-xs shadow-sm">
              <Plus className="w-4 h-4 text-slate-950" />
              <span>New</span>
            </button>
          </div>
        </header>

        {/* SPLIT WORKSPACE */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT PANE: Video Player + Transcript/Subtitles/Chapter (42% width like NoteGPT) */}
          <div className="w-[44%] border-r border-slate-800/80 flex flex-col bg-[#0b0f19] p-4 gap-3 overflow-hidden">
            
            {/* Video Player Card */}
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-800/80 shadow-lg flex-shrink-0 flex items-center justify-center">
              {videoId ? (
                <iframe
                  key={videoId + '-' + seekSeconds}
                  src={'https://www.youtube.com/embed/' + videoId + '?rel=0' + (seekSeconds > 0 ? '&start=' + seekSeconds + '&autoplay=1' : '')}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="YouTube Video Player"
                />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <Video className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-medium text-slate-300">Paste a YouTube URL Above</p>
                  <p className="text-[11px] text-slate-500 max-w-xs">Click Fetch to load the video player, synchronized transcript, and full AI study notes.</p>
                </div>
              )}
            </div>

            {/* Transcript / Subtitles / Chapter Bar (Matches Screenshot 3307) */}
            <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/80 rounded-xl p-1.5 flex-shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setLeftSubTab('transcript')}
                  className={leftSubTab === 'transcript' ? 'px-3 py-1.5 rounded-lg bg-slate-800 text-blue-400 text-xs font-semibold flex items-center gap-1.5' : 'px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center gap-1.5'}
                >
                  <span className="text-[10px] border border-current rounded px-1">CC</span>
                  <span>Transcript</span>
                </button>
                <button
                  onClick={() => setLeftSubTab('subtitles')}
                  className={leftSubTab === 'subtitles' ? 'px-3 py-1.5 rounded-lg bg-slate-800 text-blue-400 text-xs font-semibold flex items-center gap-1.5' : 'px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center gap-1.5'}
                >
                  <span className="text-[10px] border border-current rounded px-1">CC</span>
                  <span>Subtitles</span>
                </button>
                <button
                  onClick={() => setLeftSubTab('chapter')}
                  className={leftSubTab === 'chapter' ? 'px-3 py-1.5 rounded-lg bg-slate-800 text-blue-400 text-xs font-semibold flex items-center gap-1.5' : 'px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center gap-1.5'}
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>Chapter</span>
                </button>
              </div>

              <div className="flex items-center gap-1 pr-1">
                <button onClick={() => handleCopy(paragraphs.map(p => p.time + '\n' + p.text).join('\n\n'))} title="Copy Transcript" className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button onClick={handleDownloadTranscript} title="Download Transcript" className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800">
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setShowSearchBox(!showSearchBox)} title="Search Transcript" className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800">
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {showSearchBox && (
              <input
                type="text"
                placeholder="Filter transcript keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 flex-shrink-0"
              />
            )}

            {/* Paragraph-Grouped Transcript Body (Matches Screenshot 3307) */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-5">
              {isFetching ? (
                <div className="flex items-center justify-center h-40 text-xs text-slate-400 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Extracting verbatim transcript & chapters...</span>
                </div>
              ) : leftSubTab === 'chapter' ? (
                (studyData?.chapters?.length > 0 ? studyData.chapters : []).map((ch, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSeek(ch.time)}
                    className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-blue-500/40 cursor-pointer flex items-center gap-3 transition-colors"
                  >
                    <span className="text-xs font-mono text-blue-400 font-semibold">{ch.time}</span>
                    <span className="text-xs text-slate-200 font-medium">{ch.title}</span>
                  </div>
                ))
              ) : activeList.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-xs text-slate-500">
                  Transcript paragraphs will appear here once you fetch a video.
                </div>
              ) : (
                activeList
                  .filter(item => item.text.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((seg, idx) => (
                    <div key={idx} className="space-y-1.5 group">
                      <button
                        onClick={() => handleSeek(seg.time)}
                        className="text-xs font-mono font-semibold text-blue-400 hover:text-blue-300 block"
                      >
                        {seg.time}
                      </button>
                      <p className="text-[13px] text-slate-200/90 leading-relaxed select-text">
                        {seg.text}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* RIGHT PANE: AI Notes & AI Chat (56% width like NoteGPT) */}
          <div className="flex-1 flex flex-col bg-[#0b0f19] p-4 gap-3 overflow-hidden">
            
            {/* Compact Pill Switcher: AI Notes | AI Chat */}
            <div className="flex items-center justify-between flex-shrink-0">
              <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800">
                <button
                  onClick={() => setRightTab('notes')}
                  className={rightTab === 'notes' ? 'flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 text-blue-400 text-xs font-semibold' : 'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-medium'}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>AI Notes</span>
                </button>
                <button
                  onClick={() => setRightTab('chat')}
                  className={rightTab === 'chat' ? 'flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 text-blue-400 text-xs font-semibold' : 'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-medium'}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>AI Chat</span>
                </button>
              </div>
            </div>

            {rightTab === 'notes' ? (
              <div className="flex-1 flex flex-col overflow-hidden gap-3">
                
                {/* 4x2 Tool Grid (Matches Screenshot 3307 Layout) */}
                <div className="grid grid-cols-4 gap-2 flex-shrink-0">
                  <button onClick={() => setActiveTool('summarize')} className={getToolBtnClass('summarize')}>
                    <div className="flex items-center gap-2"><ListFilter className="w-4 h-4 text-cyan-400" /><span>Summarize</span></div>
                    <span className="text-slate-500 text-xs">⋮</span>
                  </button>
                  <button onClick={() => setActiveTool('mindmap')} className={getToolBtnClass('mindmap')}>
                    <div className="flex items-center gap-2"><Network className="w-4 h-4 text-amber-400" /><span>Mind Map</span></div>
                    <span className="text-slate-500 text-xs">⋮</span>
                  </button>
                  <button onClick={() => setActiveTool('infographic')} className={getToolBtnClass('infographic')}>
                    <div className="flex items-center gap-2"><LayoutGrid className="w-4 h-4 text-emerald-400" /><span>Infographic</span></div>
                  </button>
                  <button onClick={() => setActiveTool('slides')} className={getToolBtnClass('slides')}>
                    <div className="flex items-center gap-2"><Presentation className="w-4 h-4 text-orange-400" /><span>Slides</span></div>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  </button>

                  <button onClick={() => setActiveTool('audio')} className={getToolBtnClass('audio')}>
                    <div className="flex items-center gap-2"><Mic className="w-4 h-4 text-orange-400" /><span>Audio Overview</span></div>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  </button>
                  <button onClick={() => setActiveTool('quiz')} className={getToolBtnClass('quiz')}>
                    <div className="flex items-center gap-2"><HelpCircle className="w-4 h-4 text-yellow-400" /><span>Quiz</span></div>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  </button>
                  <button onClick={() => setActiveTool('flashcards')} className={getToolBtnClass('flashcards')}>
                    <div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-yellow-400" /><span>Flashcards</span></div>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  </button>
                  <button onClick={() => setActiveTool('agent')} className={getToolBtnClass('agent')}>
                    <div className="flex items-center gap-2"><Cpu className="w-4 h-4 text-cyan-400" /><span>AI Agent</span></div>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>
                </div>

                {/* Rich Article Output Card */}
                <div className="flex-1 bg-[#111726] border border-slate-800/90 rounded-2xl overflow-y-auto p-6 select-text">
                  {isFetching ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-3 text-slate-400">
                      <Loader2 className="w-7 h-7 animate-spin text-cyan-400" />
                      <p className="text-sm font-medium text-slate-200">Synthesizing in-depth study article, mind map & quizzes...</p>
                      <p className="text-xs text-slate-500">Reading video transcript and extracting technical concepts</p>
                    </div>
                  ) : !studyData ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                      <Cpu className="w-10 h-10 text-slate-700 mb-1" />
                      <p className="text-sm font-semibold text-slate-300">Ready to Generate Deep Study Notes</p>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Paste any YouTube video URL in the top bar and click Fetch to generate NoteGPT-style multi-paragraph summaries, timestamped insights, mind maps, slides, quizzes, and flashcards.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* 1. DEEP ARTICLE SUMMARIZE VIEW (Matches Screenshot 3307) */}
                      {activeTool === 'summarize' && (
                        <div className="space-y-6 max-w-3xl">
                          <h1 className="text-xl font-bold text-white leading-snug">
                            {studyData.headline}
                          </h1>

                          <div className="space-y-3">
                            <h2 className="text-base font-bold text-white">Summary</h2>
                            {studyData.summaryParagraphs.map((para, i) => (
                              <p key={i} className="text-sm text-slate-300 leading-7">
                                {para}
                              </p>
                            ))}
                          </div>

                          {studyData.highlights.length > 0 && (
                            <div className="space-y-3 pt-2">
                              <h2 className="text-base font-bold text-white">Timestamped Section Breakdown</h2>
                              <div className="space-y-3">
                                {studyData.highlights.map((h, i) => (
                                  <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleSeek(h.time)}
                                        className="text-xs font-mono font-bold text-blue-400 hover:underline"
                                      >
                                        {h.time}
                                      </button>
                                      <span className="text-sm font-semibold text-slate-100">{h.title}</span>
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed">{h.detail}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {studyData.takeaways.length > 0 && (
                            <div className="space-y-3 pt-2">
                              <h2 className="text-base font-bold text-white">Key Takeaways</h2>
                              <ul className="space-y-2.5">
                                {studyData.takeaways.map((pt, i) => (
                                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300 leading-relaxed">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2.5 flex-shrink-0" />
                                    <span>{pt}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTool === 'mindmap' && <MindMapPanel title={studyData.title} branches={studyData.mindmapBranches} />}
                      {activeTool === 'infographic' && <InfographicPanel items={studyData.infographic} title={studyData.title} />}
                      {activeTool === 'slides' && <SlidesPanel slides={studyData.slides} />}
                      {activeTool === 'audio' && <AudioPanel script={studyData.audioScript} />}
                      {activeTool === 'quiz' && <QuizPanel questions={studyData.quiz} />}
                      {activeTool === 'flashcards' && <FlashcardsPanel cards={studyData.flashcards} />}
                      {activeTool === 'agent' && <AgentPanel studyData={studyData} />}
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* AI CHAT TAB */
              <div className="flex-1 bg-[#111726] border border-slate-800/90 rounded-2xl flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-xs text-slate-500">
                      Fetch a video or ask any question below to chat with your AI study tutor.
                    </div>
                  ) : (
                    chatMessages.map((m, idx) => (
                      <div key={idx} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                        <div className={m.role === 'user' ? 'max-w-[85%] rounded-2xl px-4 py-2.5 text-xs bg-cyan-600 text-white rounded-tr-none leading-relaxed' : 'max-w-[85%] rounded-2xl px-4 py-2.5 text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none leading-relaxed'}>
                          {m.text}
                        </div>
                      </div>
                    ))
                  )}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-2 text-xs text-slate-400 flex items-center gap-2">
                        <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/60 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={videoTitle ? ('Ask anything about ' + videoTitle.slice(0, 35) + '...') : 'Ask a question...'}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <button type="submit" disabled={isChatLoading || !chatInput.trim()} className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl disabled:opacity-40">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100">Share Study Notes</h3>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex gap-2">
              <input readOnly value={window.location.href} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono" />
              <button onClick={() => handleCopy(window.location.href)} className="px-3 py-1.5 bg-cyan-600 text-white rounded-lg text-xs font-semibold">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100">FreeNoteGPT Pro</h3>
              <button onClick={() => setShowUpgradeModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-300">All 8 NoteGPT study engines—including verbatim transcripts, deep multi-paragraph summaries, mind maps, slides, and quizzes—are unlocked for free.</p>
            <button onClick={() => setShowUpgradeModal(false)} className="w-full py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">Got It</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SUB-COMPONENTS ──

function MindMapPanel({ title, branches = [] }) {
  const [zoom, setZoom] = useState(1);
  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <span className="text-sm font-bold text-white">Hierarchical Concept Mind Map</span>
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
          <button onClick={() => setZoom(z => Math.max(0.7, z - 0.1))} className="px-2 py-0.5 hover:bg-slate-800 rounded">-</button>
          <span className="px-2 text-[11px] text-slate-400">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(1.4, z + 0.1))} className="px-2 py-0.5 hover:bg-slate-800 rounded">+</button>
        </div>
      </div>

      <div className="flex-1 bg-slate-950/60 border border-slate-800/80 rounded-xl p-6 overflow-auto flex items-center justify-start min-h-[320px]">
        <div style={{ transform: 'scale(' + zoom + ')', transformOrigin: 'left center' }} className="flex items-center gap-8 transition-transform">
          <div className="bg-cyan-950 border-2 border-cyan-500/80 text-cyan-100 px-4 py-3 rounded-xl text-xs font-bold shadow-lg max-w-[180px] text-center">
            {title}
          </div>

          <div className="space-y-4">
            {branches.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-6 h-0.5 bg-slate-700" />
                <div className="bg-slate-900 border border-amber-500/50 text-amber-200 px-3.5 py-2 rounded-lg text-xs font-semibold min-w-[140px]">
                  {item.branch}
                </div>
                {item.children && item.children.length > 0 && (
                  <div className="space-y-1.5 pl-3 border-l border-slate-700">
                    {item.children.map((ch, cIdx) => (
                      <div key={cIdx} className="bg-slate-900/90 border border-slate-800 text-slate-300 px-3 py-1 rounded text-[11px]">
                        {ch}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfographicPanel({ items = [], title }) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">Visual Knowledge Infographic: {title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((c, i) => (
          <div key={i} className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                {c.badge}
              </span>
              <span className="text-base font-extrabold text-emerald-400">{c.metric}</span>
            </div>
            <h4 className="text-sm font-bold text-white">{c.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{c.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlidesPanel({ slides = [] }) {
  const [slide, setSlide] = useState(0);
  const activeSlide = slides[slide] || { title: 'Presentation Slide', bullets: [], notes: '' };
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <h2 className="text-base font-bold text-white">Lecture Slide Deck</h2>
        <span className="text-xs text-slate-400 font-mono">Slide {slide + 1} of {slides.length || 1}</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[240px] flex flex-col justify-between shadow-lg">
        <div>
          <h3 className="text-base font-bold text-white mb-4">{activeSlide.title}</h3>
          <ul className="space-y-2.5">
            {(activeSlide.bullets || []).map((b, i) => (
              <li key={i} className="text-sm text-slate-200 flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        {activeSlide.notes && (
          <div className="mt-6 pt-3 border-t border-slate-800 text-xs text-slate-400 italic">
            Speaker Notes: {activeSlide.notes}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-xs">
        <button onClick={() => setSlide(s => Math.max(0, s - 1))} disabled={slide === 0} className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl disabled:opacity-30">Previous Slide</button>
        <button onClick={() => setSlide(s => Math.min(slides.length - 1, s + 1))} disabled={slide >= slides.length - 1} className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl disabled:opacity-30">Next Slide</button>
      </div>
    </div>
  );
}

function AudioPanel({ script = [] }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return alert('Speech synthesis not supported.');
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    let idx = 0;
    const speakNext = () => {
      if (idx >= script.length) {
        setIsPlaying(false);
        setCurrentLine(0);
        return;
      }
      setCurrentLine(idx);
      const u = new SpeechSynthesisUtterance(script[idx].text);
      u.pitch = idx % 2 === 0 ? 1.0 : 1.2;
      u.onend = () => { idx++; speakNext(); };
      window.speechSynthesis.speak(u);
    };
    speakNext();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <span className="text-base font-bold text-white">AI Podcast Deep-Dive Overview</span>
        <button onClick={toggleSpeech} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold rounded-xl text-xs">
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isPlaying ? 'Pause Podcast' : 'Play Audio Overview'}</span>
        </button>
      </div>
      <div className="space-y-3">
        {script.map((line, idx) => (
          <div key={idx} className={isPlaying && currentLine === idx ? 'p-4 rounded-xl border text-sm bg-orange-500/10 border-orange-500/40 text-orange-100' : 'p-4 rounded-xl border text-sm bg-slate-900 border-slate-800 text-slate-300'}>
            <div className="font-bold text-xs text-orange-400 mb-1">{line.speaker}</div>
            <p className="leading-relaxed">{line.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizPanel({ questions = [] }) {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const quiz = questions[qIdx] || { prompt: 'No question available', options: [], answer: 0, explanation: '' };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-1 rounded-lg">
            Question {qIdx + 1} of {questions.length || 1}
          </span>
          {questions.length > 1 && (
            <button onClick={() => { setQIdx((qIdx + 1) % questions.length); setSelected(null); setSubmitted(false); }} className="text-xs text-cyan-400 hover:underline font-semibold">
              Next Question →
            </button>
          )}
        </div>
        <p className="text-sm font-bold text-white leading-relaxed">{quiz.prompt}</p>
        <div className="space-y-2.5 pt-1">
          {(quiz.options || []).map((opt, i) => (
            <button
              key={i}
              onClick={() => !submitted && setSelected(i)}
              className={
                submitted && i === quiz.answer
                  ? 'w-full text-left p-3.5 rounded-xl border text-xs bg-emerald-950/80 border-emerald-500 text-emerald-200 font-medium'
                  : selected === i
                  ? 'w-full text-left p-3.5 rounded-xl border text-xs bg-cyan-950/60 border-cyan-500 text-white font-medium'
                  : 'w-full text-left p-3.5 rounded-xl border text-xs bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800'
              }
            >
              <span className="font-mono text-[11px] opacity-60 mr-2">[{String.fromCharCode(65 + i)}]</span>
              <span>{opt}</span>
            </button>
          ))}
        </div>
        <button onClick={() => setSubmitted(true)} disabled={selected === null} className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs rounded-xl disabled:opacity-40">
          Verify Answer
        </button>
        {submitted && quiz.explanation && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-emerald-400 block mb-1">Explanation:</strong>
            {quiz.explanation}
          </div>
        )}
      </div>
    </div>
  );
}

function FlashcardsPanel({ cards = [] }) {
  const [flipped, setFlipped] = useState(false);
  const [index, setIndex] = useState(0);
  const activeCard = cards[index] || { q: 'No flashcards', a: '' };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-xs text-slate-400">
        <span className="font-bold text-sm text-white">Active Recall Flashcards</span>
        <span>Card {index + 1} of {cards.length || 1}</span>
      </div>
      <div onClick={() => setFlipped(!flipped)} className="h-52 bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer shadow-lg transition-all">
        <span className="text-[10px] uppercase font-bold text-cyan-400 mb-3 tracking-wider">
          {flipped ? 'Answer' : 'Question (Click Card to Flip)'}
        </span>
        <p className="text-sm font-medium text-slate-100 max-w-md leading-relaxed">
          {flipped ? activeCard.a : activeCard.q}
        </p>
      </div>
      <div className="flex gap-3">
        <button onClick={() => { setFlipped(false); setIndex((index - 1 + cards.length) % cards.length); }} className="flex-1 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold">← Previous Card</button>
        <button onClick={() => { setFlipped(false); setIndex((index + 1) % cards.length); }} className="flex-1 py-2.5 bg-cyan-600 text-white rounded-xl text-xs font-semibold">Next Card →</button>
      </div>
    </div>
  );
}

function AgentPanel({ studyData }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <span className="text-base font-bold text-white">Autonomous Study Agent Report</span>
        <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono">Complete</span>
      </div>
      <div className="space-y-2.5">
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 flex items-center gap-3">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Extracted video stream & caption segments for <strong>{studyData.title}</strong></span>
        </div>
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 flex items-center gap-3">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Synthesized {studyData.highlights.length} timestamped highlights and {studyData.takeaways.length} core takeaways</span>
        </div>
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 flex items-center gap-3">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Compiled {studyData.quiz.length} self-assessment quiz questions and {studyData.flashcards.length} active recall flashcards</span>
        </div>
      </div>
    </div>
  );
}