const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

const nav = $(".navbar");
const navToggle = $(".nav-toggle");
const navLinks = $(".nav-links");
const cursor = $(".cursor-dot");
const themeToggle = $("#themeToggle");
const themeIcon = $("#themeIcon");
const themeColorMeta = $("#themeColor");

const quizData = [
  {
    question: "How well did you sleep last night?",
    options: ["Very well", "Okay", "Poorly", "Barely at all"]
  },
  {
    question: "How overwhelmed do you feel right now?",
    options: ["Not at all", "A little", "Quite a lot", "Completely"]
  },
  {
    question: "How often do you feel tension in your body today?",
    options: ["Rarely", "Sometimes", "Often", "Constantly"]
  },
  {
    question: "How difficult is it to focus right now?",
    options: ["Easy", "Slightly hard", "Very hard", "Impossible"]
  },
  {
    question: "How irritable have you felt today?",
    options: ["Not at all", "Mildly", "Quite a bit", "Extremely"]
  },
  {
    question: "How many times did you check your phone anxiously today?",
    options: ["0-5", "6-15", "16-30", "30+"]
  },
  {
    question: "How connected do you feel to people around you?",
    options: ["Very connected", "Somewhat", "Distant", "Completely isolated"]
  }
];

const resultLevels = [
  {
    min: 7,
    max: 12,
    label: "🟢 CALM",
    color: "#62d68f",
    title: "You're in a good place. Keep it up.",
    tip: "Protect the quiet: take a slow walk, stretch your shoulders, or drink water before the next demand arrives."
  },
  {
    min: 13,
    max: 19,
    label: "🟡 MILD STRESS",
    color: "#f1cf72",
    title: "You're carrying some weight. Let's lighten it.",
    tip: "Try one 4-4-6 breathing cycle, then write down the single next thing that actually needs your attention."
  },
  {
    min: 20,
    max: 24,
    label: "🟠 ELEVATED",
    color: "#ee9b58",
    title: "Your mind is strained. Time to reset.",
    tip: "Ground yourself: press your feet into the floor, unclench your jaw, and name five things you can see."
  },
  {
    min: 25,
    max: 28,
    label: "🔴 HIGH STRESS",
    color: "#ff6b7a",
    title: "Your system is overwhelmed. Please pause and breathe.",
    tip: "Step away from stimulation if you can. Slow your exhale, contact someone safe, and seek urgent support if you feel at risk."
  }
];

let currentQuestion = 0;
let quizScore = 0;

const questionCount = $("#questionCount");
const progressPercent = $("#progressPercent");
const quizProgress = $("#quizProgress");
const quizStage = $("#quizStage");
const questionText = $("#questionText");
const quizOptions = $("#quizOptions");
const resultCard = $("#resultCard");
const resultRing = $("#resultRing");
const resultScore = $("#resultScore");
const meterFill = $("#meterFill");
const resultLabel = $("#resultLabel");
const resultTitle = $("#resultTitle");
const resultTip = $("#resultTip");
const retakeQuiz = $("#retakeQuiz");

const breathCircle = $("#breathCircle");
const breathPhase = $("#breathPhase");
const breathCue = $("#breathCue");
const breathTimer = $("#breathTimer");
const breathStart = $("#breathStart");
const breathPause = $("#breathPause");
const breathReset = $("#breathReset");

let breathRunning = false;
let breathPhaseIndex = 0;
let breathTimeout = null;
let sessionSeconds = 0;
let sessionInterval = null;

const breathPhases = [
  { name: "Inhale", cue: "4 seconds", className: "inhale", duration: 4000 },
  { name: "Hold", cue: "4 seconds", className: "hold", duration: 4000 },
  { name: "Exhale", cue: "6 seconds", className: "exhale", duration: 6000 }
];

const journalText = $("#journalText");
const wordCount = $("#wordCount");
const releaseText = $("#releaseText");
const journalPaper = $("#journalPaper");
const emberField = $("#emberField");

const audioSources = {
  rain: "https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3",
  ocean: "https://assets.mixkit.co/sfx/preview/mixkit-ocean-waves-loop-1196.mp3",
  forest: "https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3"
};

const audioPlayers = {};
let activeSound = null;
let audioContext = null;
let fallbackNodes = [];
let fallbackTimer = null;
let soundToken = 0;

