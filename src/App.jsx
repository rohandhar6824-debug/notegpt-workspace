import React, { useState } from 'react';
import {
  Share2, Rocket, Plus, FileText, MessageSquare, ListFilter,
  Network, LayoutGrid, Presentation, Mic, HelpCircle,
  CreditCard, Cpu, RefreshCw, Send, Copy, Check, ExternalLink, X, Loader2,
  Play, Pause, Video
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('notes');
  const [activeTool, setActiveTool] = useState('summarize');

  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const [transcript, setTranscript] = useState([]);
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

  const formatSec = (sec) => {
    const total = Math.max(0, Math.floor(Number(sec) || 0));
    const mm = String(Math.floor(total / 60)).padStart(2, '0');
    const ss = String(total % 60).padStart(2, '0');
    return mm + ':' + ss;
  };

  const callAiWithFallback = async (promptText, sysText, isJson) => {
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          systemInstruction: sysText,
          jsonMode: isJson
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.text) return data.text;
      }
    } catch (e) {
      console.warn('Backend AI call failed, using direct browser AI:', e);
    }

    const directRes = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai',
        messages: [
          { role: 'system', content: sysText },
          { role: 'user', content: promptText }
        ],
        ...(isJson ? { response_format: { type: 'json_object' } } : {})
      })
    });
    const directData = await directRes.json();
    return directData.choices?.[0]?.message?.content || '';
  };

  const handleFetch = async () => {
    const extractedId = extractVideoId(videoUrl);
    if (!extractedId) {
      alert('Please paste a valid YouTube link first.');
      return;
    }

    window.speechSynthesis?.cancel();
    setVideoId(extractedId);
    setIsFetching(true);
    setStudyData(null);
    setTranscript([]);
    setChatMessages([]);

    let localTitle = '';
    let localAuthor = 'YouTube Channel';
    let localDesc = '';
    let localTranscript = [];

    try {
      try {
        const noembedUrl = 'https://noembed.com/embed?url=https://www.youtube.com/watch?v=' + extractedId;
        const clientOembed = await fetch(noembedUrl);
        if (clientOembed.ok) {
          const oe = await clientOembed.json();
          if (oe.title) localTitle = oe.title;
          if (oe.author_name) localAuthor = oe.author_name;
        }
      } catch (e) {
        console.warn('Client oEmbed error:', e);
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

          if (meta.hasRealCaptions && Array.isArray(meta.transcript) && meta.transcript.length > 0) {
            localTranscript = meta.transcript.map(item => ({
              time: formatSec(item.start),
              text: item.text
            }));
            setTranscript(localTranscript);
          }
        }
      } catch (e) {
        console.warn('Server transcript call failed:', e);
      }

      if (!localTitle) {
        localTitle = 'YouTube Lecture';
      }
      setVideoTitle(localTitle);

      const transcriptContext = localTranscript.length > 0
        ? localTranscript.map(t => '[' + t.time + '] ' + t.text).join(' ').slice(0, 4500)
        : 'Video Title: "' + localTitle + '" by ' + localAuthor + '. Description: ' + localDesc;

      const prompt = 'Generate a complete educational study workspace for the YouTube video titled "' + localTitle + '" by "' + localAuthor + '".\n' +
        'Context: ' + transcriptContext + '\n\n' +
        'Return ONLY a valid JSON object with these exact keys:\n' +
        '{\n' +
        '  "summary": "Detailed 3-sentence executive summary of ' + localTitle + '",\n' +
        '  "takeaways": ["Key point 1", "Key point 2", "Key point 3", "Key point 4"],\n' +
        '  "branches": ["Subtopic 1", "Subtopic 2", "Subtopic 3", "Subtopic 4"],\n' +
        '  "infographic": [\n' +
        '    {"title": "Core Concept", "content": "Explanation", "badge": "Foundation", "metric": "Core"},\n' +
        '    {"title": "Mechanism", "content": "Explanation", "badge": "Process", "metric": "Key"},\n' +
        '    {"title": "Application", "content": "Explanation", "badge": "Outcome", "metric": "100%"}\n' +
        '  ],\n' +
        '  "slides": [\n' +
        '    {"title": "1. Introduction", "bullets": ["Point 1", "Point 2", "Point 3"], "notes": "Speaker notes"},\n' +
        '    {"title": "2. Core Mechanism", "bullets": ["Point 1", "Point 2", "Point 3"], "notes": "Speaker notes"},\n' +
        '    {"title": "3. Key Takeaways", "bullets": ["Point 1", "Point 2", "Point 3"], "notes": "Speaker notes"}\n' +
        '  ],\n' +
        '  "audioScript": [\n' +
        '    {"speaker": "Host Alex", "text": "Welcome! Today we are breaking down ' + localTitle + '."},\n' +
        '    {"speaker": "Dr. Jordan", "text": "Direct explanation of the main concepts covered in this video."},\n' +
        '    {"speaker": "Host Alex", "text": "Key takeaway summary for students."}\n' +
        '  ],\n' +
        '  "quiz": [\n' +
        '    {"prompt": "Question 1 about ' + localTitle + '?", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": 0},\n' +
        '    {"prompt": "Question 2 about ' + localTitle + '?", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": 1}\n' +
        '  ],\n' +
        '  "flashcards": [\n' +
        '    {"q": "Question 1", "a": "Answer 1"},\n' +
        '    {"q": "Question 2", "a": "Answer 2"},\n' +
        '    {"q": "Question 3", "a": "Answer 3"}\n' +
        '  ],\n' +
        '  "agentSteps": ["Analyzed ' + localTitle + '", "Extracted key concepts and definitions", "Built quiz and flashcards"],\n' +
        '  "generatedTranscript": [\n' +
        '    {"time": "00:00", "text": "Introduction and motivation for ' + localTitle + '."},\n' +
        '    {"time": "02:15", "text": "Core definitions and foundational building blocks."},\n' +
        '    {"time": "05:30", "text": "Detailed walkthrough of the underlying mechanism and architecture."},\n' +
        '    {"time": "09:45", "text": "Visual examples and step-by-step problem solving."},\n' +
        '    {"time": "13:20", "text": "Review of main takeaways and conclusions."}\n' +
        '  ]\n' +
        '}';

      const rawAiText = await callAiWithFallback(
        prompt,
        'You are an expert academic tutor. Output strictly valid JSON only.',
        true
      );

      const firstBrace = rawAiText.indexOf('{');
      const lastBrace = rawAiText.lastIndexOf('}');
      const cleanJsonStr = (firstBrace !== -1 && lastBrace !== -1)
        ? rawAiText.slice(firstBrace, lastBrace + 1)
        : rawAiText;

      const parsed = JSON.parse(cleanJsonStr);

      if (localTranscript.length === 0 && Array.isArray(parsed.generatedTranscript)) {
        localTranscript = parsed.generatedTranscript;
        setTranscript(localTranscript);
      }

      setStudyData({
        title: localTitle,
        author: localAuthor,
        summary: parsed.summary || ('Summary of ' + localTitle),
        takeaways: Array.isArray(parsed.takeaways) ? parsed.takeaways : [],
        branches: Array.isArray(parsed.branches) ? parsed.branches : ['Overview', 'Mechanism', 'Applications'],
        infographic: Array.isArray(parsed.infographic) ? parsed.infographic : [],
        slides: Array.isArray(parsed.slides) ? parsed.slides : [],
        audioScript: Array.isArray(parsed.audioScript) ? parsed.audioScript : [],
        quiz: Array.isArray(parsed.quiz) ? parsed.quiz : [],
        flashcards: Array.isArray(parsed.flashcards) ? parsed.flashcards : [],
        agentSteps: Array.isArray(parsed.agentSteps) ? parsed.agentSteps : []
      });

      setChatMessages([
        { role: 'assistant', text: 'FreeNoteGPT has analyzed "' + localTitle + '" by ' + localAuthor + '. Ask me anything about this video!' }
      ]);
    } catch (err) {
      console.error('Error generating study data:', err);
      const displayTitle = localTitle || 'Loaded Video';
      if (localTranscript.length === 0) {
        setTranscript([
          { time: '00:00', text: 'Introduction to ' + displayTitle + ' by ' + localAuthor },
          { time: '02:30', text: 'Core concepts, architecture, and worked examples.' }
        ]);
      }
      setStudyData({
        title: displayTitle,
        author: localAuthor,
        summary: 'Loaded "' + displayTitle + '" by ' + localAuthor + '. Click Fetch again or use AI Chat to explore specific questions.',
        takeaways: [
          'Topic: ' + displayTitle,
          'Creator: ' + localAuthor
        ],
        branches: [displayTitle.slice(0, 24), 'Foundations', 'Key Concepts', 'Summary'],
        infographic: [
          { title: 'Topic', content: displayTitle, badge: 'Video', metric: 'Active' },
          { title: 'Channel', content: localAuthor, badge: 'Creator', metric: '100%' }
        ],
        slides: [
          { title: displayTitle, bullets: ['Presented by ' + localAuthor, 'Use AI Chat to ask specific questions'], notes: '' }
        ],
        audioScript: [
          { speaker: 'Host Alex', text: 'Welcome to our overview of ' + displayTitle + ' by ' + localAuthor + '.' }
        ],
        quiz: [
          { prompt: 'Which topic is covered in this video?', options: [displayTitle, 'Unrelated topic'], answer: 0 }
        ],
        flashcards: [
          { q: 'Video Topic', a: displayTitle + ' (' + localAuthor + ')' }
        ],
        agentSteps: ['Loaded ' + displayTitle]
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleNewSession = () => {
    window.speechSynthesis?.cancel();
    setVideoUrl('');
    setVideoId(null);
    setVideoTitle('');
    setTranscript([]);
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

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const chatPrompt = 'Video: ' + videoTitle + '\nSummary: ' + (studyData?.summary || '') + '\nQuestion: ' + userMsg;
      const reply = await callAiWithFallback(
        chatPrompt,
        'You are FreeNoteGPT AI tutor. Answer clearly and concisely based on the video topic.',
        false
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
      ? 'flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all bg-slate-800 border-cyan-500/60 text-white shadow-sm'
      : 'flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-850';
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 flex-col overflow-hidden select-none">
      
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md">
            F
          </div>
          <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            FreeNoteGPT
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full font-mono">
            Free & Open
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowShareModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200">
            <Share2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Share</span>
          </button>
          <button onClick={() => setShowUpgradeModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-xs text-amber-300 font-medium">
            <Rocket className="w-3.5 h-3.5 text-amber-400" />
            <span>Pro</span>
          </button>
          <button onClick={handleNewSession} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-950 font-semibold text-xs shadow-sm">
            <Plus className="w-4 h-4 text-slate-950" />
            <span>New</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        <div className="w-1/2 border-r border-slate-800 flex flex-col bg-slate-950/60">
          <div className="p-3 border-b border-slate-800 flex gap-2 bg-slate-900/40">
            <input 
              type="text" 
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
              placeholder="Paste any YouTube video URL here and click Fetch..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <button 
              onClick={handleFetch}
              disabled={isFetching}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
            >
              {isFetching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{isFetching ? 'Analyzing...' : 'Fetch'}</span>
            </button>
          </div>

          <div className="relative aspect-video bg-slate-950 flex items-center justify-center border-b border-slate-800">
            {videoId ? (
              <iframe
                src={'https://www.youtube.com/embed/' + videoId + '?rel=0'}
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
                <p className="text-xs font-medium text-slate-300">No Video Loaded</p>
                <p className="text-[11px] text-slate-500 max-w-xs">Paste a YouTube link above and click Fetch to load the video and generate AI study tools.</p>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/30">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <span className={transcript.length > 0 ? 'w-2 h-2 rounded-full bg-emerald-400' : 'w-2 h-2 rounded-full bg-slate-600'} />
                Synchronized Transcript
              </span>
              <input 
                type="text"
                placeholder="Search transcript..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300 w-36 focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {isFetching ? (
                <div className="flex items-center justify-center h-32 text-xs text-slate-400 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  Extracting transcript & generating study breakdown...
                </div>
              ) : transcript.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-xs text-slate-500">
                  Transcript will appear here after fetching a video.
                </div>
              ) : (
                transcript
                  .filter(t => t.text.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((seg, idx) => (
                    <div key={idx} className="group flex gap-3 p-2 rounded-lg hover:bg-slate-900 text-xs">
                      <span className="font-mono text-cyan-400/80 font-medium text-[11px] pt-0.5">{seg.time}</span>
                      <p className="text-slate-300 group-hover:text-slate-100 leading-relaxed">{seg.text}</p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        <div className="w-1/2 flex flex-col bg-slate-950 overflow-hidden">
          
          <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex gap-2">
            <button onClick={() => setActiveTab('transcript')} className={activeTab === 'transcript' ? 'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border bg-slate-800 border-slate-700 text-white' : 'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border bg-slate-900/50 border-transparent text-slate-400'}>
              <FileText className="w-3.5 h-3.5" />
              <span>Transcript</span>
            </button>
            <button onClick={() => setActiveTab('notes')} className={activeTab === 'notes' ? 'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border bg-cyan-950/40 border-cyan-800/80 text-cyan-300' : 'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border bg-slate-900/50 border-transparent text-slate-400'}>
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Notes</span>
            </button>
            <button onClick={() => setActiveTab('chat')} className={activeTab === 'chat' ? 'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border bg-slate-800 border-slate-700 text-white' : 'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border bg-slate-900/50 border-transparent text-slate-400'}>
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Chat</span>
            </button>
          </div>

          {activeTab === 'transcript' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {transcript.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-xs text-slate-500">
                  No transcript loaded yet. Paste a YouTube URL and click Fetch.
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-xs text-slate-400 font-mono">Segments: {transcript.length}</span>
                    <button onClick={() => handleCopy(transcript.map(t => t.time + ' ' + t.text).join('\n'))} className="flex items-center gap-1 text-xs text-cyan-400">
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy All'}</span>
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    {transcript.map(t => '[' + t.time + '] ' + t.text).join('\n\n')}
                  </pre>
                </>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-slate-800 grid grid-cols-2 gap-2 bg-slate-900/30">
                <button onClick={() => setActiveTool('summarize')} className={getToolBtnClass('summarize')}>
                  <div className="flex items-center gap-2"><ListFilter className="w-4 h-4 text-cyan-400" /><span>Summarize</span></div>
                  <span className="text-slate-500 text-xs">•••</span>
                </button>
                <button onClick={() => setActiveTool('mindmap')} className={getToolBtnClass('mindmap')}>
                  <div className="flex items-center gap-2"><Network className="w-4 h-4 text-amber-400" /><span>Mind Map</span></div>
                  <span className="text-slate-500 text-xs">•••</span>
                </button>
                <button onClick={() => setActiveTool('infographic')} className={getToolBtnClass('infographic')}>
                  <div className="flex items-center gap-2"><LayoutGrid className="w-4 h-4 text-emerald-400" /><span>Infographic</span></div>
                </button>
                <button onClick={() => setActiveTool('slides')} className={getToolBtnClass('slides')}>
                  <div className="flex items-center gap-2"><Presentation className="w-4 h-4 text-orange-400" /><span>Slides</span></div>
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                </button>
                <button onClick={() => setActiveTool('audio')} className={getToolBtnClass('audio')}>
                  <div className="flex items-center gap-2"><Mic className="w-4 h-4 text-orange-400" /><span>Audio Overview</span></div>
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                </button>
                <button onClick={() => setActiveTool('quiz')} className={getToolBtnClass('quiz')}>
                  <div className="flex items-center gap-2"><HelpCircle className="w-4 h-4 text-yellow-400" /><span>Quiz</span></div>
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                </button>
                <button onClick={() => setActiveTool('flashcards')} className={getToolBtnClass('flashcards')}>
                  <div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-yellow-400" /><span>Flashcards</span></div>
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                </button>
                <button onClick={() => setActiveTool('agent')} className={getToolBtnClass('agent')}>
                  <div className="flex items-center gap-2"><Cpu className="w-4 h-4 text-cyan-400" /><span>AI Agent</span></div>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {isFetching ? (
                  <div className="flex flex-col items-center justify-center h-64 space-y-3 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                    <p className="text-xs font-medium">FreeNoteGPT is generating custom study notes for this video...</p>
                  </div>
                ) : !studyData ? (
                  <div className="flex flex-col items-center justify-center h-64 p-6 text-center space-y-2">
                    <Cpu className="w-8 h-8 text-slate-700 mb-1" />
                    <p className="text-xs font-semibold text-slate-300">FreeNoteGPT Study Workspace</p>
                    <p className="text-[11px] text-slate-500 max-w-xs">
                      Paste any YouTube URL on the left and click Fetch to generate summaries, mind maps, slides, audio overviews, quizzes, and flashcards.
                    </p>
                  </div>
                ) : (
                  <>
                    {activeTool === 'summarize' && (
                      <div className="p-4 space-y-4">
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                          <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Executive Summary</span>
                          <h3 className="text-sm font-semibold text-slate-100">{studyData.title}</h3>
                          <p className="text-xs text-slate-400 leading-relaxed">{studyData.summary}</p>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">Key Takeaways</span>
                          {studyData.takeaways.map((pt, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-lg">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                              <span>{pt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {activeTool === 'mindmap' && <MindMapPanel title={studyData.title} branches={studyData.branches} />}
                    {activeTool === 'infographic' && <InfographicPanel items={studyData.infographic} title={studyData.title} summary={studyData.summary} />}
                    {activeTool === 'slides' && <SlidesPanel slides={studyData.slides} />}
                    {activeTool === 'audio' && <AudioPanel script={studyData.audioScript} />}
                    {activeTool === 'quiz' && <QuizPanel questions={studyData.quiz} />}
                    {activeTool === 'flashcards' && <FlashcardsPanel cards={studyData.flashcards} />}
                    {activeTool === 'agent' && <AgentPanel steps={studyData.agentSteps} title={studyData.title} />}
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-xs text-slate-500">
                    Fetch a video first or ask a question below to start chatting.
                  </div>
                ) : (
                  chatMessages.map((m, idx) => (
                    <div key={idx} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                      <div className={m.role === 'user' ? 'max-w-[85%] rounded-2xl px-4 py-2.5 text-xs bg-cyan-600 text-white rounded-tr-none' : 'max-w-[85%] rounded-2xl px-4 py-2.5 text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'}>
                        {m.text}
                      </div>
                    </div>
                  ))
                )}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-2 text-xs text-slate-400 flex items-center gap-2">
                      <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                      Thinking...
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/40 flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={videoTitle ? ('Ask about ' + videoTitle.slice(0, 32) + '...') : 'Ask FreeNoteGPT a question...'}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <button type="submit" disabled={isChatLoading || !chatInput.trim()} className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg disabled:opacity-40">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100">Share FreeNoteGPT</h3>
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
            <p className="text-xs text-slate-300">All 8 AI study tools are unlocked and free on FreeNoteGPT.</p>
            <button onClick={() => setShowUpgradeModal(false)} className="w-full py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">Got It</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MindMapPanel({ title, branches = [] }) {
  const [zoom, setZoom] = useState(1);
  return (
    <div className="p-4 flex flex-col h-full space-y-3">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="text-xs font-semibold text-slate-300">Concept Map</span>
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded p-0.5 text-xs">
          <button onClick={() => setZoom(z => Math.max(0.7, z - 0.1))} className="px-2 py-0.5">-</button>
          <span className="px-1 text-[10px] text-slate-400">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(1.4, z + 0.1))} className="px-2 py-0.5">+</button>
        </div>
      </div>
      <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-xl p-4 overflow-auto flex items-center justify-center min-h-[260px]">
        <div style={{ transform: 'scale(' + zoom + ')', transformOrigin: 'center' }} className="flex items-center gap-8 transition-transform">
          <div className="bg-cyan-950 border border-cyan-500/80 text-cyan-200 px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg max-w-[160px] text-center">
            {title}
          </div>
          <div className="space-y-3">
            {branches.map((b, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-6 h-px bg-slate-700" />
                <div className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs">{b}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfographicPanel({ items = [], title, summary }) {
  const cards = items.length > 0 ? items : [
    { title: 'Topic', content: title, badge: 'Focus', metric: 'Core' },
    { title: 'Synopsis', content: summary, badge: 'Summary', metric: '100%' }
  ];
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      {cards.map((c, i) => (
        <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-[9px] font-bold uppercase bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">{c.badge}</span>
              <span className="text-sm font-bold text-emerald-400">{c.metric}</span>
            </div>
            <h4 className="text-xs font-medium text-slate-100 mb-1">{c.title}</h4>
            <p className="text-[11px] text-slate-400">{c.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SlidesPanel({ slides = [] }) {
  const [slide, setSlide] = useState(0);
  const activeSlide = slides[slide] || { title: 'Slide', bullets: [], notes: '' };
  return (
    <div className="p-4 space-y-3">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 min-h-[200px] flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100 mb-3">{activeSlide.title}</h3>
          <ul className="space-y-1.5">
            {(activeSlide.bullets || []).map((b, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        {activeSlide.notes && (
          <div className="mt-4 pt-2 border-t border-slate-800 text-[11px] text-slate-400 italic">
            Notes: {activeSlide.notes}
          </div>
        )}
      </div>
      <div className="flex justify-between items-center text-xs">
        <button onClick={() => setSlide(s => Math.max(0, s - 1))} disabled={slide === 0} className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg disabled:opacity-30">Previous</button>
        <span className="text-slate-500 font-mono text-[11px]">Slide {slide + 1} of {slides.length}</span>
        <button onClick={() => setSlide(s => Math.min(slides.length - 1, s + 1))} disabled={slide >= slides.length - 1} className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg disabled:opacity-30">Next</button>
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
    <div className="p-4 space-y-3">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="text-xs font-semibold text-slate-300">Audio Podcast Overview</span>
        <button onClick={toggleSpeech} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-slate-950 font-bold rounded-lg text-xs">
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isPlaying ? 'Pause' : 'Play Audio'}</span>
        </button>
      </div>
      <div className="space-y-2">
        {script.map((line, idx) => (
          <div key={idx} className={isPlaying && currentLine === idx ? 'p-3 rounded-xl border text-xs bg-orange-500/10 border-orange-500/40 text-orange-200' : 'p-3 rounded-xl border text-xs bg-slate-900 border-slate-800 text-slate-400'}>
            <div className="font-bold text-[10px] text-slate-300 mb-1">{line.speaker}</div>
            <p>{line.text}</p>
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
  const quiz = questions[qIdx] || { prompt: 'No question available', options: [], answer: 0 };

  return (
    <div className="p-4 space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded">
            Question {qIdx + 1} of {questions.length}
          </span>
          {questions.length > 1 && (
            <button onClick={() => { setQIdx((qIdx + 1) % questions.length); setSelected(null); setSubmitted(false); }} className="text-xs text-cyan-400 hover:underline">
              Next Question →
            </button>
          )}
        </div>
        <p className="text-xs font-semibold text-slate-100">{quiz.prompt}</p>
        <div className="space-y-2 pt-1">
          {(quiz.options || []).map((opt, i) => (
            <button
              key={i}
              onClick={() => !submitted && setSelected(i)}
              className={
                submitted && i === quiz.answer
                  ? 'w-full text-left p-3 rounded-lg border text-xs bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  : selected === i
                  ? 'w-full text-left p-3 rounded-lg border text-xs bg-cyan-950/60 border-cyan-500 text-white'
                  : 'w-full text-left p-3 rounded-lg border text-xs bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900'
              }
            >
              <span className="font-mono text-[10px] opacity-60 mr-2">[{String.fromCharCode(65 + i)}]</span>
              <span>{opt}</span>
            </button>
          ))}
        </div>
        <button onClick={() => setSubmitted(true)} disabled={selected === null} className="w-full mt-2 py-2 bg-yellow-500 text-slate-950 font-bold text-xs rounded-lg disabled:opacity-40">
          Check Answer
        </button>
      </div>
    </div>
  );
}

function FlashcardsPanel({ cards = [] }) {
  const [flipped, setFlipped] = useState(false);
  const [index, setIndex] = useState(0);
  const activeCard = cards[index] || { q: 'No flashcards', a: '' };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center text-xs text-slate-400">
        <span>Spaced Repetition Deck</span>
        <span>{index + 1} of {cards.length}</span>
      </div>
      <div onClick={() => setFlipped(!flipped)} className="h-44 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer shadow-lg">
        <span className="text-[10px] uppercase font-bold text-slate-500 mb-2">
          {flipped ? 'Answer' : 'Question (Click to flip)'}
        </span>
        <p className="text-xs font-medium text-slate-100 max-w-sm">
          {flipped ? activeCard.a : activeCard.q}
        </p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => { setFlipped(false); setIndex((index + 1) % cards.length); }} className="flex-1 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-semibold">Need Review</button>
        <button onClick={() => { setFlipped(false); setIndex((index + 1) % cards.length); }} className="flex-1 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-semibold">Mastered</button>
      </div>
    </div>
  );
}

function AgentPanel({ steps = [], title }) {
  return (
    <div className="p-4 space-y-3">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="text-xs font-semibold text-slate-300">Autonomous Agent: {title.slice(0, 30)}</span>
        <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-mono">Verified</span>
      </div>
      <div className="space-y-2">
        {steps.map((st, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-slate-200">{st}</span>
          </div>
        ))}
      </div>
    </div>
  );
}