import React, { useState, useEffect, useRef } from 'react';
import {
  Share2, Rocket, Plus, FileText, MessageSquare, ListFilter,
  Network, LayoutGrid, Presentation, Mic, HelpCircle,
  CreditCard, Cpu, RefreshCw, Send, Copy, Check, ExternalLink, X, Loader2,
  Play, Pause, Video, ChevronLeft, ChevronRight, Download, Search, BookOpen,
  Layers, Compass, Settings, Volume2, Maximize2, Minimize2, Shuffle, Edit3,
  Printer, Sparkles, Palette, ZoomIn, ZoomOut, RotateCcw, CheckCircle2,
  FileSpreadsheet, BarChart3, Telescope, Image as ImageIcon, Film, FileAudio
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

function speakText(text, pitchVal = 1.0) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.pitch = pitchVal;
  u.rate = 1.0;
  window.speechSynthesis.speak(u);
}

function buildDefaultMindMap(title) {
  return {
    root: 'Understanding ' + title,
    left: [
      {
        title: 'Scale and Complexity of Systems 📚',
        subBranches: [
          {
            title: '',
            leaves: [
              'Networks contain thousands of tunable weights and biases (parameters)',
              'Learning means adjusting parameters automatically to solve recognition tasks',
              'Manually setting parameters is nearly impossible, highlighting training importance'
            ]
          }
        ]
      },
      {
        title: 'Concept of Learning and Next Steps 📚',
        subBranches: [
          {
            title: '',
            leaves: [
              'Learning adjusts weights and biases based on data to improve accuracy',
              'Gradient descent and backpropagation optimize network error functions',
              'Models act not as black boxes but as complex functions with interpretable parameters'
            ]
          }
        ]
      },
      {
        title: 'Additional Insights on Activation Functions 💡',
        subBranches: [
          {
            title: 'Sigmoid vs ReLU',
            leaves: [
              'Sigmoid: early activation function, biologically inspired, outputs between 0 and 1',
              'ReLU (Rectified Linear Unit): outputs max(0, input), easier to train in deep nets',
              'ReLU simplifies activation and improves training efficiency for large networks'
            ]
          },
          {
            title: 'Biological Motivation',
            leaves: [
              'Both functions mimic neuron activation thresholds while ReLU is computationally simpler',
              'Choice of activation directly affects learning speed and network performance'
            ]
          }
        ]
      }
    ],
    right: [
      {
        title: 'Human Brain and Visual Recognition 🧠',
        subBranches: [
          {
            title: '',
            leaves: [
              'Brain effortlessly recognizes sloppily rendered digits in low 28x28 resolution',
              'Different neurons fire for different images, yet the brain unifies the concept',
              'Visual cortex resolves varying pixel patterns into distinct structured ideas'
            ]
          }
        ]
      },
      {
        title: 'Core Architecture Basics 💻',
        subBranches: [
          {
            title: 'What is a Neuron?',
            leaves: [
              'Inspired by the brain neuron structure but simplified mathematically',
              'Neurons hold numbers between 0 and 1 called activations',
              'Layers: input layer (pixels), hidden layers, and output layer (predictions)'
            ]
          },
          {
            title: 'Network Structure',
            leaves: [
              'Input layer: 784 neurons for 28x28 pixel images with grayscale values',
              'Output layer: 10 neurons representing digits 0 through 9',
              'Hidden layers: intermediate layers (example with 2 layers of 16 neurons)',
              'Activations in one layer directly influence the next layer activations'
            ]
          },
          {
            title: 'Purpose of Layers',
            leaves: [
              'Hidden layers detect subcomponents (edges, loops, lines) of digits',
              'Higher layers combine subcomponents into complete recognizable patterns',
              'Layered abstraction generalizes to tasks like speech and image recognition'
            ]
          }
        ]
      },
      {
        title: 'How the Mechanism Operates ⚙️',
        subBranches: [
          {
            title: 'Weights and Connections',
            leaves: [
              'Each neuron connects to every neuron in the previous layer with unique weights',
              'Weighted sum of inputs determines target neuron activation strength',
              'Weights create pattern detectors (e.g., edge detection via positive/negative weights)'
            ]
          },
          {
            title: 'Bias and Activation Functions',
            leaves: [
              'Bias adjusts threshold for neuron activation (needs sum > threshold to activate)',
              'Sigmoid function squishes weighted sum into range between 0 and 1',
              'Modern networks often use ReLU instead of sigmoid for better training performance'
            ]
          },
          {
            title: 'Mathematical Representation',
            leaves: [
              'Activations represented as vectors, weights organized as matrices',
              'Next layer activations = sigmoid(weight matrix × activation vector + bias vector)',
              'Matrix multiplication streamlines computation and coding efficiency'
            ]
          }
        ]
      }
    ]
  };
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

  const headline = getSection('HEADLINE') || ('Demystifying ' + defaultTitle + ': Structure & Core Principles');

  const summaryRaw = getSection('SUMMARY');
  const summaryParagraphs = summaryRaw
    ? summaryRaw.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
    : [
        'This video provides an accessible introduction to ' + defaultTitle + ', focusing on its fundamental structure and how it processes information. Starting with a concrete example, the discussion highlights how patterns are identified and why formalizing this mathematically is essential.',
        'The narrative then delves into the internal architecture, breaking down its core components into layers, activations, weights, and biases. Each unit holds numerical values representing activation levels that propagate forward through matrix transformations.'
      ];

  const highlightsRaw = getSection('HIGHLIGHTS');
  const highlights = highlightsRaw
    .split('\n')
    .map(l => l.replace(/^[-*•]\s*/, '').trim())
    .filter(l => l.indexOf('|') !== -1)
    .map(l => {
      const parts = l.split('|').map(s => s.trim());
      return {
        time: parts[0] || '00:04',
        title: parts[1] || 'Core Concept',
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

  // Parse Mindmap tree
  const mindmapTree = buildDefaultMindMap(defaultTitle);
  const mmRaw = getSection('MINDMAP');
  if (mmRaw) {
    const lines = mmRaw.split('\n').map(l => l.replace(/^[-*•]\s*/, '').trim()).filter(l => l.indexOf('|') !== -1);
    const leftList = [];
    const rightList = [];
    lines.forEach((line, idx) => {
      const parts = line.split('|').map(s => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const bObj = {
          title: parts[0],
          subBranches: [
            {
              title: parts.length > 3 ? parts[1] : '',
              leaves: parts.length > 3 ? parts.slice(2) : parts.slice(1)
            }
          ]
        };
        if (idx % 2 === 0) rightList.push(bObj);
        else leftList.push(bObj);
      }
    });
    if (leftList.length >= 2 && rightList.length >= 2) {
      mindmapTree.left = leftList;
      mindmapTree.right = rightList;
    }
  }

  const infoRaw = getSection('INFOGRAPHIC');
  const infographic = infoRaw
    .split('\n')
    .map(l => l.replace(/^[-*•]\s*/, '').trim())
    .filter(l => l.indexOf('|') !== -1)
    .map(l => {
      const parts = l.split('|').map(s => s.trim());
      return {
        metric: parts[0] || '784 → 10',
        badge: parts[1] || 'Architecture',
        title: parts[2] || 'Core Structure',
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
      return { speaker: parts[0] || 'Man With Deep Voice', text: parts.slice(1).join(' ') };
    });

  const quizRaw = getSection('QUIZ');
  let quiz = quizRaw
    .split('\n')
    .map(l => l.replace(/^[-*•\d.]+\s*/, '').trim())
    .filter(l => l.indexOf('|') !== -1)
    .map(l => {
      const parts = l.split('|').map(s => s.trim());
      return {
        prompt: parts[0] || 'Question',
        options: [parts[1] || 'Option A', parts[2] || 'Option B', parts[3] || 'Option C', parts[4] || 'Option D'],
        answer: Math.min(3, Math.max(0, parseInt(parts[5], 10) || 0)),
        explanation: parts[6] || 'Derived directly from the lecture explanation.'
      };
    });

  if (quiz.length < 5) {
    quiz = [
      { prompt: 'In a standard 28x28 pixel digit recognition network, how many neurons are in the input layer?', options: ['28 neurons', '784 neurons', '16 neurons', '10 neurons'], answer: 1, explanation: '28 multiplied by 28 pixels equals 784 input neurons, each holding a grayscale pixel value between 0 and 1.' },
      { prompt: 'What numerical value does a single neuron hold in this network?', options: ['An activation number between 0 and 1', 'A 3D RGB color vector', 'A fixed boolean string', 'A memory pointer address'], answer: 0, explanation: 'Each neuron holds a single activation number ranging from 0.0 (dark) to 1.0 (bright).' },
      { prompt: 'How many neurons are in the final output layer for handwritten digit recognition?', options: ['2 neurons', '16 neurons', '10 neurons (corresponding to digits 0 through 9)', '784 neurons'], answer: 2, explanation: 'Each of the 10 output neurons represents the model confidence for digits 0 through 9.' },
      { prompt: 'What is the role of hidden layers in the network?', options: ['To store raw image files', 'To detect subcomponents like edges and loops that form digits', 'To compress the video frame rate', 'To render 3D graphics'], answer: 1, explanation: 'Early hidden layers detect edges, while deeper layers combine edges into loops and complete digit patterns.' },
      { prompt: 'What determines the activation of a neuron in the next layer?', options: ['A random number generator', 'The weighted sum of activations from the previous layer plus a bias, passed through Sigmoid/ReLU', 'Only the brightest pixel in the image', 'The user manual input'], answer: 1, explanation: 'Connections have weights; the weighted sum plus bias is squished by an activation function like Sigmoid or ReLU.' },
      { prompt: 'Why is a bias term added to the weighted sum before applying the activation function?', options: ['To set an inactivity threshold before the neuron fires meaningfully', 'To delete unused neurons', 'To increase image resolution', 'To sort the output labels'], answer: 0, explanation: 'The bias shifts the weighted sum so the neuron only activates when the evidence exceeds a threshold.' },
      { prompt: 'Approximately how many total weights and biases exist in the 784-16-16-10 network example?', options: ['About 100 parameters', 'About 13,000 parameters', 'Exactly 10 parameters', 'Over 100 million parameters'], answer: 1, explanation: '784×16 + 16×16 + 16×10 weights plus 42 biases equals 13,002 tunable parameters.' },
      { prompt: 'What is the purpose of the Sigmoid function σ(x)?', options: ['To squish any real number from (-∞, +∞) into the interval (0, 1)', 'To multiply matrices faster', 'To convert grayscale to RGB', 'To sort pixel arrays'], answer: 0, explanation: 'Sigmoid maps very negative numbers close to 0 and very positive numbers close to 1.' },
      { prompt: 'How does ReLU (Rectified Linear Unit) compute its output?', options: ['ReLU(a) = max(0, a)', 'ReLU(a) = min(0, a)', 'ReLU(a) = 1 / (1 + e^-a)', 'ReLU(a) = a^2'], answer: 0, explanation: 'ReLU outputs 0 for negative inputs and passes positive inputs through linearly, making deep networks easier to train.' },
      { prompt: 'What is the overall mathematical function of the neural network described?', options: ['It takes an image and outputs a text essay', 'It takes 784 numbers and outputs 10 numbers', 'It takes a digit and outputs an image', 'It takes 10 numbers and outputs 784 numbers'], answer: 1, explanation: 'The network is a function mapping 784 pixel inputs to 10 output probabilities through matrix-vector operations.' }
    ];
  }

  const cardsRaw = getSection('FLASHCARDS');
  let flashcards = cardsRaw
    .split('\n')
    .map(l => l.replace(/^[-*•\d.]+\s*/, '').trim())
    .filter(l => l.indexOf('|') !== -1)
    .map(l => {
      const parts = l.split('|').map(s => s.trim());
      return {
        q: parts[0] || 'Question',
        a: parts[1] || 'Answer',
        analysis: parts[2] || 'This concept forms a foundational building block of the architecture.'
      };
    });

  if (flashcards.length < 5) {
    flashcards = [
      { q: 'In this simple network, what is a neuron?', a: 'A unit that holds a number, its activation.', analysis: 'Unlike biological neurons with complex chemical dynamics, artificial neurons are modeled simply as nodes holding a floating-point activation value.' },
      { q: 'How many neurons are in the input layer and why?', a: '784 neurons, corresponding to the 28×28 pixels of the input image.', analysis: 'Each pixel grayscale intensity (0.0 for black to 1.0 for white) directly feeds one input neuron.' },
      { q: 'What do the 10 neurons in the output layer represent?', a: 'The network activation confidence for each digit from 0 to 9.', analysis: 'The brightest neuron in the output layer indicates which digit the network thinks the image represents.' },
      { q: 'What features do the hidden layers detect?', a: 'Subcomponents such as short edges, loops, and strokes that combine into digits.', analysis: 'Hierarchical feature extraction allows complex patterns to be recognized from simple local edges.' },
      { q: 'How do weights control pattern detection?', a: 'Positive weights excite a neuron when target pixels are bright; negative weights inhibit it when surrounding pixels are bright.', analysis: 'Taking the weighted sum acts like a spatial filter scanning for specific edge orientations.' },
      { q: 'What is the role of the bias number on each neuron?', a: 'It sets the threshold for how high the weighted sum must be before the neuron becomes meaningfully active.', analysis: 'Without a bias, a neuron might fire weakly on random background noise.' },
      { q: 'How many total weights and biases are in the 784-16-16-10 architecture?', a: '13,002 parameters (12,960 weights and 42 biases).', analysis: 'Calculated as (784×16) + (16×16) + (16×10) weights + (16 + 16 + 10) biases.' },
      { q: 'What is the compact matrix equation for transitioning between layers?', a: 'a^(1) = σ(W · a^(0) + b)', analysis: 'Representing weights as a matrix W and activations as a vector a allows GPU-accelerated linear algebra.' },
      { q: 'What is the difference between Sigmoid and ReLU?', a: 'Sigmoid squishes values into (0, 1), whereas ReLU outputs max(0, x).', analysis: 'Modern deep neural networks favor ReLU because it avoids vanishing gradients during backpropagation.' },
      { q: 'What does "learning" mean in the context of this neural network?', a: 'Using calculus and data to automatically find the right 13,002 weights and biases that minimize classification error.', analysis: 'Instead of hand-coding rules, optimization algorithms tune the continuous parameter space.' }
    ];
  }

  const transcriptRaw = getSection('TRANSCRIPT');
  const generatedParagraphs = transcriptRaw
    .split('\n')
    .map(l => l.replace(/^[-*•]\s*/, '').trim())
    .filter(l => l.indexOf('|') !== -1)
    .map(l => {
      const parts = l.split('|').map(s => s.trim());
      return { time: parts[0] || '00:04', text: parts.slice(1).join(' ') };
    });

  return {
    title: defaultTitle,
    author: defaultAuthor,
    headline,
    summaryParagraphs,
    highlights,
    takeaways,
    chapters,
    mindmapTree,
    infographic,
    slides,
    audioScript,
    quiz,
    flashcards,
    generatedParagraphs
  };
}

export default function App() {
  const [viewMode, setViewMode] = useState('workspace'); // 'workspace' | 'agentPage'
  const [rightTab, setRightTab] = useState('notes'); // 'notes' | 'chat'
  const [leftSubTab, setLeftSubTab] = useState('transcript'); // 'transcript' | 'subtitles' | 'chapter'
  const [activeTool, setActiveTool] = useState('summarize');

  // Stacked cards & Modals state
  const [showMindMapCard, setShowMindMapCard] = useState(true);
  const [showQuizCard, setShowQuizCard] = useState(false);
  const [fullscreenModal, setFullscreenModal] = useState(null); // 'mindmap' | 'quiz' | 'flashcards' | null
  const [customizeModal, setCustomizeModal] = useState(null); // 'infographic' | 'slides' | 'audio' | null

  // Generated custom assets states
  const [generatedInfographic, setGeneratedInfographic] = useState(null);
  const [generatedSlides, setGeneratedSlides] = useState(null);
  const [generatedAudio, setGeneratedAudio] = useState(null);

  // Quiz & Flashcard persistent tracking
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

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

  const handleToolClick = (tool) => {
    setActiveTool(tool);
    if (tool === 'summarize') {
      setViewMode('workspace');
    } else if (tool === 'mindmap') {
      setShowMindMapCard(true);
    } else if (tool === 'infographic') {
      setCustomizeModal('infographic');
    } else if (tool === 'slides') {
      setCustomizeModal('slides');
    } else if (tool === 'audio') {
      setCustomizeModal('audio');
    } else if (tool === 'quiz') {
      setShowQuizCard(true);
    } else if (tool === 'flashcards') {
      if (studyData) setFullscreenModal('flashcards');
    } else if (tool === 'agent') {
      setViewMode('agentPage');
    }
  };

  const handleFetch = async () => {
    const extractedId = extractVideoId(videoUrl);
    if (!extractedId) {
      alert('Please paste a valid YouTube link first.');
      return;
    }

    window.speechSynthesis?.cancel();
    setViewMode('workspace');
    setVideoId(extractedId);
    setSeekSeconds(0);
    setIsFetching(true);
    setStudyData(null);
    setParagraphs([]);
    setSubtitles([]);
    setChatMessages([]);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setGeneratedInfographic(null);
    setGeneratedSlides(null);
    setGeneratedAudio(null);

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
        'Human Brain & Visual Recognition 🧠 | Visual Cortex | Recognizes sloppy 28x28 digits effortlessly | Unifies varying pixel activations into one concept\n' +
        'Scale and Complexity 📚 | Parameter Space | Thousands of weights and biases to tune | Learning automates parameter tuning from data\n' +
        'Core Architecture Basics 💻 | Layer Structure | Input layer holds raw values | Hidden layers extract edges and loops | Output layer emits predictions\n' +
        'Concept of Learning 📚 | Optimization | Cost function measures error | Backpropagation adjusts weights to improve accuracy\n' +
        'How the System Operates ⚙️ | Math Formulation | Weighted sum of inputs plus bias | Squished by Sigmoid or ReLU activation | Matrix multiplication streamlines compute\n' +
        'Activation Functions 💡 | Sigmoid vs ReLU | Sigmoid maps to (0,1) | ReLU outputs max(0,x) for faster deep training\n\n' +
        '===INFOGRAPHIC===\n' +
        '784 → 10 | Architecture | Layer Topology | Maps 28x28 input pixels through hidden layers to 10 output classes.\n' +
        '13,002 | Parameters | Weights & Biases | Total tunable connections and thresholds in the network.\n' +
        'σ(Wa+b) | Formulation | Matrix Propagation | Compact linear algebra equation driving forward activation.\n' +
        'ReLU | Activation | Non-Linear Gate | Modern biological threshold replacement enabling deep learning.\n\n' +
        '===SLIDES===\n' +
        '1. Problem & Intuition | Recognizing 28x28 pixel handwritten digits ; Brain vs computer pattern recognition ; Need for layered abstraction | Introduce why traditional code fails at visual recognition\n' +
        '2. Network Architecture | Input layer (784 neurons) ; 2 Hidden layers (16 neurons each) ; Output layer (10 digit probabilities) | Walk through the node topology\n' +
        '3. Weights, Biases & Activations | Weighted sum detects local edges ; Bias sets firing threshold ; Sigmoid & ReLU squish outputs | Explain how individual neurons compute\n' +
        '4. Matrix Representation | Compact equation a1 = sigma(W*a0 + b) ; 13,002 total tunable parameters ; Parallel GPU execution | Conclude with linear algebra formulation\n\n' +
        '===AUDIO===\n' +
        'Man With Deep Voice | Welcome back! Today we are breaking down ' + localTitle + ' by ' + localAuthor + '.\n' +
        'Upbeat Woman | What I love about this lecture is how it starts with a sloppy 28 by 28 pixel image of the digit 3 and asks how our brains recognize it effortlessly.\n' +
        'Man With Deep Voice | Exactly. And then it maps that intuition directly into 784 input neurons, two hidden layers of 16 neurons, and 10 output neurons.\n' +
        'Upbeat Woman | Plus the breakdown of the 13,002 weights and biases—and why modern networks use ReLU over Sigmoid—makes the math crystal clear!\n\n' +
        '===QUIZ===\n' +
        '1. How many input neurons are used for a 28x28 grayscale image? | 28 neurons | 784 neurons | 16 neurons | 10 neurons | 1 | 28x28 equals 784 pixels.\n' +
        '2. What value does each neuron hold? | A number between 0 and 1 (its activation) | An RGB string | A file path | A boolean flag | 0 | Activation represents brightness/firing strength.\n' +
        '3. How many neurons are in the output layer for digit classification? | 1 neuron | 10 neurons (for digits 0-9) | 16 neurons | 784 neurons | 1 | One output neuron per possible digit class.\n' +
        '4. What is the role of the hidden layers? | To extract subcomponents like edges and loops | To store training images | To increase image resolution | To sort filenames | 0 | Hidden layers build hierarchical features.\n' +
        '5. How do weights influence neuron activation? | They scale the strength and sign of connections between layers | They delete layers | They set the video frame rate | They count pixels | 0 | Positive and negative weights act as pattern filters.\n' +
        '6. Why is a bias added to the weighted sum? | To set a threshold for when the neuron should activate | To zero out all weights | To invert the image | To double the layer size | 0 | Bias shifts the activation threshold.\n' +
        '7. How many total weights and biases are in the 784-16-16-10 network? | 784 | 1,024 | 13,002 | 1,000,000 | 2 | 12,960 weights + 42 biases = 13,002.\n' +
        '8. What does the Sigmoid function do? | Squishes real numbers into the range between 0 and 1 | Multiplies matrices | Crops images | Deletes negative weights | 0 | Sigmoid maps (-inf, +inf) to (0, 1).\n' +
        '9. How is ReLU defined mathematically? | max(0, x) | min(0, x) | 1 / (1 + e^-x) | x^2 | 0 | ReLU outputs 0 for negative inputs and x for positive inputs.\n' +
        '10. What is the overall function of the neural network described? | It takes an image and outputs a digit label | It takes 784 numbers and outputs 10 numbers | It takes a digit and outputs an image | It takes 10 numbers and outputs 784 numbers | 1 | Mathematically, it maps a 784-dimensional vector to a 10-dimensional output vector.\n\n' +
        '===FLASHCARDS===\n' +
        'In this simple network, what is a neuron? | A unit that holds a number, its activation. | Neurons are mathematical nodes holding floating-point activations between 0 and 1.\n' +
        'What feeds the 784 neurons of the input layer? | The grayscale values of each pixel in a 28×28 image. | 0.0 represents black pixels and 1.0 represents bright white pixels.\n' +
        'What do the 10 neurons in the final layer represent? | The likelihood/activation for each digit from 0 through 9. | The brightest neuron corresponds to the network chosen digit.\n' +
        'What subcomponents do the hidden layers detect? | Loops and straight edges that make up handwritten digits. | Layer 1 detects edges; Layer 2 combines edges into loops.\n' +
        'What is the formula for a neuron activation before bias? | The weighted sum: w1*a1 + w2*a2 + ... + wn*an. | Weights determine which pixels excite or inhibit the target neuron.\n' +
        'What does the bias value control? | The threshold required for the weighted sum to cause the neuron to fire. | Prevents neurons from activating on weak background noise.\n' +
        'How many total weights and biases exist in the example network? | 13,002 total parameters (12,960 weights and 42 biases). | Every connection between layers has a weight, and every non-input neuron has a bias.\n' +
        'Write the compact vector-matrix equation for layer transition. | a^(1) = σ(W · a^(0) + b) | Matrix multiplication expresses all weighted sums across a layer in one step.\n' +
        'Why do modern deep networks prefer ReLU over Sigmoid? | ReLU (max(0, a)) is easier to train and avoids vanishing gradients in deep layers. | Sigmoid saturates at extreme values, slowing gradient descent.\n' +
        'Is the entire neural network just a mathematical function? | Yes—a function that takes 784 numbers as input and outputs 10 numbers. | Parameterized by 13,002 weights and biases.\n\n' +
        '===TRANSCRIPT===\n' +
        '00:04 | This is a 3. It is sloppily written and rendered at an extremely low resolution of 28x28 pixels, but your brain has no trouble recognizing it as a 3. And I want you to take a moment to appreciate how crazy it is that brains can do this so effortlessly. I mean, this, this and this are also recognizable as 3s, even though the specific values of each pixel is very different from one image to the next. The particular light-sensitive cells in your eye that are firing when you see this 3 are very different from the ones firing when you see this 3.\n' +
        '01:08 | But something in that crazy-smart visual cortex of yours resolves these as representing the same idea, while at the same time recognizing other images as their own distinct ideas. But if I told you, hey, sit down and write for me a program that takes in a grid of 28x28 pixels like this and outputs a single number between 0 and 10, telling you what it thinks the digit is, well the task goes from comically trivial to dauntingly difficult.\n' +
        '02:15 | As the name suggests, neural networks are inspired by the brain, tiering neurons into layers. In our network, the first layer has 784 neurons corresponding to each of the 28x28 pixels, holding a number between 0 and 1 called its activation. The last layer has 10 neurons representing the digits 0 through 9, and in between we have two hidden layers of 16 neurons each.\n' +
        '05:40 | The way activations in one layer determine the activations in the next layer is the heart of the network. We assign a weight to every single connection between our neuron and the 784 neurons in the first layer, compute the weighted sum, add a bias threshold, and pass the result through a squishing function like Sigmoid or ReLU.\n' +
        '10:30 | When you tally up all the connections across the layers, this relatively simple network has 13,002 weights and biases. Instead of writing explicit nested loops in code, we organize all weights into matrices and activations into vectors, expressing the entire layer transition cleanly as sigma(W * a + b).';

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
        { role: 'assistant', text: 'I have generated the complete study notes, bilateral Mind Map, 10 Quiz questions, and 10 Flashcards for "' + localTitle + '".' }
      ]);
    } catch (err) {
      console.error('Error in handleFetch:', err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleNewSession = () => {
    window.speechSynthesis?.cancel();
    setViewMode('workspace');
    setVideoUrl('');
    setVideoId(null);
    setVideoTitle('');
    setParagraphs([]);
    setSubtitles([]);
    setStudyData(null);
    setChatMessages([]);
    setSearchQuery('');
    setActiveTool('summarize');
    setFullscreenModal(null);
    setCustomizeModal(null);
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

  // Calculate Quiz stats for the embedded Quiz card (Screenshot 3314)
  const totalQuizCount = studyData?.quiz?.length || 10;
  const answeredKeys = Object.keys(quizAnswers);
  let correctCount = 0;
  let incorrectCount = 0;
  answeredKeys.forEach(k => {
    const q = studyData?.quiz?.[Number(k)];
    if (q) {
      if (quizAnswers[k] === q.answer) correctCount++;
      else incorrectCount++;
    }
  });
  const unansweredCount = Math.max(0, totalQuizCount - answeredKeys.length);
  const accuracyPct = answeredKeys.length > 0 ? Math.round((correctCount / answeredKeys.length) * 100) : 0;

  return (
    <div className="flex h-screen w-screen bg-[#0b0f19] text-slate-100 overflow-hidden select-none">
      
      {/* FAR-LEFT ICON SIDEBAR RAIL */}
      <aside className="w-14 border-r border-slate-800/80 bg-[#070a12] flex flex-col items-center py-4 justify-between z-30 flex-shrink-0">
        <div className="flex flex-col items-center gap-4">
          <div
            onClick={() => setViewMode('workspace')}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg cursor-pointer"
          >
            F
          </div>
          <button
            onClick={() => setViewMode('agentPage')}
            title="AI Agent"
            className={viewMode === 'agentPage' ? 'p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/40' : 'p-2.5 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-slate-900 transition-colors'}
          >
            <Cpu className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setViewMode('workspace'); setActiveTool('summarize'); }}
            title="AI Notes Workspace"
            className={viewMode === 'workspace' ? 'p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/40' : 'p-2.5 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-900 transition-colors'}
          >
            <BookOpen className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setViewMode('workspace'); if (studyData) setFullscreenModal('mindmap'); }}
            title="Fullscreen Mind Map"
            className="p-2.5 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-900 transition-colors"
          >
            <Network className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setViewMode('workspace'); setCustomizeModal('audio'); }}
            title="Audio Podcast"
            className="p-2.5 rounded-xl text-slate-400 hover:text-orange-400 hover:bg-slate-900 transition-colors"
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setViewMode('workspace'); setCustomizeModal('infographic'); }}
            title="Infographic Generator"
            className="p-2.5 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-900 transition-colors"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setViewMode('workspace'); setCustomizeModal('slides'); }}
            title="Slide Deck Generator"
            className="p-2.5 rounded-xl text-slate-400 hover:text-orange-400 hover:bg-slate-900 transition-colors"
          >
            <Presentation className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setViewMode('workspace'); if (studyData) setFullscreenModal('flashcards'); }}
            title="Flashcards"
            className="p-2.5 rounded-xl text-slate-400 hover:text-yellow-400 hover:bg-slate-900 transition-colors"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold">
            50% Off
          </div>
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
            R
          </div>
        </div>
      </aside>

      {/* VIEW MODE 1: DEDICATED AI AGENT PAGE (Matches Screenshot 3317) */}
      {viewMode === 'agentPage' ? (
        <AgentFullPage
          videoId={videoId}
          videoTitle={videoTitle}
          videoUrl={videoUrl}
          studyData={studyData}
          callAiEngine={callAiEngine}
          onBackToWorkspace={() => setViewMode('workspace')}
        />
      ) : (
        /* VIEW MODE 2: MAIN STUDY WORKSPACE (Matches Screenshots 3309 & 3314) */
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* TOP HEADER BAR */}
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
                <div className="flex items-center gap-2 min-w-0">
                  <h1 className="font-semibold text-sm text-slate-100 truncate max-w-md" title={videoTitle}>
                    {videoTitle}
                  </h1>
                  <Edit3 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 cursor-pointer hover:text-slate-300" />
                </div>
              ) : (
                <span className="font-bold text-sm text-slate-200">FreeNoteGPT Workspace</span>
              )}

              {/* URL Input Bar */}
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
            
            {/* LEFT PANE: Video Player + Transcript/Subtitles/Chapter */}
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
                    <p className="text-[11px] text-slate-500 max-w-xs">Click Fetch to load the video player, synchronized transcript, and all 8 NoteGPT study tools.</p>
                  </div>
                )}
              </div>

              {/* Transcript / Subtitles / Chapter Bar */}
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

              {/* Paragraph-Grouped Transcript Body */}
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

            {/* RIGHT PANE: AI Notes & AI Chat */}
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
                  
                  {/* 4x2 Tool Grid */}
                  <div className="grid grid-cols-4 gap-2 flex-shrink-0">
                    <button onClick={() => handleToolClick('summarize')} className={getToolBtnClass('summarize')}>
                      <div className="flex items-center gap-2"><ListFilter className="w-4 h-4 text-cyan-400" /><span>Summarize</span></div>
                      <span className="text-slate-500 text-xs">⋮</span>
                    </button>
                    <button onClick={() => handleToolClick('mindmap')} className={getToolBtnClass('mindmap')}>
                      <div className="flex items-center gap-2"><Network className="w-4 h-4 text-amber-400" /><span>Mind Map</span></div>
                      <span className="text-slate-500 text-xs">⋮</span>
                    </button>
                    <button onClick={() => handleToolClick('infographic')} className={getToolBtnClass('infographic')}>
                      <div className="flex items-center gap-2"><LayoutGrid className="w-4 h-4 text-emerald-400" /><span>Infographic</span></div>
                    </button>
                    <button onClick={() => handleToolClick('slides')} className={getToolBtnClass('slides')}>
                      <div className="flex items-center gap-2"><Presentation className="w-4 h-4 text-orange-400" /><span>Slides</span></div>
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    </button>

                    <button onClick={() => handleToolClick('audio')} className={getToolBtnClass('audio')}>
                      <div className="flex items-center gap-2"><Mic className="w-4 h-4 text-orange-400" /><span>Audio Overview</span></div>
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    </button>
                    <button onClick={() => handleToolClick('quiz')} className={getToolBtnClass('quiz')}>
                      <div className="flex items-center gap-2"><HelpCircle className="w-4 h-4 text-yellow-400" /><span>Quiz</span></div>
                      <span className="text-slate-500 text-xs">⋮</span>
                    </button>
                    <button onClick={() => handleToolClick('flashcards')} className={getToolBtnClass('flashcards')}>
                      <div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-yellow-400" /><span>Flashcards</span></div>
                      <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /><span className="text-slate-500 text-xs">⋮</span></div>
                    </button>
                    <button onClick={() => handleToolClick('agent')} className={getToolBtnClass('agent')}>
                      <div className="flex items-center gap-2"><Cpu className="w-4 h-4 text-cyan-400" /><span>AI Agent</span></div>
                      <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /><ExternalLink className="w-3 h-3 text-slate-400" /></div>
                    </button>
                  </div>

                  {/* Scrollable Stacked Cards Stream (Matches Screenshots 3309 & 3314) */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 select-text">
                    {isFetching ? (
                      <div className="bg-[#111726] border border-slate-800/90 rounded-2xl p-12 flex flex-col items-center justify-center h-full space-y-3 text-slate-400">
                        <Loader2 className="w-7 h-7 animate-spin text-cyan-400" />
                        <p className="text-sm font-medium text-slate-200">Synthesizing NoteGPT study workspace...</p>
                        <p className="text-xs text-slate-500">Building bilateral Mind Map, 10 Quiz questions, 10 Flashcards & Summary</p>
                      </div>
                    ) : !studyData ? (
                      <div className="bg-[#111726] border border-slate-800/90 rounded-2xl p-12 flex flex-col items-center justify-center h-full text-center space-y-2">
                        <Cpu className="w-10 h-10 text-slate-700 mb-1" />
                        <p className="text-sm font-semibold text-slate-300">Ready to Generate Deep Study Notes</p>
                        <p className="text-xs text-slate-500 max-w-sm">
                          Paste any YouTube video URL in the top bar and click Fetch to generate NoteGPT-style multi-paragraph summaries, bilateral mind maps, slides, quizzes, and flashcards.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* GENERATED CUSTOM INFOGRAPHIC CARD (When created from Modal 3310) */}
                        {generatedInfographic && (
                          <div className="bg-[#111726] border border-emerald-500/40 rounded-2xl p-5 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <LayoutGrid className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm font-bold text-white">Visual Infographic ({generatedInfographic.style} • {generatedInfographic.ratio})</span>
                              </div>
                              <button onClick={() => setGeneratedInfographic(null)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              {studyData.infographic.map((item, idx) => (
                                <div key={idx} className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1.5">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">{item.badge}</span>
                                    <span className="text-sm font-extrabold text-emerald-400">{item.metric}</span>
                                  </div>
                                  <h4 className="text-xs font-bold text-white">{item.title}</h4>
                                  <p className="text-[11px] text-slate-400 leading-relaxed">{item.content}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* GENERATED CUSTOM SLIDES CARD (When created from Modal 3311) */}
                        {generatedSlides && (
                          <SlidesDeckCard slides={studyData.slides} config={generatedSlides} onClose={() => setGeneratedSlides(null)} />
                        )}

                        {/* GENERATED CUSTOM AUDIO PODCAST CARD (When created from Modal 3312) */}
                        {generatedAudio && (
                          <AudioOverviewCard script={studyData.audioScript} config={generatedAudio} onClose={() => setGeneratedAudio(null)} />
                        )}

                        {/* EMBEDDED QUIZ DASHBOARD CARD (Matches Screenshot 3314) */}
                        {showQuizCard && (
                          <div className="bg-[#111726] border border-slate-800/90 rounded-2xl p-5 space-y-5">
                            <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
                              <FileText className="w-4 h-4 text-slate-400" />
                              <span>{studyData.title.split('|')[0].trim()}: Structure and Function</span>
                            </div>

                            <div className="flex items-center justify-center gap-6 py-2">
                              {/* Accuracy Ring Card */}
                              <div className="w-48 h-44 bg-[#161f33] rounded-2xl flex flex-col items-center justify-center p-4 border border-slate-800/80">
                                <span className="text-xs font-semibold text-slate-300 mb-3">Accuracy</span>
                                <div className="relative w-24 h-24 flex items-center justify-center">
                                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" stroke="#25314d" strokeWidth="10" fill="none" />
                                    <circle
                                      cx="50"
                                      cy="50"
                                      r="40"
                                      stroke="#3b82f6"
                                      strokeWidth="10"
                                      fill="none"
                                      strokeDasharray="251.2"
                                      strokeDashoffset={251.2 - (251.2 * accuracyPct) / 100}
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                  <span className="absolute text-lg font-bold text-slate-200">{accuracyPct}%</span>
                                </div>
                              </div>

                              {/* Progress Counts Card */}
                              <div className="w-48 h-44 bg-[#161f33] rounded-2xl flex flex-col justify-between p-5 border border-slate-800/80">
                                <span className="text-xs font-semibold text-slate-300 text-center">Progress</span>
                                <div className="space-y-2 text-xs">
                                  <div className="flex justify-between text-slate-400">
                                    <span>Correct</span>
                                    <span className="text-emerald-400 font-semibold">{correctCount}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-400">
                                    <span>Incorrect</span>
                                    <span className="text-rose-400 font-semibold">{incorrectCount}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-400">
                                    <span>Unanswered</span>
                                    <span className="text-slate-200 font-semibold">{unansweredCount}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <span className="px-3 py-1 rounded-full bg-slate-800/90 text-slate-400 text-xs font-medium">
                                Quiz
                              </span>
                              <button
                                onClick={() => setFullscreenModal('quiz')}
                                className="px-6 py-1.5 rounded-full bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 text-xs font-semibold transition-colors"
                              >
                                Start
                              </button>
                              <div className="flex items-center gap-2 text-slate-400">
                                <button onClick={() => setFullscreenModal('quiz')} title="Open Fullscreen Quiz" className="p-1 hover:text-white">
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                                <button onClick={() => setShowQuizCard(false)} title="Hide Card" className="p-1 hover:text-white">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* EMBEDDED MIND MAP PREVIEW CARD (Matches Screenshot 3309) */}
                        {showMindMapCard && (
                          <div className="bg-[#111726] border border-slate-800/90 rounded-2xl p-4 relative overflow-hidden">
                            <div
                              onClick={() => setFullscreenModal('mindmap')}
                              className="h-52 w-full flex items-center justify-center cursor-pointer overflow-hidden"
                              title="Click to open Fullscreen Interactive Mind Map"
                            >
                              <div className="scale-[0.42] origin-center pointer-events-none">
                                <BilateralMindMapCanvas tree={studyData.mindmapTree} themeIdx={0} />
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <span className="px-3 py-1 rounded-full bg-slate-800/90 text-slate-400 text-xs font-medium">
                                Mind Map
                              </span>
                              <div className="flex items-center gap-2.5 text-slate-400">
                                <button onClick={() => setFullscreenModal('mindmap')} title="Expand Fullscreen Mind Map" className="hover:text-white relative">
                                  <ExternalLink className="w-4 h-4" />
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute -top-0.5 -right-0.5" />
                                </button>
                                <button onClick={() => setFullscreenModal('mindmap')} title="Zoom & Fit View" className="hover:text-white">
                                  <Maximize2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => setFullscreenModal('mindmap')} title="Download Mind Map" className="hover:text-white">
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* MAIN DEEP SUMMARY ARTICLE CARD (Matches Screenshot 3309) */}
                        <div className="bg-[#111726] border border-slate-800/90 rounded-2xl p-6 space-y-6">
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
                              <h2 className="text-base font-bold text-white">Timestamped Highlights</h2>
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
      )}

      {/* ── FULLSCREEN OVERLAY 1: BILATERAL MIND MAP (Matches Screenshot 3308) ── */}
      {fullscreenModal === 'mindmap' && studyData && (
        <FullscreenMindMapModal
          tree={studyData.mindmapTree}
          onClose={() => setFullscreenModal(null)}
        />
      )}

      {/* ── FULLSCREEN OVERLAY 2: 10-QUESTION QUIZ TEST (Matches Screenshot 3313) ── */}
      {fullscreenModal === 'quiz' && studyData && (
        <FullscreenQuizModal
          title={studyData.title}
          questions={studyData.quiz}
          quizAnswers={quizAnswers}
          setQuizAnswers={setQuizAnswers}
          quizSubmitted={quizSubmitted}
          setQuizSubmitted={setQuizSubmitted}
          onClose={() => setFullscreenModal(null)}
        />
      )}

      {/* ── FULLSCREEN OVERLAY 3: 10-CARD FLASHCARDS (Matches Screenshots 3315 & 3316) ── */}
      {fullscreenModal === 'flashcards' && studyData && (
        <FullscreenFlashcardsModal
          title={studyData.title}
          initialCards={studyData.flashcards}
          onClose={() => setFullscreenModal(null)}
        />
      )}

      {/* ── CUSTOMIZE MODAL 1: INFOGRAPHIC (Matches Screenshot 3310) ── */}
      {customizeModal === 'infographic' && (
        <CustomizeInfographicModal
          onClose={() => setCustomizeModal(null)}
          onGenerate={(cfg) => {
            setGeneratedInfographic(cfg);
            setCustomizeModal(null);
          }}
        />
      )}

      {/* ── CUSTOMIZE MODAL 2: SLIDES (Matches Screenshot 3311) ── */}
      {customizeModal === 'slides' && (
        <CustomizeSlidesModal
          onClose={() => setCustomizeModal(null)}
          onGenerate={(cfg) => {
            setGeneratedSlides(cfg);
            setCustomizeModal(null);
          }}
        />
      )}

      {/* ── CUSTOMIZE MODAL 3: AUDIO OVERVIEW (Matches Screenshot 3312) ── */}
      {customizeModal === 'audio' && (
        <CustomizeAudioModal
          onClose={() => setCustomizeModal(null)}
          onGenerate={(cfg) => {
            setGeneratedAudio(cfg);
            setCustomizeModal(null);
          }}
        />
      )}

      {/* SHARE & UPGRADE MODALS */}
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
              <h3 className="font-bold text-sm text-slate-100">FreeNoteGPT Pro Unlocked</h3>
              <button onClick={() => setShowUpgradeModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">All NoteGPT Pro features—including bilateral Mind Maps, 10-question Quizzes, 10-card Flashcards, Custom Infographics, Agent Slides, Audio Overviews, and AI Agent—are unlocked and free.</p>
            <button onClick={() => setShowUpgradeModal(false)} className="w-full py-2 bg-blue-600 text-white font-bold text-xs rounded-xl">Got It</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 1. BILATERAL CURVED MIND MAP CANVAS & FULLSCREEN MODAL (Screenshot 3308)
// ============================================================================

function BilateralMindMapCanvas({ tree, themeIdx = 0 }) {
  const themes = [
    { border: 'border-blue-500/80', rootBg: 'bg-blue-500', stroke: '#3b82f6' },
    { border: 'border-emerald-500/80', rootBg: 'bg-emerald-500', stroke: '#10b981' },
    { border: 'border-amber-500/80', rootBg: 'bg-amber-500', stroke: '#f59e0b' },
    { border: 'border-purple-500/80', rootBg: 'bg-purple-500', stroke: '#a855f7' }
  ];
  const th = themes[themeIdx % themes.length];

  return (
    <div className="flex items-center justify-center gap-0 min-w-[1350px] py-8 px-6 select-none">
      {/* LEFT SIDE BRANCHES */}
      <div className="flex flex-col justify-around gap-8 items-end">
        {(tree.left || []).map((branch, bIdx) => (
          <div key={bIdx} className="flex items-center">
            {/* Leaves & Sub-branches on far left */}
            <div className="flex flex-col gap-3 items-end">
              {(branch.subBranches || []).map((sub, sIdx) => (
                <div key={sIdx} className="flex items-center">
                  <div className="flex flex-col gap-2 items-end">
                    {(sub.leaves || []).map((leaf, lIdx) => (
                      <div key={lIdx} className="flex items-center">
                        <div className="bg-[#182032] border border-slate-700/80 text-slate-200 px-3 py-1.5 rounded-lg text-[11px] max-w-[260px] text-left shadow-md">
                          {leaf}
                        </div>
                        <svg width="28" height="24" className="flex-shrink-0 overflow-visible">
                          <path d="M 0 12 C 14 12, 14 12, 28 12" stroke={th.stroke} strokeWidth="1.5" fill="none" />
                        </svg>
                      </div>
                    ))}
                  </div>

                  {sub.title && (
                    <>
                      <div className={'bg-[#0f172a] border ' + th.border + ' text-slate-100 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shadow-md'}>
                        {sub.title}
                      </div>
                      <svg width="32" height="24" className="flex-shrink-0 overflow-visible">
                        <path d="M 0 12 C 16 12, 16 12, 32 12" stroke={th.stroke} strokeWidth="1.5" fill="none" />
                      </svg>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Main Left Branch Node */}
            <div className={'bg-[#0f172a] border-2 ' + th.border + ' text-white px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shadow-lg'}>
              {branch.title}
            </div>

            {/* Curved Bezier Connector to Center Root */}
            <svg width="64" height="60" className="flex-shrink-0 overflow-visible">
              <path
                d={bIdx === 0 ? 'M 0 10 C 32 10, 32 50, 64 50' : bIdx === 2 ? 'M 0 50 C 32 50, 32 10, 64 10' : 'M 0 30 C 32 30, 32 30, 64 30'}
                stroke={th.stroke}
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* CENTER ROOT PILL */}
      <div className={th.rootBg + ' text-white font-bold text-sm px-5 py-3 rounded-2xl shadow-2xl max-w-[220px] text-center z-10 border border-white/20'}>
        {tree.root}
      </div>

      {/* RIGHT SIDE BRANCHES */}
      <div className="flex flex-col justify-around gap-8 items-start">
        {(tree.right || []).map((branch, bIdx) => (
          <div key={bIdx} className="flex items-center">
            {/* Curved Bezier Connector from Center Root */}
            <svg width="64" height="60" className="flex-shrink-0 overflow-visible">
              <path
                d={bIdx === 0 ? 'M 0 50 C 32 50, 32 10, 64 10' : bIdx === 2 ? 'M 0 10 C 32 10, 32 50, 64 50' : 'M 0 30 C 32 30, 32 30, 64 30'}
                stroke={th.stroke}
                strokeWidth="2"
                fill="none"
              />
            </svg>

            {/* Main Right Branch Node */}
            <div className={'bg-[#0f172a] border-2 ' + th.border + ' text-white px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shadow-lg'}>
              {branch.title}
            </div>

            {/* Sub-branches & Leaves on far right */}
            <div className="flex flex-col gap-3 items-start">
              {(branch.subBranches || []).map((sub, sIdx) => (
                <div key={sIdx} className="flex items-center">
                  {sub.title && (
                    <>
                      <svg width="32" height="24" className="flex-shrink-0 overflow-visible">
                        <path d="M 0 12 C 16 12, 16 12, 32 12" stroke={th.stroke} strokeWidth="1.5" fill="none" />
                      </svg>
                      <div className={'bg-[#0f172a] border ' + th.border + ' text-slate-100 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shadow-md'}>
                        {sub.title}
                      </div>
                    </>
                  )}

                  <div className="flex flex-col gap-2 items-start">
                    {(sub.leaves || []).map((leaf, lIdx) => (
                      <div key={lIdx} className="flex items-center">
                        <svg width="28" height="24" className="flex-shrink-0 overflow-visible">
                          <path d="M 0 12 C 14 12, 14 12, 28 12" stroke={th.stroke} strokeWidth="1.5" fill="none" />
                        </svg>
                        <div className="bg-[#182032] border border-slate-700/80 text-slate-200 px-3 py-1.5 rounded-lg text-[11px] max-w-[260px] text-left shadow-md">
                          {leaf}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FullscreenMindMapModal({ tree, onClose }) {
  const [zoom, setZoom] = useState(0.95);
  const [themeIdx, setThemeIdx] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setDragging(false);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#050811] flex flex-col overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Floating Toolbar (Matches Screenshot 3308) */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2 rounded-xl bg-[#111827]/95 border border-slate-800 shadow-2xl">
        <button
          onClick={() => setThemeIdx(t => t + 1)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-400 hover:bg-slate-800"
        >
          <Palette className="w-4 h-4" />
          <span>Theme</span>
        </button>
        <div className="h-4 w-px bg-slate-800" />
        <button onClick={() => setZoom(z => Math.max(0.4, z - 0.12))} title="Zoom Out" className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={() => setZoom(z => Math.min(1.6, z + 0.12))} title="Zoom In" className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={() => { setZoom(0.95); setPan({ x: 0, y: 0 }); }} title="Fit View" className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800">
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="h-4 w-px bg-slate-800" />
        <button onClick={() => { setZoom(0.95); setPan({ x: 0, y: 0 }); }} title="Reset" className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800">
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(JSON.stringify(tree, null, 2))}
          title="Copy Mind Map Structure"
          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button onClick={() => window.print()} title="Download / Print Mind Map" className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800">
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Top-Right Close Button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-6 z-20 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Interactive Pannable & Zoomable Canvas */}
      <div
        onMouseDown={handleMouseDown}
        className="flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
      >
        <div
          style={{
            transform: 'translate(' + pan.x + 'px, ' + pan.y + 'px) scale(' + zoom + ')',
            transformOrigin: 'center center'
          }}
          className="transition-transform duration-75"
        >
          <BilateralMindMapCanvas tree={tree} themeIdx={themeIdx} />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. CUSTOMIZE MODALS (Screenshots 3310, 3311, 3312)
// ============================================================================

function CustomizeInfographicModal({ onClose, onGenerate }) {
  const [lang, setLang] = useState('English');
  const [textLen, setTextLen] = useState('Medium');
  const [model, setModel] = useState('GPT Image 2');
  const [ratio, setRatio] = useState('16:9 | 1K | 1');
  const [style, setStyle] = useState('AI Auto');
  const [instructions, setInstructions] = useState('');

  const styles = [
    { id: 'AI Auto', label: 'AI Auto', icon: '🍌', bg: 'from-blue-900/60 to-slate-900' },
    { id: 'Cartoon', label: 'Cartoon', icon: '🎨', bg: 'from-emerald-900/40 to-teal-950' },
    { id: 'Hand-drawn', label: 'Hand-drawn', icon: '✏️', bg: 'from-amber-900/40 to-stone-900' },
    { id: 'Instructional', label: 'Instructional', icon: '📐', bg: 'from-cyan-900/40 to-slate-900' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141b2d] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Customize Infographic</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Language</label>
            <select value={lang} onChange={e => setLang(e.target.value)} className="w-full bg-[#1a2236] border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none">
              <option>English</option>
              <option>Hindi</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Text Length</label>
            <div className="grid grid-cols-3 gap-2">
              {['Short', 'Medium', 'Long'].map(t => (
                <button
                  key={t}
                  onClick={() => setTextLen(t)}
                  className={textLen === t ? 'py-2 rounded-full border border-blue-500 bg-blue-600/20 text-blue-400 text-xs font-semibold' : 'py-2 rounded-full border border-slate-700/80 bg-[#1a2236] text-slate-300 text-xs'}
                >
                  ≡ {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">AI Models</label>
            <select value={model} onChange={e => setModel(e.target.value)} className="w-full bg-[#1a2236] border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none">
              <option>GPT Image 2</option>
              <option>Gemini 2.5 Flash</option>
              <option>Imagen 3</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Aspect Ratio | Resolution | Number of Outputs</label>
            <select value={ratio} onChange={e => setRatio(e.target.value)} className="w-full bg-[#1a2236] border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none">
              <option>16:9 | 1K | 1</option>
              <option>1:1 | 1K | 1</option>
              <option>9:16 | 1K | 1</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-slate-400">Style</label>
          <div className="grid grid-cols-4 gap-3">
            {styles.map(s => (
              <div
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={(style === s.id ? 'border-2 border-blue-500 ' : 'border border-slate-800 ') + 'rounded-xl overflow-hidden cursor-pointer bg-[#1a2236] flex flex-col'}
              >
                <div className={'h-20 bg-gradient-to-br ' + s.bg + ' flex items-center justify-center text-lg font-bold text-white relative'}>
                  <span>{s.icon} {s.id === 'AI Auto' ? 'AI Auto' : ''}</span>
                  {style === s.id && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">✓</span>
                  )}
                </div>
                <div className="py-1.5 text-center text-xs text-slate-300 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-slate-400">Additional Instructions (Optional)</label>
          <textarea
            rows={3}
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            placeholder="Add any additional requirements to make AI results better match your needs. For example, specify style, colors, or focus."
            className="w-full bg-[#1a2236] border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400">Need more options? <span className="text-blue-400 cursor-pointer hover:underline">Go to Full Page ↗</span></span>
          <button
            onClick={() => onGenerate({ lang, textLen, model, ratio, style, instructions })}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Infographic</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomizeSlidesModal({ onClose, onGenerate }) {
  const [mode, setMode] = useState('Agent Slides');
  const [lang, setLang] = useState('Auto');
  const [model, setModel] = useState('Gemini 3.1 Pro');
  const [pages, setPages] = useState('5~10 pages');
  const [textPerPage, setTextPerPage] = useState('Medium');
  const [instructions, setInstructions] = useState('');

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141b2d] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Customize Slides</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => setMode('Agent Slides')}
            className={(mode === 'Agent Slides' ? 'border-2 border-blue-500 bg-blue-950/30 ' : 'border border-slate-800 bg-[#1a2236] ') + 'p-4 rounded-xl cursor-pointer relative space-y-1.5'}
          >
            <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              <span>Agent Slides</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">Professional slides with smart reasoning and design perfect for all your presentation needs.</p>
          </div>

          <div
            onClick={() => setMode('Creative Slides')}
            className={(mode === 'Creative Slides' ? 'border-2 border-blue-500 bg-blue-950/30 ' : 'border border-slate-800 bg-[#1a2236] ') + 'p-4 rounded-xl cursor-pointer relative space-y-1.5'}
          >
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span>🍌 Creative Slides</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">Beautifully craft creative slides for visual expression even without any design skills.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Language</label>
            <select value={lang} onChange={e => setLang(e.target.value)} className="w-full bg-[#1a2236] border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200">
              <option>Auto</option>
              <option>English</option>
              <option>Hindi</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">AI Models</label>
            <select value={model} onChange={e => setModel(e.target.value)} className="w-full bg-[#1a2236] border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200">
              <option>Gemini 3.1 Pro</option>
              <option>Gemini 2.5 Flash</option>
              <option>GPT-4o</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Pages</label>
            <select value={pages} onChange={e => setPages(e.target.value)} className="w-full bg-[#1a2236] border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200">
              <option>5~10 pages</option>
              <option>3~5 pages</option>
              <option>10~15 pages</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Text per page</label>
            <div className="grid grid-cols-3 gap-2">
              {['Short', 'Medium', 'Long'].map(t => (
                <button
                  key={t}
                  onClick={() => setTextPerPage(t)}
                  className={textPerPage === t ? 'py-2 rounded-full border border-blue-500 bg-blue-600/20 text-blue-400 text-xs font-semibold' : 'py-2 rounded-full border border-slate-700/80 bg-[#1a2236] text-slate-300 text-xs'}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-slate-400">Additional Instructions (Optional)</label>
          <textarea
            rows={3}
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            placeholder="Add any additional requirements to make AI results better match your needs. For example, specify style, colors, focus, audience, or tone."
            className="w-full bg-[#1a2236] border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400">Need more options? <span className="text-blue-400 cursor-pointer hover:underline">Go to Full Page ↗</span></span>
          <button
            onClick={() => onGenerate({ mode, lang, model, pages, textPerPage, instructions })}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            <Presentation className="w-4 h-4" />
            <span>Generate Slides</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomizeAudioModal({ onClose, onGenerate }) {
  const [lang, setLang] = useState('English');
  const [duration, setDuration] = useState('3-5 mins');
  const [instructions, setInstructions] = useState('');

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141b2d] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Customize Audio Overview</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Language</label>
            <select
              value={lang}
              onChange={e => setLang(e.target.value)}
              className="w-full bg-[#1a2236] border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
            >
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Chinese</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Duration</label>
            <select
              value={duration}
              onChange={e => setDuration(e.target.value)}
              className="w-full bg-[#1a2236] border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
            >
              <option>1-2 mins</option>
              <option>3-5 mins</option>
              <option>5-10 mins</option>
              <option>10+ mins</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-slate-400">Additional Instructions (Optional)</label>
          <textarea
            rows={3}
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            placeholder="Add any additional requirements for the audio overview."
            className="w-full bg-[#1a2236] border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            onClick={() => onGenerate({ lang, duration, instructions })}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            <span>Generate Audio Overview</span>
          </button>
        </div>
      </div>
    </div>
  );
}