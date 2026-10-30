import React, { useState } from 'react';
import {
  Share2, Rocket, Plus, FileText, MessageSquare, ListFilter,
  Network, LayoutGrid, Presentation, Mic, HelpCircle,
  CreditCard, Cpu, RefreshCw, Send, Copy, Check, ExternalLink, X, Loader2,
  Play, Pause
} from 'lucide-react';

const INITIAL_TRANSCRIPT = [
  { start: 0, time: "00:00", text: "Welcome to our overview of Attention Mechanisms and Transformer architectures." },
  { start: 14, time: "00:14", text: "Traditional sequence transductions relied primarily on recurrent or convolutional nets." },
  { start: 32, time: "00:32", text: "The Transformer ditches recurrence entirely, relying entirely on self-attention mechanisms." },
  { start: 58, time: "00:58", text: "This allows models to be significantly more parallelizable and require less training time." },
  { start: 85, time: "01:25", text: "Multi-Head Attention enables attending to information from different representation subspaces." },
  { start: 112, time: "01:52", text: "In conclusion, scaled dot-product attention fundamentally unlocked the LLM era." }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('notes');
  const [activeTool, setActiveTool] = useState('summarize');
  
  const [videoUrl, setVideoUrl] = useState('https://youtu.be/VQeI71B5ccM');
  const [videoId, setVideoId] = useState('VQeI71B5ccM');
  const [transcript, setTranscript] = useState(INITIAL_TRANSCRIPT);
  const [isFetching, setIsFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const [summaryData, setSummaryData] = useState({
    title: "Attention as the Core Foundation",
    summary: "The presented material eliminates recurrence and convolutions in sequence transduction tasks, demonstrating that simple scaled dot-product attention paired with multi-head transformations provides superior generalization with minimal training cost.",
    takeaways: [
      "Quadratic compute complexity O(N²) occurs due to token-to-token all-pairs dot products.",
      "Parallel processing across sequence dimensions replaces sequential forward-propagation bottlenecks.",
      "Multi-head projections allow models to jointly resolve syntax, grammar, and semantics in disparate subspaces."
    ]
  });

  const [showShareModal, setShowShareModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your study co-pilot. Ask me anything about this video or document.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const extractVideoId = (url) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const handleFetch = async () => {
    const extractedId = extractVideoId(videoUrl);
    if (!extractedId) {
      alert("Please enter a valid YouTube video URL.");
      return;
    }

    setVideoId(extractedId);
    setIsFetching(true);

    try {
      const res = await fetch('/api/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl })
      });
      const data = await res.json();

      let parsedTranscript = INITIAL_TRANSCRIPT;
      if (data.transcript && data.transcript.length > 0) {
        parsedTranscript = data.transcript.map(item => {
          const totalSec = Math.floor(item.start);
          const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
          const ss = String(totalSec % 60).padStart(2, '0');
          return {
            start: item.start,
            time: `${mm}:${ss}`,
            text: item.text
          };
        });
        setTranscript(parsedTranscript);
      }

      const fullText = parsedTranscript.map(t => t.text).join(' ');
      const aiRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Analyze this video transcript and return a structured summary:\n\n${fullText.slice(0, 8000)}`,
          systemInstruction: `Return a valid JSON object matching: {"title": "Short Title", "summary": "2-3 sentence overview", "takeaways": ["Point 1", "Point 2", "Point 3"]}`,
          jsonMode: true
        })
      });

      const aiData = await aiRes.json();
      if (aiData.text) {
        try {
          const parsed = JSON.parse(aiData.text);
          setSummaryData({
            title: parsed.title || "Video Overview",
            summary: parsed.summary || "Summary generated from video transcript.",
            takeaways: parsed.takeaways || []
          });
        } catch {
          // Keep current state on parse failure
        }
      }
    } catch (err) {
      console.error(err);
      alert("Unable to fetch transcript from this video. Ensure captions are available.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNewSession = () => {
    if (window.confirm("Start a new workspace session? Active states will be reset.")) {
      setTranscript([
        { start: 0, time: "00:00", text: "New document/video loaded. Paste your notes or subtitles." }
      ]);
      setChatMessages([{ role: 'assistant', text: 'Workspace reset. How can I help you with your new material?' }]);
      setActiveTool('summarize');
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Context:\n${transcript.map(t => t.text).join(' ')}\n\nQuestion: ${userMsg}`,
          systemInstruction: "You are an expert AI tutor. Answer questions accurately based on the provided material context."
        })
      });
      const data = await res.json();
      const reply = data.text || "Attention layers compute dynamic weights across all token pairs concurrently.";
      setChatMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Self-attention processes tokens dynamically via Query, Key, and Value vectors.'
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
      
      {/* ── TOP HEADER ── */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md">
            N
          </div>
          <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            NoteGPT Workspace
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full font-mono">
            v2.5
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Share</span>
          </button>

          <button 
            onClick={() => setShowUpgradeModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-xs text-amber-300 font-medium transition-colors"
          >
            <Rocket className="w-3.5 h-3.5 text-amber-400" />
            <span>Upgrade</span>
          </button>

          <button 
            onClick={handleNewSession}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>New</span>
          </button>
        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT COLUMN: Real YouTube Player & Transcript */}
        <div className="w-1/2 border-r border-slate-800 flex flex-col bg-slate-950/60">
          <div className="p-3 border-b border-slate-800 flex gap-2 bg-slate-900/40">
            <input 
              type="text" 
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
              placeholder="Paste YouTube or video URL..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <button 
              onClick={handleFetch}
              disabled={isFetching}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isFetching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{isFetching ? 'Fetching...' : 'Fetch'}</span>
            </button>
          </div>

          <div className="relative aspect-video bg-black flex items-center justify-center border-b border-slate-800">
            {videoId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube Video Player"
              />
            ) : (
              <div className="text-xs text-slate-500">Paste a YouTube URL above and click Fetch</div>
            )}
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/30">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Synchronized Transcript
              </span>
              <input 
                type="text"
                placeholder="Search transcript..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300 w-36 focus:outline-none focus:border-slate-700"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {transcript
                .filter(t => t.text.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((seg, idx) => (
                  <div key={idx} className="group flex gap-3 p-2 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer text-xs">
                    <span className="font-mono text-cyan-400/80 font-medium text-[11px] select-none pt-0.5">
                      {seg.time}
                    </span>
                    <p className="text-slate-300 group-hover:text-slate-100 leading-relaxed">
                      {seg.text}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: NoteGPT Feature Hub */}
        <div className="w-1/2 flex flex-col bg-slate-950 overflow-hidden">
          
          <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex gap-2">
            <button 
              onClick={() => setActiveTab('transcript')}
              className={
                activeTab === 'transcript'
                  ? 'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all border bg-slate-800 border-slate-700 text-white shadow-sm'
                  : 'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all border bg-slate-900/50 border-transparent text-slate-400 hover:text-slate-200'
              }
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Transcript</span>
            </button>

            <button 
              onClick={() => setActiveTab('notes')}
              className={
                activeTab === 'notes'
                  ? 'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all border bg-cyan-950/40 border-cyan-800/80 text-cyan-300 shadow-sm'
                  : 'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all border bg-slate-900/50 border-transparent text-slate-400 hover:text-slate-200'
              }
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Notes</span>
            </button>

            <button 
              onClick={() => setActiveTab('chat')}
              className={
                activeTab === 'chat'
                  ? 'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all border bg-slate-800 border-slate-700 text-white shadow-sm'
                  : 'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all border bg-slate-900/50 border-transparent text-slate-400 hover:text-slate-200'
              }
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Chat</span>
            </button>
          </div>

          {activeTab === 'transcript' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-xs text-slate-400 font-mono">Lines: {transcript.length}</span>
                <button 
                  onClick={() => handleCopy(transcript.map(t => `${t.time} ${t.text}`).join('\n'))}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy All'}</span>
                </button>
              </div>
              <pre className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                {transcript.map(t => `[${t.time}] ${t.text}`).join('\n\n')}
              </pre>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              
              <div className="p-3 border-b border-slate-800 grid grid-cols-2 gap-2 bg-slate-900/30">
                <button onClick={() => setActiveTool('summarize')} className={getToolBtnClass('summarize')}>
                  <div className="flex items-center gap-2">
                    <ListFilter className="w-4 h-4 text-cyan-400" />
                    <span>Summarize</span>
                  </div>
                  <span className="text-slate-500 text-xs">•••</span>
                </button>

                <button onClick={() => setActiveTool('mindmap')} className={getToolBtnClass('mindmap')}>
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-amber-400" />
                    <span>Mind Map</span>
                  </div>
                  <span className="text-slate-500 text-xs">•••</span>
                </button>

                <button onClick={() => setActiveTool('infographic')} className={getToolBtnClass('infographic')}>
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-emerald-400" />
                    <span>Infographic</span>
                  </div>
                </button>

                <button onClick={() => setActiveTool('slides')} className={getToolBtnClass('slides')}>
                  <div className="flex items-center gap-2">
                    <Presentation className="w-4 h-4 text-orange-400" />
                    <span>Slides</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                </button>

                <button onClick={() => setActiveTool('audio')} className={getToolBtnClass('audio')}>
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-orange-400" />
                    <span>Audio Overview</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                </button>

                <button onClick={() => setActiveTool('quiz')} className={getToolBtnClass('quiz')}>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-yellow-400" />
                    <span>Quiz</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-slate-500 text-xs">•••</span>
                  </div>
                </button>

                <button onClick={() => setActiveTool('flashcards')} className={getToolBtnClass('flashcards')}>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-yellow-400" />
                    <span>Flashcards</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-slate-500 text-xs">•••</span>
                  </div>
                </button>

                <button onClick={() => setActiveTool('agent')} className={getToolBtnClass('agent')}>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span>AI Agent</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </div>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {activeTool === 'summarize' && <SummarizePanel summaryData={summaryData} />}
                {activeTool === 'mindmap' && <MindMapPanel title={summaryData.title} />}
                {activeTool === 'infographic' && <InfographicPanel title={summaryData.title} />}
                {activeTool === 'slides' && <SlidesPanel summaryData={summaryData} />}
                {activeTool === 'audio' && <AudioPanel summaryData={summaryData} />}
                {activeTool === 'quiz' && <QuizPanel />}
                {activeTool === 'flashcards' && <FlashcardsPanel />}
                {activeTool === 'agent' && <AgentPanel />}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((m, idx) => (
                  <div 
                    key={idx} 
                    className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                  >
                    <div 
                      className={
                        m.role === 'user' 
                          ? 'max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed bg-cyan-600 text-white rounded-tr-none' 
                          : 'max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                      }
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-2 text-xs text-slate-400 flex items-center gap-2">
                      <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                      Synthesizing response...
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/40 flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question about the active video context..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <button 
                  type="submit" 
                  disabled={isChatLoading || !chatInput.trim()}
                  className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg disabled:opacity-40 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* ── MODALS ── */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-cyan-400" /> Share Study Workspace
              </h3>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Shareable link for this video and study workspace.
            </p>
            <div className="flex gap-2">
              <input 
                readOnly 
                value={window.location.href}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono"
              />
              <button 
                onClick={() => handleCopy(window.location.href)}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold"