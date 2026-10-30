import React, { useState, useRef, useEffect } from 'react';
import {
  Share2, Rocket, Plus, FileText, MessageSquare, ListFilter,
  Network, LayoutGrid, Presentation, Mic, HelpCircle,
  CreditCard, Cpu, Play, Pause, ChevronRight, ChevronLeft,
  CheckCircle2, RefreshCw, Send, Copy, Check, ExternalLink, X
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
  // Navigation & Workspace states
  const [activeTab, setActiveTab] = useState('notes'); // 'transcript' | 'notes' | 'chat'
  const [activeTool, setActiveTool] = useState('summarize'); // 8 tools
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=wvWpdrfoEv0');
  const [transcript, setTranscript] = useState(INITIAL_TRANSCRIPT);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Modals
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Copilot Chat
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your study co-pilot. Ask me anything about this video or document.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Helper: Copy active text
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper: Reset session (+ New)
  const handleNewSession = () => {
    if (window.confirm("Start a new workspace session? Active states will be reset.")) {
      setTranscript([
        { start: 0, time: "00:00", text: "New document/video loaded. Paste your notes or subtitles." }
      ]);
      setChatMessages([{ role: 'assistant', text: 'Workspace reset. How can I help you with your new material?' }]);
      setActiveTool('summarize');
    }
  };

  // Helper: Send Chat Message to API
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
      const reply = data.text || "I've reviewed your notes: Attention layers compute dynamic weights across all token pairs concurrently.";
      setChatMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Self-attention processes every token position simultaneously via query, key, and value matrices, yielding quadratic O(N²) context routing.'
      }]);
    } finally {
      setIsChatLoading(false);
    }
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

        {/* Action Controls matching screenshot[span_1](start_span)[span_1](end_span) */}
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

      {/* ── MAIN WORKSPACE CONTAINER ── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT COLUMN: Media Source & Transcript Viewer */}
        <div className="w-1/2 border-r border-slate-800 flex flex-col bg-slate-950/60">
          
          {/* URL Input Bar */}
          <div className="p-3 border-b border-slate-800 flex gap-2 bg-slate-900/40">
            <input 
              type="text" 
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste YouTube or video URL..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <button className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors">
              Fetch
            </button>
          </div>

          {/* Embedded Video Player Simulator */}
          <div className="relative aspect-video bg-black flex items-center justify-center border-b border-slate-800 group">
            <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop')` }} />
            <div className="z-10 text-center">
              <div className="w-12 h-12 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-slate-950 flex items-center justify-center cursor-pointer shadow-lg mx-auto mb-2 transition-transform hover:scale-105">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
              <p className="text-xs font-medium text-slate-300">Attention Is All You Need (Paper Walkthrough)</p>
            </div>
            <span className="absolute bottom-2 right-2 text-[10px] font-mono bg-black/80 px-2 py-0.5 rounded text-slate-400">
              01:52 / 12:40
            </span>
          </div>

          {/* Transcript List */}
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
          
          {/* Top 3 Segment Switcher matching screenshot[span_2](start_span)[span_2](end_span) */}
          <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex gap-2">
            <button 
              onClick={() => setActiveTab('transcript')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all border ${
                activeTab === 'transcript'
                  ? 'bg-slate-800 border-slate-700 text-white shadow-sm'
                  : 'bg-slate-900/50 border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Transcript</span>
            </button>

            <button 
              onClick={() => setActiveTab('notes')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all border ${
                activeTab === 'notes'
                  ? 'bg-cyan-950/40 border-cyan-800/80 text-cyan-300 shadow-sm'
                  : 'bg-slate-900/50 border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Notes</span>
            </button>

            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all border ${
                activeTab === 'chat'
                  ? 'bg-slate-800 border-slate-700 text-white shadow-sm'
                  : 'bg-slate-900/50 border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Chat</span>
            </button>
          </div>

          {/* TAB 1: Standalone Raw Transcript View */}
          {activeTab === 'transcript' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-xs text-slate-400 font-mono">Total Tokens: ~450</span>
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

          {/* TAB 2: AI Notes Workspace (Grid of 8 tools matching screenshot[span_3](start_span)[span_3](end_span)) */}
          {activeTab === 'notes' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* 2x4 Grid Tool Selector matching screenshot[span_4](start_span)[span_4](end_span) */}
              <div className="p-3 border-b border-slate-800 grid grid-cols-2 gap-2 bg-slate-900/30">
                
                {/* 1. Summarize[span_5](start_span)[span_5](end_span) */}
                <button 
                  onClick={() => setActiveTool('summarize')}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    activeTool === 'summarize'
                      ? 'bg-slate-800 border-cyan-500/60 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ListFilter className="w-4 h-4 text-cyan-400" />
                    <span>Summarize</span>
                  </div>
                  <span className="text-slate-500 text-xs">•••</span>
                </button>

                {/* 2. Mind Map[span_6](start_span)[span_6](end_span) */}
                <button 
                  onClick={() => setActiveTool('mindmap')}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    activeTool === 'mindmap'
                      ? 'bg-slate-800 border-cyan-500/60 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-amber-400" />
                    <span>Mind Map</span>
                  </div>
                  <span className="text-slate-500 text-xs">•••</span>
                </button>

                {/* 3. Infographic[span_7](start_span)[span_7](end_span) */}
                <button 
                  onClick={() => setActiveTool('infographic')}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    activeTool === 'infographic'
                      ? 'bg-slate-800 border-cyan-500/60 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-emerald-400" />
                    <span>Infographic</span>
                  </div>
                </button>

                {/* 4. Slides[span_8](start_span)[span_8](end_span) */}
                <button 
                  onClick={() => setActiveTool('slides')}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    activeTool === 'slides'
                      ? 'bg-slate-800 border-cyan-500/60 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Presentation className="w-4 h-4 text-orange-400" />
                    <span>Slides</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                </button>

                {/* 5. Audio Overview[span_9](start_span)[span_9](end_span) */}
                <button 
                  onClick={() => setActiveTool('audio')}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    activeTool === 'audio'
                      ? 'bg-slate-800 border-cyan-500/60 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-orange-400" />
                    <span>Audio Overview</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                </button>

                {/* 6. Quiz[span_10](start_span)[span_10](end_span) */}
                <button 
                  onClick={() => setActiveTool('quiz')}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    activeTool === 'quiz'
                      ? 'bg-slate-800 border-cyan-500/60 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-yellow-400" />
                    <span>Quiz</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-slate-500 text-xs">•••</span>
                  </div>
                </button>

                {/* 7. Flashcards[span_11](start_span)[span_11](end_span) */}
                <button 
                  onClick={() => setActiveTool('flashcards')}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    activeTool === 'flashcards'
                      ? 'bg-slate-800 border-cyan-500/60 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-yellow-400" />
                    <span>Flashcards</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-slate-500 text-xs">•••</span>
                  </div>
                </button>

                {/* 8. AI Agent[span_12](start_span)[span_12](end_span) */}
                <button 
                  onClick={() => setActiveTool('agent')}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    {/* 8. AI Agent */}
<button 
  onClick={() => setActiveTool('agent')}
  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
    activeTool === 'agent'
      ? 'bg-slate-800 border-cyan-500/60 text-white shadow-sm'
      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-850'
  }`}
>
  <div className="flex items-center gap-2">
    <Cpu className="w-4 h-4 text-cyan-400" />
    <span>AI Agent</span>
  </div>
  <div className="flex items-center gap-1.5">
    <span className="w-2 h-2 rounded-full bg-rose-500" />
    <ExternalLink className="w-3 h-3 text-slate-400" />
  </div>
</button>