const affirmationCard = $("#affirmationCard");
const affirmationText = $("#affirmationText");
const nextAffirmation = $("#nextAffirmation");
const affirmations = [
  "You are not your thoughts. You are the one who notices them.",
  "This moment will pass. You have survived every hard day so far.",
  "It's okay to rest. Rest is productive.",
  "Your worth is not measured by your output today.",
  "Breathe. You are exactly where you need to be.",
  "You are doing better than you think.",
  "Peace is possible. Even now.",
  "You don't have to solve everything today.",
  "Small steps still move you forward.",
  "You are allowed to take up space."
];
let currentAffirmation = 0;

function initTheme() {
  const savedTheme = localStorage.getItem("serenova-theme");
  setTheme(savedTheme === "dark" ? "dark" : "light");

  themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("serenova-theme", nextTheme);
  });
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeIcon.textContent = theme === "dark" ? "☀" : "☾";
  themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
  themeToggle.title = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
  themeColorMeta.setAttribute("content", theme === "dark" ? "#111817" : "#f7f3ea");
}

function initNav() {
  window.addEventListener("scroll", () => {
    nav.classList.toggle("shrunk", window.scrollY > 24);
  });

  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  $$(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initCursor() {
  if (!window.matchMedia("(pointer: fine)").matches) {
    return;
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let dotX = mouseX;
  let dotY = mouseY;

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursor.style.opacity = "1";
  });

  window.addEventListener("mouseleave", () => {
    cursor.style.opacity = "0";
  });

  function animateCursor() {
    dotX += (mouseX - dotX) * 0.16;
    dotY += (mouseY - dotY) * 0.16;
    cursor.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  }

  animateCursor();
}

function renderQuestion() {
  const item = quizData[currentQuestion];
  const percent = Math.round(((currentQuestion + 1) / quizData.length) * 100);

  questionCount.textContent = `Question ${currentQuestion + 1} of ${quizData.length}`;
  progressPercent.textContent = `${percent}%`;
  quizProgress.style.width = `${percent}%`;
  questionText.textContent = item.question;
  quizOptions.innerHTML = "";

  item.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "option-btn";
    button.type = "button";
    button.textContent = option;
    button.addEventListener("click", () => chooseOption(button, index + 1));
    quizOptions.appendChild(button);
  });
}

function chooseOption(button, score) {
  if (button.classList.contains("selected")) {
    return;
  }

  $$(".option-btn", quizOptions).forEach((option) => {
    option.disabled = true;
    option.classList.remove("selected");
  });

  button.classList.add("selected");
  quizScore += score;

  setTimeout(() => {
    if (currentQuestion === quizData.length - 1) {
      showResult();
      return;
    }

    quizStage.classList.add("is-exiting");
    setTimeout(() => {
      currentQuestion += 1;
      quizStage.classList.remove("is-exiting");
      quizStage.classList.add("is-entering");
      renderQuestion();
      requestAnimationFrame(() => {
        quizStage.classList.remove("is-entering");
      });
    }, 240);
  }, 520);
}

function showResult() {
  const level = resultLevels.find((item) => quizScore >= item.min && quizScore <= item.max);
  const scorePercent = Math.round((quizScore / 28) * 100);
  const scoreAngle = Math.round((quizScore / 28) * 360);

  quizStage.hidden = true;
  resultCard.hidden = false;
  resultCard.classList.remove("show");

  resultRing.style.setProperty("--level-color", level.color);
  resultRing.style.setProperty("--score-angle", `${scoreAngle}deg`);
  resultScore.textContent = "0";
  meterFill.style.width = "0%";
  meterFill.style.background = `linear-gradient(90deg, ${level.color}, var(--glow))`;
  resultLabel.textContent = level.label;
  resultLabel.style.color = level.color;
  resultTitle.textContent = level.title;
  resultTip.textContent = level.tip;

  requestAnimationFrame(() => {
    resultCard.classList.add("show");
    animateNumber(resultScore, quizScore, 850);
    setTimeout(() => {
      meterFill.style.width = `${scorePercent}%`;
    }, 140);
  });
}

function resetQuiz() {
  currentQuestion = 0;
  quizScore = 0;
  quizStage.hidden = false;
  resultCard.hidden = true;
  resultCard.classList.remove("show");
  renderQuestion();
}

