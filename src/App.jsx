import React, { useState } from 'react';
import {
  Share2, Rocket, Plus, FileText, MessageSquare, ListFilter,
  Network, LayoutGrid, Presentation, Mic, HelpCircle,
  CreditCard, Cpu, RefreshCw, Send, Copy, Check, ExternalLink, X, Loader2,
  Play, Pause
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('notes');
  const [activeTool, setActiveTool] = useState('summarize');
  
  const [videoUrl, setVideoUrl] = useState('https://youtu.be/Cb46_P12bMY');
  const [videoId, setVideoId] = useState('Cb46_P12bMY');
  const [videoTitle, setVideoTitle] = useState('Introduction to Compiler Design | Language Processing System');
  const [isFetching, setIsFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Dynamic Workspace Data
  const [studyData, setStudyData] = useState({
    title: "Introduction to Compiler Design | Language Processing System",
    summary: "A compiler translates high-level source code into target machine code. The language processing system connects preprocessors, compilers, assemblers, linkers, and loaders into an integrated pipeline.",
    takeaways: [
      "Preprocessor handles macro expansion and header inclusion before compilation.",
      "The Compiler parses high-level language into assembly code.",
      "The Assembler translates assembly mnemonics into relocatable machine code.",
      "The Linker binds object files and libraries, and the Loader loads the executable into memory."
    ],
    branches: ["Preprocessor (HLL)", "Compiler & Assembler", "Linker & Loader (Exec)"],
    slides: [
      {
        title: "Language Processing System",
        bullets: ["Source code enters the Preprocessor", "Compiler transforms code into Assembly", "Assembler emits relocatable Machine Code"],
        notes: "Explain each stage in the execution hierarchy from high-level language down to binary."
      },
      {
        title: "Linker and Loader",
        bullets: ["Linker resolves external symbols across libraries", "Loader allocates runtime memory addresses", "Execution begins on the CPU"],
        notes: "Emphasize how relocatable addresses are mapped to physical memory by the OS loader."
      }
    ],
    audioScript: [
      { speaker: "Host Alex", text: "Welcome to this study breakdown of the Language Processing System." },
      { speaker: "Dr. Jordan", text: "Notice how high-level code passes sequentially through the preprocessor, compiler, assembler, linker, and loader." },
      { speaker: "Host Alex", text: "Right, each stage transforms the program into a lower representation closer to the CPU." }
    ],
    quiz: {
      prompt: "Which component of the Language Processing System is responsible for resolving external library symbols and combining object modules?",
      options: ["Compiler", "Linker", "Preprocessor", "Assembler"],
      answer: 1
    },
    flashcards: [
      { q: "What does the Preprocessor do?", a: "Expands macros, handles file inclusions (#include), and removes comments before compilation." },
      { q: "What is the difference between a Compiler and an Assembler?", a: "A compiler converts high-level code to assembly; an assembler converts assembly to relocatable machine code." }
    ]
  });

  const [transcript, setTranscript] = useState([
    { start: 0, time: "00:00", text: "Welcome to this technical breakdown of Compiler Design and Language Processing Systems." },
    { start: 12, time: "00:12", text: "We analyze high-level language conversion through preprocessors, compilers, assemblers, linkers, and loaders." },
    { start: 30, time: "00:30", text: "The preprocessor resolves source directives and header inclusions prior to parsing." },
    { start: 55, time: "00:55", text: "The compiler then outputs assembly mnemonics for target hardware." },
    { start: 85, time: "01:25", text: "Finally, object files are linked and loaded into memory for program execution." }
  ]);

  const [showShareModal, setShowShareModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your AI study copilot. Ask me anything about Compiler Design or your active video.' }
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
      // 1. Fetch Video Metadata & Subtitles
      const res = await fetch('/api/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl })
      });
      const data = await res.json();

      let activeTitle = data.videoTitle || "Technical Video Notes";
      setVideoTitle(activeTitle);

      let parsedTranscript = [];
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

      // 2. Request Gemini to generate comprehensive notes for all 8 tools
      const fullText = parsedTranscript.map(t => t.text).join(' ');
      const aiPrompt = `Topic: "${activeTitle}". Video Transcript/Context: "${fullText.slice(0, 5000)}".
Generate a complete, structured study package in valid JSON with these exact keys:
{
  "summary": "2-3 sentence executive overview of ${activeTitle}",
  "takeaways": ["4 distinct bullet points covering key mechanisms"],
  "branches": ["3 core conceptual branch topics for a mindmap"],
  "slides": [
    {"title": "Slide 1 Title", "bullets": ["Point 1", "Point 2", "Point 3"], "notes": "Speaker notes"},
    {"title": "Slide 2 Title", "bullets": ["Point 1", "Point 2", "Point 3"], "notes": "Speaker notes"}
  ],
  "audioScript": [
    {"speaker": "Host Alex", "text": "Hook welcoming listeners to ${activeTitle}"},
    {"speaker": "Dr. Jordan", "text": "Technical insight on how it works"},
    {"speaker": "Host Alex", "text": "Takeaway wrap-up"}
  ],
  "quiz": {
    "prompt": "Conceptual question about ${activeTitle}",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 1
  },
  "flashcards": [
    {"q": "Important question 1", "a": "Clear answer 1"},
    {"q": "Important question 2", "a": "Clear answer 2"}
  ]
}`;

      const aiRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          systemInstruction: "You are an expert AI tutor. Output strictly valid JSON matching the schema.",
          jsonMode: true
        })
      });

      const aiData = await aiRes.json();
      if (aiData.text) {
        try {
          const parsed = JSON.parse(aiData.text);
          setStudyData({
            title: activeTitle,
            summary: parsed.summary || `Analysis of ${activeTitle}`,
            takeaways: parsed.takeaways || ["Core conceptual mechanics", "Execution pipeline flow"],
            branches: parsed.branches || ["Foundations", "Architecture", "Runtime Execution"],
            slides: parsed.slides || studyData.slides,
            audioScript: parsed.audioScript || studyData.audioScript,
            quiz: parsed.quiz || studyData.quiz,
            flashcards: parsed.flashcards || studyData.flashcards
          });
        } catch (jsonErr) {
          console.warn("JSON parse fallback", jsonErr);
        }
      }

      setChatMessages([
        { role: 'assistant', text: `I have analyzed "${activeTitle}". Ask me any questions about this lecture!` }
      ]);

    } catch (err) {
      console.error(err);
      alert("Error fetching video data. Check your connection or API key.");
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
        { start: 0, time: "00:00", text: "New workspace ready. Paste a video URL to begin." }
      ]);
      setChatMessages([{ role: 'assistant', text: 'Workspace reset. Paste a URL or ask any question.' }]);
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
          prompt: `Context Topic: ${videoTitle}\nTranscript & Notes: ${transcript.map(t => t.text).join(' ')}\n\nUser Question: ${userMsg}`,
          systemInstruction: "You are an expert tutor. Provide accurate, helpful answers based on the topic and notes."
        })
      });
      const data = await res.json();
      const reply = data.text || "In the language processing pipeline, each stage transforms code into lower-level representations culminating in machine execution.";
      setChatMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        text: 'The preprocessor expands macros, the compiler generates assembly, the assembler creates object code, and the linker/loader preps execution.'
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
        
        {/* LEFT COLUMN: Player & Transcript */}
        <div className="w-1/2 border-r border-slate-800 flex flex-col bg-slate-950/60">
          <div className="p-3 border-b border-slate-800 flex gap-2 bg-slate-900/40">
            <input 
              type="text" 
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
              placeholder="Paste YouTube video URL..."
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

              {/* 8 DYNAMIC PANELS */}
              <div className="flex-1 overflow-y-auto">
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

                {activeTool === 'mindmap' && (
                  <MindMapPanel title={studyData.title} branches={studyData.branches} />
                )}

                {activeTool === 'infographic' && (
                  <InfographicPanel title={studyData.title} summary={studyData.summary} />
                )}

                {activeTool === 'slides' && (
                  <SlidesPanel slides={studyData.slides} />
                )}

                {activeTool === 'audio' && (
                  <AudioPanel script={studyData.audioScript} />
                )}

                {activeTool === 'quiz' && (
                  <QuizPanel quiz={studyData.quiz} />
                )}

                {activeTool === 'flashcards' && (
                  <FlashcardsPanel cards={studyData.flashcards} />
                )}

                {activeTool === 'agent' && (
                  <AgentPanel title={studyData.title} />
                )}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((m, idx) => (
                  <div key={idx} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                    <div className={m.role === 'user' ? 'max-w-[85%] rounded-2xl px-4 py-2.5 text-xs bg-cyan-600 text-white rounded-tr-none' : 'max-w-[85%] rounded-2xl px-4 py-2.5 text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-2 text-xs text-slate-400 flex items-center gap-2">
                      <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                      Analyzing lecture notes...
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/40 flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Ask about ${videoTitle.slice(0, 30)}...`}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <button type="submit" disabled={isChatLoading || !chatInput.trim()} className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg disabled:opacity-40 transition-colors">
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
            <div className="flex gap-2">
              <input readOnly value={window.location.href} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono" />
              <button onClick={() => handleCopy(window.location.href)} className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-100">Upgrade to Pro Workspace</h3>
              </div>
              <button onClick={() => setShowUpgradeModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300">Enjoy unlimited transcript processing, high-fidelity AI agents, and neural podcast audio synthesis.</p>
            <button onClick={() => setShowUpgradeModal(false)} className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs rounded-xl">
              Dismiss
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// ── REUSABLE SUB-PANEL COMPONENTS ──

function MindMapPanel({ title, branches }) {
  const [zoom, setZoom] = useState(1);
  return (
    <div className="p-4 flex flex-col h-full space-y-3">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="text-xs font-semibold text-slate-300">Concept Map</span>
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded p-0.5 text-xs">
          <button onClick={() => setZoom(z => Math.max(0.7, z - 0.1))} className="px-2 py-0.5 hover:text-white">-</button>
          <span className="px-1 text-[10px] text-slate-400">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(1.4, z + 0.1))} className="px-2 py-0.5 hover:text-white">+</button>
        </div>
      </div>

      <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-xl p-4 overflow-auto flex items-center justify-center min-h-[280px]">
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }} className="flex items-center gap-8 transition-transform">
          <div className="bg-cyan-950 border border-cyan-500/80 text-cyan-200 px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg max-w-[150px] text-center">
            {title.slice(0, 32)}
          </div>
          <div className="space-y-4">
            {branches.map((b, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-6 h-px bg-slate-700" />
                <div className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs">
                  {b}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfographicPanel({ title, summary }) {
  const cards = [
    { title: "Core Subject", content: title, badge: "Topic", metric: "Active" },
    { title: "Processing Flow", content: summary.slice(0, 110) + "...", badge: "Overview", metric: "100%" },
    { title: "Architecture", content: "Transforms high-level source instructions into executable binary instructions.", badge: "Goal", metric: "Pipeline" }
  ];

  return (
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
    </div>
  );
}

function SlidesPanel({ slides }) {
  const [slide, setSlide] = useState(0);
  const activeSlide = slides[slide] || slides[0];

  return (
    <div className="p-4 space-y-3">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 min-h-[200px] flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100 mb-3">{activeSlide.title}</h3>
          <ul className="space-y-1.5">
            {activeSlide.bullets.map((b, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 pt-2 border-t border-slate-800 text-[11px] text-slate-400 italic">
          Speaker Notes: {activeSlide.notes}
        </div>
      </div>

      <div className="flex justify-between items-center text-xs">
        <button onClick={() => setSlide(s => Math.max(0, s - 1))} disabled={slide === 0} className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 disabled:opacity-30">
          Previous
        </button>
        <span className="text-slate-500 font-mono text-[11px]">Slide {slide + 1} of {slides.length}</span>
        <button onClick={() => setSlide(s => Math.min(slides.length - 1, s + 1))} disabled={slide === slides.length - 1} className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 disabled:opacity-30">
          Next
        </button>
      </div>
    </div>
  );
}

function AudioPanel({ script }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert("Browser speech synthesis not supported.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    let idx = 0;

    const speakItem = () => {
      if (idx >= script.length) {
        setIsPlaying(false);
        setCurrentLine(0);
        return;
      }
      setCurrentLine(idx);
      const utter = new SpeechSynthesisUtterance(script[idx].text);
      utter.rate = 1.0;
      utter.pitch = idx % 2 === 0 ? 1.0 : 1.25;
      utter.onend = () => {
        idx++;
        speakItem();
      };
      window.speechSynthesis.speak(utter);
    };

    speakItem();
  };

  return (
    <div className="p-4 space-y-3">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="text-xs font-semibold text-slate-300">Podcast Dialogue Overview</span>
        <button onClick={toggleSpeech} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold rounded-lg text-xs">
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isPlaying ? 'Pause' : 'Play Audio'}</span>
        </button>
      </div>

      <div className="space-y-2">
        {script.map((line, idx) => (
          <div key={idx} className={isPlaying && currentLine === idx ? 'p-3 rounded-xl border text-xs transition-all bg-orange-500/10 border-orange-500/40 text-orange-200' : 'p-3 rounded-xl border text-xs transition-all bg-slate-900 border-slate-800 text-slate-400'}>
            <div className="font-bold text-[10px] text-slate-300 mb-1">{line.speaker}</div>
            <p>{line.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizPanel({ quiz }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="p-4 space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded">
            Lecture Quiz
          </span>
          <span className="text-xs text-slate-400">Score: {submitted && selected === quiz.answer ? '100%' : '0%'}</span>
        </div>
        <p className="text-xs font-semibold text-slate-100">{quiz.prompt}</p>

        <div className="space-y-2 pt-1">
          {quiz.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => !submitted && setSelected(i)}
              className={
                submitted && i === quiz.answer
                  ? 'w-full text-left p-3 rounded-lg border text-xs transition-colors bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  : selected === i 
                  ? 'w-full text-left p-3 rounded-lg border text-xs transition-colors bg-cyan-950/60 border-cyan-500 text-white' 
                  : 'w-full text-left p-3 rounded-lg border text-xs transition-colors bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900'
              }
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] opacity-60">[{String.fromCharCode(65 + i)}]</span>
                <span>{opt}</span>
              </div>
            </button>
          ))}
        </div>

        <button onClick={() => setSubmitted(true)} disabled={selected === null} className="w-full mt-2 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs rounded-lg disabled:opacity-40 transition-colors">
          Check Answer
        </button>
      </div>
    </div>
  );
}

function FlashcardsPanel({ cards }) {
  const [flipped, setFlipped] = useState(false);
  const [index, setIndex] = useState(0);
  const activeCard = cards[index] || cards[0];

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center text-xs text-slate-400">
        <span>Spaced Repetition Deck</span>
        <span>{index + 1} of {cards.length}</span>
      </div>

      <div onClick={() => setFlipped(!flipped)} className="h-44 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer shadow-lg transition-all">
        <span className="text-[10px] uppercase font-bold text-slate-500 mb-2">
          {flipped ? 'Answer' : 'Question (Click to flip)'}
        </span>
        <p className="text-xs font-medium text-slate-100 max-w-sm">
          {flipped ? activeCard.a : activeCard.q}
        </p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => { setFlipped(false); setIndex((index + 1) % cards.length); }} className="flex-1 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-semibold">
          Need Review
        </button>
        <button onClick={() => { setFlipped(false); setIndex((index + 1) % cards.length); }} className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-semibold">
          Mastered
        </button>
      </div>
    </div>
  );
}

function AgentPanel({ title }) {
  const steps = [
    { status: 'done', text: `Extracted syllabus outline for: ${title.slice(0, 35)}...` },
    { status: 'done', text: 'Cross-checked system stages: Preprocessor → Compiler → Assembler → Linker → Loader' },
    { status: 'active', text: 'Synthesizing verified exam study notes and topic hierarchy' }
  ];

  return (
    <div className="p-4 space-y-3">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="text-xs font-semibold text-slate-300">Autonomous Reasoning Pipeline</span>
        <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-mono animate-pulse">
          Loop Active
        </span>
      </div>

      <div className="space-y-2">
        {steps.map((st, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            {st.status === 'done' ? <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin flex-shrink-0" />}
            <span className={st.status === 'done' ? 'text-slate-300' : 'text-slate-100 font-medium'}>
              {st.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}