function animateNumber(element, target, duration) {
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(target * eased);

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

function runBreathPhase() {
  if (!breathRunning) {
    return;
  }

  const phase = breathPhases[breathPhaseIndex];
  breathCircle.className = `breath-circle ${phase.className}`;
  breathPhase.textContent = phase.name;
  breathCue.textContent = phase.cue;

  breathTimeout = setTimeout(() => {
    breathPhaseIndex = (breathPhaseIndex + 1) % breathPhases.length;
    runBreathPhase();
  }, phase.duration);
}

function startBreathing() {
  if (breathRunning) {
    return;
  }

  breathRunning = true;
  runBreathPhase();

  if (!sessionInterval) {
    sessionInterval = setInterval(() => {
      sessionSeconds += 1;
      updateBreathTimer();
    }, 1000);
  }
}

function pauseBreathing() {
  breathRunning = false;
  clearTimeout(breathTimeout);
  clearInterval(sessionInterval);
  sessionInterval = null;
  breathCue.textContent = "Paused";
}

function resetBreathing() {
  pauseBreathing();
  breathPhaseIndex = 0;
  sessionSeconds = 0;
  breathCircle.className = "breath-circle";
  breathPhase.textContent = "Ready";
  breathCue.textContent = "Press start";
  updateBreathTimer();
}

function updateBreathTimer() {
  const minutes = String(Math.floor(sessionSeconds / 60)).padStart(2, "0");
  const seconds = String(sessionSeconds % 60).padStart(2, "0");
  breathTimer.textContent = `${minutes}:${seconds}`;
}

function updateWordCount() {
  const words = journalText.value.trim().split(/\s+/).filter(Boolean);
  wordCount.textContent = `${words.length} ${words.length === 1 ? "word" : "words"}`;
}

function releaseJournal() {
  if (!journalText.value.trim()) {
    journalText.focus();
    return;
  }

  journalPaper.classList.add("releasing");
  createEmbers();

  setTimeout(() => {
    journalText.value = "";
    updateWordCount();
    journalPaper.classList.remove("releasing");
  }, 1200);
}

function createEmbers() {
  emberField.innerHTML = "";

  for (let i = 0; i < 38; i += 1) {
    const ember = document.createElement("span");
    ember.className = "ember";
    ember.style.setProperty("--x", `${Math.random() * 100}%`);
    ember.style.setProperty("--size", `${Math.random() * 8 + 4}px`);
    ember.style.setProperty("--drift", `${Math.random() * 120 - 60}px`);
    ember.style.setProperty("--duration", `${Math.random() * 0.7 + 0.9}s`);
    emberField.appendChild(ember);
  }

  setTimeout(() => {
    emberField.innerHTML = "";
  }, 1800);
}

function initAudio() {
  Object.entries(audioSources).forEach(([key, source]) => {
    const audio = new Audio(source);
    audio.loop = true;
    audio.volume = Number($("#volumeSlider").value);
    audioPlayers[key] = audio;
  });

  $$(".sound-card").forEach((card) => {
    card.addEventListener("click", () => toggleSound(card.dataset.sound));
  });

  $("#volumeSlider").addEventListener("input", (event) => {
    Object.values(audioPlayers).forEach((audio) => {
      audio.volume = Number(event.target.value);
    });
  });
}

function toggleSound(soundName) {
  const selectedAudio = audioPlayers[soundName];

  if (activeSound === soundName) {
    stopAllSounds();
    return;
  }

  Object.entries(audioPlayers).forEach(([key, audio]) => {
    if (key !== soundName) {
      audio.pause();
      audio.currentTime = 0;
    }
  });

  stopFallbackSound();
  activeSound = soundName;
  soundToken += 1;
  const currentToken = soundToken;
  updateSoundCards();

  selectedAudio.play().then(() => {
    if (currentToken !== soundToken) {
      selectedAudio.pause();
      return;
    }

    stopFallbackSound();
    activeSound = soundName;
    updateSoundCards();
  }).catch(() => {
    if (currentToken === soundToken) {
      startFallbackSound(soundName);
    }
  });

  setTimeout(() => {
    if (currentToken === soundToken && selectedAudio.paused && activeSound === soundName) {
      startFallbackSound(soundName);
    }
  }, 1400);
}

function updateSoundCards() {
  $$(".sound-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.sound === activeSound);
  });
}

function stopAllSounds() {
  Object.values(audioPlayers).forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });

  stopFallbackSound();
  activeSound = null;
  soundToken += 1;
  updateSoundCards();
}

function ensureAudioContext() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;

  if (!AudioCtor) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioCtor();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function stopFallbackSound() {
  clearInterval(fallbackTimer);
  fallbackTimer = null;

  fallbackNodes.forEach((node) => {
    try {
      if (typeof node.stop === "function") {
        node.stop();
      }
    } catch (error) {
      // Some audio nodes may already be stopped; disconnecting still cleans up the graph.
    }

    try {
      node.disconnect();
    } catch (error) {
      // Disconnected nodes are safe to ignore.
    }
  });

  fallbackNodes = [];
}

function createNoiseBuffer(context) {
  const duration = 2;
  const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
  const channel = buffer.getChannelData(0);

  for (let i = 0; i < channel.length; i += 1) {
    channel[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

function startFallbackSound(soundName) {
  const context = ensureAudioContext();

  if (!context || fallbackNodes.length) {
    return;
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = createNoiseBuffer(context);
  source.loop = true;

  if (soundName === "rain") {
    filter.type = "highpass";
    filter.frequency.value = 900;
    gain.gain.value = 0.08;
  } else if (soundName === "ocean") {
    filter.type = "lowpass";
    filter.frequency.value = 520;
    gain.gain.value = 0.12;
    addOceanSwell(context, gain);
  } else {
    filter.type = "bandpass";
    filter.frequency.value = 1800;
    gain.gain.value = 0.035;
    addForestChirps(context);
  }

  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.start();
  fallbackNodes.push(source, filter, gain);
}

function addOceanSwell(context, gain) {
  const oscillator = context.createOscillator();
  const swell = context.createGain();
  oscillator.frequency.value = 0.08;
  swell.gain.value = 0.055;
  oscillator.connect(swell);
  swell.connect(gain.gain);
  oscillator.start();
  fallbackNodes.push(oscillator, swell);
}

function addForestChirps(context) {
  const chirp = () => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(1000 + Math.random() * 900, now);
    oscillator.frequency.exponentialRampToValueAtTime(700 + Math.random() * 600, now + 0.22);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.04, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.28);
  };

  chirp();
  fallbackTimer = setInterval(chirp, 1800);
}

function drawAffirmation() {
  let nextIndex = Math.floor(Math.random() * affirmations.length);

  if (affirmations.length > 1) {
    while (nextIndex === currentAffirmation) {
      nextIndex = Math.floor(Math.random() * affirmations.length);
    }
  }

  currentAffirmation = nextIndex;
  affirmationCard.classList.remove("flipped");

  setTimeout(() => {
    affirmationText.textContent = affirmations[currentAffirmation];
  }, 220);
}

function initAffirmations() {
  affirmationCard.addEventListener("click", () => {
    affirmationCard.classList.toggle("flipped");
  });

  nextAffirmation.addEventListener("click", drawAffirmation);
}

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateDiffInDays(previous, current) {
  const previousDate = new Date(`${previous}T00:00:00`);
  const currentDate = new Date(`${current}T00:00:00`);
  return Math.round((currentDate - previousDate) / 86400000);
}

function initStreak() {
  const today = getTodayKey();
  const stored = JSON.parse(localStorage.getItem("serenova-streak") || "null");
  let streak = 1;

  if (stored?.lastVisit) {
    const diff = dateDiffInDays(stored.lastVisit, today);

    if (diff === 0) {
      streak = stored.count || 1;
    } else if (diff === 1) {
      streak = (stored.count || 0) + 1;
    }
  }

  localStorage.setItem("serenova-streak", JSON.stringify({ count: streak, lastVisit: today }));
  animateNumber($("#streakNumber"), streak, 900);
  $("#streakMessage").textContent = getStreakMessage(streak);
}

function getStreakMessage(streak) {
  if (streak >= 30) {
    return "A month of showing up. That's rare.";
  }

  if (streak >= 7) {
    return "One full week. Your future self is grateful.";
  }

  if (streak >= 3) {
    return "You're building something real.";
  }

  return "Every journey starts somewhere. Welcome.";
}

function initEvents() {
  retakeQuiz.addEventListener("click", resetQuiz);
  breathStart.addEventListener("click", startBreathing);
  breathPause.addEventListener("click", pauseBreathing);
  breathReset.addEventListener("click", resetBreathing);
  journalText.addEventListener("input", updateWordCount);
  releaseText.addEventListener("click", releaseJournal);
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNav();
  initCursor();
  renderQuestion();
  initEvents();
  initAudio();
  initAffirmations();
  initStreak();
});
