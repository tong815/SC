// DOM references: app.js owns rendering and browser events.
const mapScreenElement = document.querySelector("#map-screen");
const practiceViewElement = document.querySelector("#practice-view");
const backToMapButton = document.querySelector("#back-to-map");
const saveProgressButton = document.querySelector("#save-progress");
const loadProgressButton = document.querySelector("#load-progress");
const openChroniclesButton = document.querySelector("#open-chronicles");
const progressFileInput = document.querySelector("#progress-file");
const questionsAnsweredElement = document.querySelector("#questions-answered");
const accuracyPercentageElement = document.querySelector("#accuracy-percentage");
const progressMessageElement = document.querySelector("#progress-message");
const gameMapElement = document.querySelector("#game-map");
const mapPlayerElement = document.querySelector("#map-player");
const mapTowersElement = document.querySelector("#map-towers");
const mapStatusElement = document.querySelector("#map-status");
const blacksmithButton = document.querySelector("#blacksmith-button");
const blacksmithPanelElement = document.querySelector("#blacksmith-panel");
const fragmentCountElement = document.querySelector("#fragment-count");
const chronicleCountElement = document.querySelector("#chronicle-count");
const forgeKeyButton = document.querySelector("#forge-key");
const towerTitleElement = document.querySelector("#tower-title");
const towerDescriptionElement = document.querySelector("#tower-description");
const towerStatusElement = document.querySelector("#tower-status");
const towerHpElement = document.querySelector("#tower-hp");
const towerStreakElement = document.querySelector("#tower-streak");
const towerProgressTextElement = document.querySelector("#tower-progress-text");
const towerProgressFillElement = document.querySelector("#tower-progress-fill");
const towerResultElement = document.querySelector("#tower-result");
const questionListElement = document.querySelector("#question-list");
const chronicleScreenElement = document.querySelector("#chronicle-screen");
const closeChroniclesButton = document.querySelector("#close-chronicles");
const chronicleStatusElement = document.querySelector("#chronicle-status");
const chronicleListElement = document.querySelector("#chronicle-list");
const chronicleReaderElement = document.querySelector("#chronicle-reader");
const errorMessageElement = document.querySelector("#error-message");

const APP_NAME = "Exam Visualizer";
const SAVE_FILE_VERSION = "3.0";
const ALL_QUESTIONS_TOPIC = "All Questions";
const TOWER_STARTING_HP = 10;
const TOWER_CLEAR_PROGRESS = 50;

// Loaded data and runtime state. currentRun is never saved.
let allQuestions = [];
let allChronicles = [];
let mapData = null;
let progress = null;
// A tower run is temporary: HP, streak, and run progress reset when entering or retrying.
let currentRun = null;
let currentChronicleExperience = null;

// Data loading
async function loadJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Unable to load ${path} (HTTP ${response.status}).`);
  }

  return response.json();
}

// Data lookup helpers
function getOuterTowers() {
  return mapData.towers.filter((tower) => tower.type === "outer");
}

function getPracticeTopics() {
  return getOuterTowers().map((tower) => tower.topic);
}

function getQuestionsForTopic(questions, topic) {
  if (topic === ALL_QUESTIONS_TOPIC) {
    return questions;
  }

  return questions.filter((question) => question.topic === topic);
}

function getOrderedChronicles() {
  return [...allChronicles].sort((first, second) => first.order - second.order);
}

function isChronicleUnlocked(chronicle) {
  return progress.gameProgress.chronicles.unlockedChronicleIds.includes(chronicle.id);
}

// Player progress defaults and save normalization
function createEmptyProgress() {
  return GameRules.createDefaultPlayerProgress({
    playerStart: mapData.playerStart,
    practiceTopics: getPracticeTopics(),
    outerTowers: getOuterTowers(),
  });
}

// Map rendering and map interactions
function renderMap() {
  mapTowersElement.innerHTML = "";

  mapData.towers.forEach((tower) => {
    const towerButton = document.createElement("button");
    const isCleared = GameRules.isTowerCleared(progress.gameProgress, tower.id);
    const isLocked = !GameRules.canAccessTower(progress.gameProgress, tower);

    towerButton.className = [
      "map-tower",
      `is-${tower.type}`,
      isCleared ? "is-cleared" : "",
      isLocked ? "is-locked" : "",
    ]
      .filter(Boolean)
      .join(" ");
    towerButton.type = "button";
    towerButton.dataset.towerId = tower.id;
    towerButton.style.left = `${tower.x}%`;
    towerButton.style.top = `${tower.y}%`;
    towerButton.innerHTML = `
      <span class="tower-icon">${tower.type === "central" ? "C" : "T"}</span>
      <span class="tower-name">${tower.name}</span>
      <span class="tower-state">${getTowerStateLabel(tower, isCleared, isLocked)}</span>
    `;
    towerButton.addEventListener("click", (event) => {
      event.stopPropagation();
      handleTowerClick(tower);
    });

    mapTowersElement.append(towerButton);
  });

  renderPlayerPosition();
  renderBlacksmith();
  renderChronicleCount();
  renderProgress();
}

function getTowerStateLabel(tower, isCleared, isLocked) {
  if (isLocked) {
    return "Locked";
  }

  if (tower.type === "central") {
    return "Unlocked";
  }

  return isCleared ? "Cleared" : "Enter";
}

function renderPlayerPosition() {
  const { x, y } = progress.gameProgress.playerPosition;

  mapPlayerElement.style.left = `${x}%`;
  mapPlayerElement.style.top = `${y}%`;
}

function renderBlacksmith() {
  const requiredFragments = getBlacksmithRecipe().input.length;
  const collectedFragments = progress.gameProgress.keyFragments.length;
  const canForge = GameRules.canForgeKey(progress.gameProgress, getBlacksmithRecipe());

  fragmentCountElement.textContent = `Key fragments: ${collectedFragments} / ${requiredFragments}`;
  forgeKeyButton.disabled = !canForge;
  forgeKeyButton.textContent = progress.gameProgress.hasCentralTowerKey
    ? "Key Forged"
    : "Forge Key";
}

function renderChronicleCount() {
  const unlockedCount = progress.gameProgress.chronicles.unlockedChronicleIds.length;
  chronicleCountElement.textContent = `Chronicles: ${unlockedCount} / ${allChronicles.length}`;
}

function getBlacksmithRecipe() {
  return mapData.shops[0].recipe;
}

function handleMapClick(event) {
  const rect = gameMapElement.getBoundingClientRect();
  const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
  const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);

  movePlayerTo(x, y);
  setMapStatus("Player moved. Choose a tower to begin a run.");
}

function handleTowerClick(tower) {
  movePlayerTo(tower.x, tower.y);

  if (!GameRules.canAccessTower(progress.gameProgress, tower)) {
    setMapStatus(
      "The Central Tower is locked. Clear all six outer towers and forge the key first.",
    );
    return;
  }

  if (tower.type === "central") {
    setMapStatus("The Central Tower is unlocked. Clear the outer towers again anytime for practice.");
    return;
  }

  startTowerRun(tower);
}

function movePlayerTo(x, y) {
  progress.gameProgress.playerPosition = {
    x: Math.round(x),
    y: Math.round(y),
  };
  renderPlayerPosition();
}

// Tower run state and screen flow
function startTowerRun(tower) {
  const questions = getQuestionsForTopic(allQuestions, tower.topic);

  if (questions.length === 0) {
    setMapStatus(`${tower.name} has no questions yet.`);
    return;
  }

  currentRun = {
    tower,
    questions,
    questionDeck: shuffleQuestions(questions),
    hp: TOWER_STARTING_HP,
    streak: 0,
    runProgress: 0,
    currentQuestion: null,
    isFinished: false,
  };

  mapScreenElement.hidden = true;
  practiceViewElement.hidden = false;
  towerTitleElement.textContent = tower.name;
  towerDescriptionElement.textContent =
    tower.description || "Restore this tower by answering questions with focus.";
  towerResultElement.hidden = true;
  towerResultElement.innerHTML = "";
  setTowerStatus(`${tower.topic} run started. Restore ${TOWER_CLEAR_PROGRESS} Seal Energy before HP reaches 0.`);
  updateTowerRunDisplay();
  loadRandomTowerQuestion();
}

// Question deck: each tower run draws from a shuffled pool before reshuffling.
function loadRandomTowerQuestion() {
  if (!currentRun || currentRun.isFinished) {
    return;
  }

  currentRun.currentQuestion = drawTowerQuestion();
  towerResultElement.hidden = true;
  towerResultElement.innerHTML = "";
  questionListElement.innerHTML = "";
  questionListElement.append(createQuestionCard(currentRun.currentQuestion));
  setTowerStatus("Choose an answer.");
}

function drawTowerQuestion() {
  if (currentRun.questionDeck.length === 0) {
    currentRun.questionDeck = shuffleQuestions(currentRun.questions);
  }

  return currentRun.questionDeck.pop();
}

function shuffleQuestions(questions) {
  const shuffledQuestions = [...questions];

  for (let index = shuffledQuestions.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffledQuestions[index], shuffledQuestions[swapIndex]] = [
      shuffledQuestions[swapIndex],
      shuffledQuestions[index],
    ];
  }

  return shuffledQuestions;
}

// Question card rendering
function createQuestionCard(question) {
  const card = document.createElement("article");
  card.className = "question-card";
  card.dataset.questionId = question.id;

  const optionButtons = question.options
    .map(
      (option) => `
        <button
          class="option-button"
          type="button"
          data-option-id="${option.id}"
          aria-describedby="feedback-${question.id}"
        >
          <span class="option-key">${option.id}</span>
          <span>${option.text}</span>
        </button>
      `,
    )
    .join("");

  card.innerHTML = `
    <div class="question-meta">
      <span class="question-number">Tower question</span>
      <span class="question-type">${question.topic}</span>
    </div>
    <h3 class="question-title">${question.title}</h3>
    <p class="question-text">${question.question}</p>
    <div class="option-list" role="group" aria-label="Answer choices">
      ${optionButtons}
    </div>
    <div id="feedback-${question.id}" class="feedback" aria-live="polite" hidden></div>
  `;

  card.querySelectorAll(".option-button").forEach((button) => {
    button.addEventListener("click", () => handleTowerAnswer(question, card, button));
  });

  return card;
}

// Answer handling and tower-run outcomes
function handleTowerAnswer(question, card, selectedButton) {
  if (!currentRun || currentRun.isFinished) {
    return;
  }

  const selectedAnswer = selectedButton.dataset.optionId;
  const isCorrect = selectedAnswer === question.answer;
  const correctOption = question.options.find(
    (option) => option.id === question.answer,
  );

  lockAnsweredCard(card, selectedButton, question.answer, isCorrect);
  recordAnswer(question, isCorrect);

  let gainedEnergy = 0;

  if (isCorrect) {
    currentRun.streak += 1;
    gainedEnergy = GameRules.calculateSealEnergyGain(currentRun.streak);
    currentRun.runProgress = Math.min(
      TOWER_CLEAR_PROGRESS,
      currentRun.runProgress + gainedEnergy,
    );
  } else {
    currentRun.hp = Math.max(0, currentRun.hp - 1);
    currentRun.streak = 0;
  }

  updateTowerRunDisplay();
  showAnswerFeedback(card, question, correctOption, isCorrect, gainedEnergy);

  if (GameRules.isTowerRunCleared(currentRun.runProgress, TOWER_CLEAR_PROGRESS)) {
    completeTowerRun();
    return;
  }

  if (currentRun.hp <= 0) {
    failTowerRun();
    return;
  }

  renderTowerActionButton("Next question", loadRandomTowerQuestion);
  setTowerStatus(
    isCorrect
      ? `Correct. Combo x${currentRun.streak} restored ${gainedEnergy} Seal Energy.`
      : "Wrong. HP decreased by 1 and your streak reset.",
  );
}

function lockAnsweredCard(card, selectedButton, correctAnswer, isCorrect) {
  card.querySelectorAll(".option-button").forEach((button) => {
    button.disabled = true;

    if (button.dataset.optionId === correctAnswer) {
      button.classList.add("is-correct");
    }
  });

  if (!isCorrect) {
    selectedButton.classList.add("is-incorrect");
  }
}

function showAnswerFeedback(card, question, correctOption, isCorrect, gainedEnergy) {
  const feedbackElement = card.querySelector(".feedback");
  feedbackElement.hidden = false;
  feedbackElement.className = `feedback ${isCorrect ? "correct" : "incorrect"}`;
  feedbackElement.innerHTML = `
    <p class="feedback-status">${isCorrect ? "Correct" : "Wrong"}</p>
    ${isCorrect ? createComboFeedback(currentRun.streak, gainedEnergy) : ""}
    <p class="feedback-answer">
      <strong>Correct answer:</strong> ${correctOption.id}. ${correctOption.text}
    </p>
    <p class="feedback-explanation">
      <strong>Explanation:</strong> ${question.explanation}
    </p>
  `;
}

function createComboFeedback(streak, gainedEnergy) {
  const praise = getComboPraise(streak);

  return `
    <div class="combo-feedback" aria-live="polite">
      <span class="combo-count">Combo x${streak}${streak >= 5 ? "!" : ""}</span>
      <span class="combo-praise">${praise}</span>
      <span class="energy-gain">+${gainedEnergy} Seal Energy</span>
    </div>
  `;
}

function getComboPraise(streak) {
  if (streak >= 8) {
    return "Excellent!";
  }

  if (streak >= 5) {
    return "Amazing!";
  }

  if (streak >= 3) {
    return "Great streak!";
  }

  return "Keep going!";
}

function renderTowerActionButton(label, onClick) {
  const action = document.createElement("button");
  action.className = "progress-button tower-action";
  action.type = "button";
  action.textContent = label;
  action.addEventListener("click", onClick);
  towerResultElement.hidden = false;
  towerResultElement.innerHTML = "";
  towerResultElement.append(action);
}

function completeTowerRun() {
  const { tower } = currentRun;
  const wasAlreadyCleared = GameRules.isTowerCleared(progress.gameProgress, tower.id);
  let unlockedChronicle = null;

  currentRun.isFinished = true;
  updateSavedTowerProgress(tower, true);
  progress.gameProgress = GameRules.onCorrectAnswer(progress.gameProgress, tower);

  if (!wasAlreadyCleared) {
    const unlockResult = GameRules.unlockNextChronicle(
      progress.gameProgress,
      getOrderedChronicles(),
    );
    progress.gameProgress = unlockResult.state;
    unlockedChronicle = unlockResult.chronicle;
  }

  const rewardMessage = wasAlreadyCleared
    ? "Tower cleared again. No new key fragment because this tower was already completed."
    : "Tower cleared. Key fragment collected.";
  const chronicleMessage = unlockedChronicle
    ? ` Chronicle unlocked: ${unlockedChronicle.title}.`
    : "";

  setTowerStatus(`${rewardMessage}${chronicleMessage}`);
  showRunEndMessage("Tower Cleared", `${rewardMessage}${chronicleMessage}`, true, unlockedChronicle);
  renderMap();
}

function failTowerRun() {
  const { tower } = currentRun;

  currentRun.isFinished = true;
  updateSavedTowerProgress(tower, false);
  setTowerStatus("Tower run failed. HP reached 0.");
  showRunEndMessage(
    "Run Failed",
    "HP reached 0. Return to the map or retry this tower with a fresh 10 HP.",
    false,
  );
}

function showRunEndMessage(title, message, wasCleared, unlockedChronicle = null) {
  questionListElement.innerHTML = "";
  towerResultElement.hidden = false;
  towerResultElement.className = `tower-result ${wasCleared ? "is-cleared" : "is-failed"}`;
  const chronicleAction = unlockedChronicle
    ? `<button id="read-chronicle-action" class="progress-button" type="button">Read Chronicle</button>`
    : "";
  towerResultElement.innerHTML = `
    <h3>${title}</h3>
    <p>${message}</p>
    <div class="tower-result-actions">
      ${chronicleAction}
      <button id="return-map-action" class="progress-button" type="button">Back to Map</button>
      <button id="retry-tower-action" class="progress-button" type="button">Retry Tower</button>
    </div>
  `;

  if (unlockedChronicle) {
    towerResultElement
      .querySelector("#read-chronicle-action")
      .addEventListener("click", () => showChronicleScreen(unlockedChronicle.id));
  }

  towerResultElement
    .querySelector("#return-map-action")
    .addEventListener("click", showMapScreen);
  towerResultElement
    .querySelector("#retry-tower-action")
    .addEventListener("click", () => startTowerRun(currentRun.tower));
}

function updateSavedTowerProgress(tower, wasCleared) {
  progress.gameProgress = GameRules.updateTowerRunProgress(progress.gameProgress, tower, {
    runProgress: currentRun.runProgress,
    wasCleared,
    playedAt: new Date().toISOString(),
  });
}

// Permanent answer statistics
function recordAnswer(question, isCorrect) {
  progress.totalQuestionsAnswered += 1;
  progress.totalCorrectAnswers += isCorrect ? 1 : 0;
  progress.totalWrongAnswers += isCorrect ? 0 : 1;
  addUnique(progress.answeredQuestionIds, question.id);

  if (!progress.topicStats[question.topic]) {
    progress.topicStats[question.topic] = {
      answered: 0,
      correct: 0,
      wrong: 0,
    };
  }

  progress.topicStats[question.topic].answered += 1;

  if (isCorrect) {
    addUnique(progress.correctQuestionIds, question.id);
    progress.topicStats[question.topic].correct += 1;
  } else {
    addUnique(progress.wrongQuestionIds, question.id);
    progress.topicStats[question.topic].wrong += 1;
  }

  renderProgress();
  setProgressMessage("Progress updated.");
}

function renderProgress() {
  const accuracy =
    progress.totalQuestionsAnswered === 0
      ? 0
      : Math.round(
          (progress.totalCorrectAnswers / progress.totalQuestionsAnswered) * 100,
        );

  questionsAnsweredElement.textContent = `${progress.totalQuestionsAnswered} answered`;
  accuracyPercentageElement.textContent = `${accuracy}% accuracy`;
}

// Tower practice UI rendering
function updateTowerRunDisplay() {
  if (!currentRun) {
    return;
  }

  const progressPercent = (currentRun.runProgress / TOWER_CLEAR_PROGRESS) * 100;

  towerHpElement.innerHTML = `
    <span class="stat-label">Health</span>
    <span class="hp-hearts" aria-hidden="true">${renderHpHearts(currentRun.hp)}</span>
    <span class="hp-number">${currentRun.hp} / ${TOWER_STARTING_HP}</span>
  `;
  towerStreakElement.textContent = `Streak ${currentRun.streak}`;
  towerProgressTextElement.textContent = `Seal Energy ${currentRun.runProgress} / ${TOWER_CLEAR_PROGRESS}`;
  towerProgressFillElement.style.width = `${progressPercent}%`;
}

function renderHpHearts(hp) {
  return `${"♥".repeat(hp)}${"♡".repeat(TOWER_STARTING_HP - hp)}`;
}

function showMapScreen() {
  currentRun = null;
  currentChronicleExperience = null;
  practiceViewElement.hidden = true;
  chronicleScreenElement.hidden = true;
  mapScreenElement.hidden = false;
  towerResultElement.className = "tower-result";
  questionListElement.innerHTML = "";
  renderMap();
  setMapStatus("Choose a tower to begin a run.");
}

function setProgressMessage(message) {
  progressMessageElement.textContent = message;
}

function setMapStatus(message) {
  mapStatusElement.textContent = message;
}

function setTowerStatus(message) {
  towerStatusElement.textContent = message;
}

// Save/load
function saveProgress() {
  const saveData = {
    appName: APP_NAME,
    version: SAVE_FILE_VERSION,
    savedAt: new Date().toISOString(),
    progress,
  };
  const file = new Blob([JSON.stringify(saveData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(file);
  const downloadLink = document.createElement("a");

  downloadLink.href = url;
  downloadLink.download = "exam-visualizer-progress.json";
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  URL.revokeObjectURL(url);
  setProgressMessage("Progress file downloaded.");
}

function requestProgressFile() {
  progressFileInput.value = "";
  progressFileInput.click();
}

function loadProgressFile(event) {
  const [file] = event.target.files;

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.addEventListener("load", () => {
    try {
      const saveData = JSON.parse(reader.result);
      progress = validateAndNormalizeSaveData(saveData);
      currentRun = null;
      showMapScreen();
      setProgressMessage("Progress file loaded.");
      setMapStatus("Saved map progress restored.");
    } catch (error) {
      setProgressMessage(error.message);
    }
  });

  reader.addEventListener("error", () => {
    setProgressMessage("The progress file could not be read.");
  });

  reader.readAsText(file);
}

function validateAndNormalizeSaveData(saveData) {
  if (!saveData || saveData.appName !== APP_NAME || !saveData.progress) {
    throw new Error("This does not look like an Exam Visualizer progress file.");
  }

  return normalizeProgress(saveData.progress);
}

function normalizeProgress(importedProgress) {
  const nextProgress = createEmptyProgress();
  const questionById = new Map(
    allQuestions.map((question) => [question.id, question]),
  );
  const answeredIds = getUniqueStringArray(importedProgress.answeredQuestionIds);
  const correctIds = getUniqueStringArray(importedProgress.correctQuestionIds);
  const wrongIds = getUniqueStringArray(importedProgress.wrongQuestionIds);

  nextProgress.answeredQuestionIds = answeredIds.filter((questionId) =>
    questionById.has(questionId),
  );
  nextProgress.correctQuestionIds = correctIds.filter(
    (questionId) =>
      questionById.has(questionId) &&
      nextProgress.answeredQuestionIds.includes(questionId),
  );
  nextProgress.wrongQuestionIds = wrongIds.filter(
    (questionId) =>
      questionById.has(questionId) &&
      nextProgress.answeredQuestionIds.includes(questionId) &&
      !nextProgress.correctQuestionIds.includes(questionId),
  );

  const rebuiltTotals = rebuildTopicStats(nextProgress);
  nextProgress.totalQuestionsAnswered = getNonNegativeNumber(
    importedProgress.totalQuestionsAnswered,
    rebuiltTotals.answered,
  );
  nextProgress.totalCorrectAnswers = getNonNegativeNumber(
    importedProgress.totalCorrectAnswers,
    rebuiltTotals.correct,
  );
  nextProgress.totalWrongAnswers = getNonNegativeNumber(
    importedProgress.totalWrongAnswers,
    rebuiltTotals.wrong,
  );
  nextProgress.topicStats = normalizeTopicStats(
    importedProgress.topicStats,
    rebuiltTotals.topicStats,
  );
  nextProgress.gameProgress = normalizeGameProgress(importedProgress.gameProgress);

  return nextProgress;
}

function rebuildTopicStats(nextProgress) {
  const topicStats = {};
  let answered = 0;
  let correct = 0;
  let wrong = 0;
  const questionById = new Map(
    allQuestions.map((question) => [question.id, question]),
  );

  getPracticeTopics().forEach((topic) => {
    topicStats[topic] = {
      answered: 0,
      correct: 0,
      wrong: 0,
    };
  });

  nextProgress.answeredQuestionIds.forEach((questionId) => {
    const question = questionById.get(questionId);
    if (!question || !topicStats[question.topic]) {
      return;
    }

    answered += 1;
    topicStats[question.topic].answered += 1;
  });

  nextProgress.correctQuestionIds.forEach((questionId) => {
    const question = questionById.get(questionId);
    if (!question || !topicStats[question.topic]) {
      return;
    }

    correct += 1;
    topicStats[question.topic].correct += 1;
  });

  nextProgress.wrongQuestionIds.forEach((questionId) => {
    const question = questionById.get(questionId);
    if (!question || !topicStats[question.topic]) {
      return;
    }

    wrong += 1;
    topicStats[question.topic].wrong += 1;
  });

  return { answered, correct, wrong, topicStats };
}

function normalizeTopicStats(importedTopicStats = {}, fallbackTopicStats) {
  const topicStats = {};

  getPracticeTopics().forEach((topic) => {
    const importedStats = importedTopicStats[topic] || {};
    const fallbackStats = fallbackTopicStats[topic] || {};

    topicStats[topic] = {
      answered: getNonNegativeNumber(importedStats.answered, fallbackStats.answered || 0),
      correct: getNonNegativeNumber(importedStats.correct, fallbackStats.correct || 0),
      wrong: getNonNegativeNumber(importedStats.wrong, fallbackStats.wrong || 0),
    };
  });

  return topicStats;
}

function normalizeGameProgress(importedGameProgress = {}) {
  const emptyGameProgress = createEmptyProgress().gameProgress;
  const validTowerIds = new Set(mapData.towers.map((tower) => tower.id));
  const validFragmentIds = new Set(
    getOuterTowers()
      .map((tower) => tower.reward?.id)
      .filter(Boolean),
  );
  const position = importedGameProgress.playerPosition || emptyGameProgress.playerPosition;
  const keyFragments = getUniqueStringArray(importedGameProgress.keyFragments).filter(
    (fragmentId) => validFragmentIds.has(fragmentId),
  );
  const clearedTowerIds = getUniqueStringArray(importedGameProgress.clearedTowerIds).filter(
    (towerId) => validTowerIds.has(towerId),
  );
  const validChronicleIds = allChronicles.map((chronicle) => chronicle.id);

  // Save files keep permanent tower progress only; live HP is intentionally excluded.
  return {
    playerPosition: {
      x: clamp(Number(position.x) || emptyGameProgress.playerPosition.x, 0, 100),
      y: clamp(Number(position.y) || emptyGameProgress.playerPosition.y, 0, 100),
    },
    clearedTowerIds,
    towerProgress: GameRules.normalizeTowerProgress({
      importedTowerProgress: importedGameProgress.towerProgress,
      clearedTowerIds,
      outerTowers: getOuterTowers(),
      clearProgress: TOWER_CLEAR_PROGRESS,
    }),
    keyFragments,
    chronicles: GameRules.normalizeChronicleProgress(
      importedGameProgress.chronicles,
      getOrderedChronicles().map((chronicle) => chronicle.id),
      clearedTowerIds.length,
    ),
    hasCentralTowerKey: Boolean(importedGameProgress.hasCentralTowerKey),
    centralTowerUnlocked: Boolean(importedGameProgress.centralTowerUnlocked),
  };
}

// Chronicle rendering and navigation
function showChronicleScreen(chronicleId = null) {
  currentRun = null;
  mapScreenElement.hidden = true;
  practiceViewElement.hidden = true;
  chronicleScreenElement.hidden = false;

  renderChronicleList();

  if (chronicleId) {
    const selectedChronicle = getOrderedChronicles().find(
      (chronicle) => chronicle.id === chronicleId,
    );
    if (selectedChronicle) {
      startChronicleExperience(selectedChronicle);
      return;
    }
  }

  if (getOrderedChronicles().some((chronicle) => isChronicleUnlocked(chronicle))) {
    renderChronicleListHome();
  } else {
    renderEmptyChronicleReader();
  }
}

function renderChronicleList() {
  chronicleListElement.innerHTML = "";
  const orderedChronicles = getOrderedChronicles();
  const unlockedCount = orderedChronicles.filter((chronicle) =>
    isChronicleUnlocked(chronicle),
  ).length;
  const readCount = progress.gameProgress.chronicles.readChronicleIds.length;
  const summary = document.createElement("div");

  summary.className = "chronicle-list-summary";
  summary.innerHTML = `
    <strong>Recovered: ${unlockedCount} / ${orderedChronicles.length}</strong>
    <span>Witnessed: ${readCount} / ${orderedChronicles.length}</span>
  `;
  chronicleListElement.append(summary);

  orderedChronicles.forEach((chronicle) => {
    const unlocked = isChronicleUnlocked(chronicle);
    const read = progress.gameProgress.chronicles.readChronicleIds.includes(chronicle.id);
    const item = document.createElement("button");

    item.type = "button";
    item.className = [
      "chronicle-item",
      unlocked ? "is-unlocked" : "is-locked",
      read ? "is-read" : "",
    ]
      .filter(Boolean)
      .join(" ");
    item.disabled = !unlocked;
    item.innerHTML = `
      <span>Creation Record ${toRomanNumeral(chronicle.order)}</span>
      <strong>${unlocked ? chronicle.title : "Locked Record"}</strong>
      <small>${read ? "Witnessed" : unlocked ? "Recovered" : "Clear a new tower"}</small>
    `;

    if (unlocked) {
      item.addEventListener("click", () => startChronicleExperience(chronicle));
    }

    chronicleListElement.append(item);
  });
}

function startChronicleExperience(chronicle) {
  if (!isChronicleUnlocked(chronicle)) {
    renderEmptyChronicleReader();
    return;
  }

  currentChronicleExperience = {
    chronicle,
    lineIndex: 0,
    fragmentRevealed: false,
  };
  progress.gameProgress.chronicles.currentChronicleId = chronicle.id;
  renderChronicleExperience();
}

function renderChronicleExperience() {
  if (!currentChronicleExperience) {
    renderChronicleListHome();
    return;
  }

  const { chronicle, lineIndex, fragmentRevealed } = currentChronicleExperience;
  const dialogue = Array.isArray(chronicle.dialogue) ? chronicle.dialogue : [];
  const currentLine = dialogue[lineIndex];
  const speakerName = currentLine
    ? chronicle.speakers?.[currentLine.speaker] || currentLine.speaker
    : "";
  const eraLabel = `Age ${toRomanNumeral(chronicle.order)} - ${chronicle.title}`;
  const lineCount = dialogue.length;
  const progressText = lineCount > 0 ? `${Math.min(lineIndex + 1, lineCount)} / ${lineCount}` : "0 / 0";

  if (fragmentRevealed) {
    renderChronicleTimeFragment(chronicle, eraLabel);
    return;
  }

  chronicleReaderElement.innerHTML = `
    <div class="chronicle-record-header">
      <p class="section-label">Creation Record ${toRomanNumeral(chronicle.order)}</p>
      <span>Recovered</span>
    </div>
    <div class="chronicle-experience" role="button" tabindex="0" aria-label="Advance Chronicle dialogue">
      <p class="chronicle-step-count">${progressText}</p>
      <h3>${chronicle.title}</h3>
      <div class="chronicle-stage-line ${currentLine?.speaker === "G" ? "is-guide" : "is-sage"}">
        <span class="speaker-mark">${currentLine?.speaker || "?"}</span>
        <div class="speaker-script">
          <strong>${speakerName}</strong>
          <p>"${currentLine?.text || "The record is silent."}"</p>
        </div>
      </div>
      <div class="chronicle-actions">
        <button id="advance-chronicle" class="progress-button" type="button">
          ${lineIndex >= lineCount - 1 ? "Reveal Time Fragment" : "Next"}
        </button>
        <button id="return-records-action" class="back-button" type="button">Return to Creation Records</button>
      </div>
      <p class="chronicle-input-hint">Click the record, press Enter/Space, or use Next.</p>
    </div>
  `;

  chronicleReaderElement
    .querySelector(".chronicle-experience")
    .addEventListener("click", (event) => {
      if (event.target.closest("button")) {
        return;
      }
      advanceChronicleExperience();
    });
  chronicleReaderElement
    .querySelector("#advance-chronicle")
    .addEventListener("click", advanceChronicleExperience);
  chronicleReaderElement
    .querySelector("#return-records-action")
    .addEventListener("click", renderChronicleListHome);

  chronicleStatusElement.textContent = `${chronicle.title} is being witnessed.`;
}

function advanceChronicleExperience() {
  if (!currentChronicleExperience) {
    return;
  }

  const dialogue = Array.isArray(currentChronicleExperience.chronicle.dialogue)
    ? currentChronicleExperience.chronicle.dialogue
    : [];

  if (currentChronicleExperience.lineIndex < dialogue.length - 1) {
    currentChronicleExperience.lineIndex += 1;
    renderChronicleExperience();
    return;
  }

  currentChronicleExperience.fragmentRevealed = true;
  progress.gameProgress = GameRules.markChronicleRead(
    progress.gameProgress,
    currentChronicleExperience.chronicle.id,
  );
  renderChronicleList();
  renderChronicleCount();
  renderChronicleExperience();
}

function renderChronicleTimeFragment(chronicle, eraLabel) {
  const preview = chronicle.projectStage || {};

  chronicleReaderElement.innerHTML = `
    <div class="chronicle-record-header">
      <p class="section-label">Creation Record ${toRomanNumeral(chronicle.order)}</p>
      <span>Witnessed</span>
    </div>
    <div class="chronicle-fragment-reveal">
      <h3>The record opens a path through time...</h3>
      <div class="chronicle-project-stage">
        <h4>Observed Era</h4>
        <p class="era-title">${eraLabel}</p>
        <p class="time-fragment-label">Time Fragment Window</p>
        ${renderChroniclePreview(preview)}
        <p><strong>${preview.title || "Time fragment"}</strong></p>
        <p>${preview.caption || "A fragment of this era has not fully awakened yet."}</p>
      </div>
      <div class="chronicle-actions">
        <button id="close-time-fragment" class="progress-button" type="button">
          Return to Creation Records
        </button>
      </div>
    </div>
  `;

  chronicleReaderElement
    .querySelector("#close-time-fragment")
    .addEventListener("click", renderChronicleListHome);
  chronicleStatusElement.textContent = `${chronicle.title} witnessed.`;
}

function renderChronicleListHome() {
  currentChronicleExperience = null;
  renderChronicleList();
  renderChronicleCount();

  const orderedChronicles = getOrderedChronicles();
  const unlockedCount = orderedChronicles.filter((chronicle) =>
    isChronicleUnlocked(chronicle),
  ).length;
  const readCount = progress.gameProgress.chronicles.readChronicleIds.length;

  chronicleReaderElement.innerHTML = `
    <p class="section-label">Creation Records</p>
    <h3>Recovered: ${unlockedCount} / ${orderedChronicles.length}</h3>
    <div class="chronicle-record-grid" aria-hidden="true">
      ${orderedChronicles
        .map((chronicle) => {
          const unlocked = isChronicleUnlocked(chronicle);
          const read = progress.gameProgress.chronicles.readChronicleIds.includes(chronicle.id);
          return `<span class="${unlocked ? "is-recovered" : "is-locked"} ${read ? "is-witnessed" : ""}">${toRomanNumeral(chronicle.order)}</span>`;
        })
        .join("")}
    </div>
    <p>Select a recovered Creation Record from the list to witness its history one line at a time.</p>
    <p class="chronicle-input-hint">Witnessed records are marked after the Time Fragment appears.</p>
  `;

  chronicleStatusElement.textContent = "Choose a recovered Creation Record.";
}

function renderChroniclePreview(preview) {
  if (preview.previewType === "iframe" && preview.previewPath) {
    return `
      <iframe
        class="chronicle-preview-frame"
        src="${preview.previewPath}"
        title="${preview.title || "Time Fragment Window"}"
        loading="lazy"
      ></iframe>
    `;
  }

  if ((preview.previewType === "image" || preview.previewImage) && preview.previewImage) {
    return `<img src="${preview.previewImage}" alt="${preview.title || "Time fragment"}" />`;
  }

  return `
    <div class="chronicle-preview-placeholder">
      <span>Time fragment dormant</span>
      <small>${preview.previewPath || "A fragment of this era has not fully awakened yet."}</small>
    </div>
  `;
}

function renderEmptyChronicleReader() {
  currentChronicleExperience = null;
  chronicleReaderElement.innerHTML = `
    <p class="section-label">Record Chamber</p>
    <h3>No Chronicles unlocked yet</h3>
    <p>Clear an outer tower for the first time to reveal Chronicle I.</p>
  `;
  chronicleStatusElement.textContent = "Clear a new tower to unlock the first Chronicle.";
}

// Utility functions
function getUniqueStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((item) => typeof item === "string"))];
}

function getNonNegativeNumber(value, fallback) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return fallback;
  }

  return Math.round(numberValue);
}

function addUnique(list, value) {
  if (!list.includes(value)) {
    list.push(value);
  }
}

// Blacksmith and central tower unlock flow
function toggleBlacksmithPanel() {
  blacksmithPanelElement.hidden = !blacksmithPanelElement.hidden;
  renderBlacksmith();
}

function forgeCentralTowerKey() {
  const recipe = getBlacksmithRecipe();

  if (!GameRules.canForgeKey(progress.gameProgress, recipe)) {
    setMapStatus("Collect all 6 key fragments to forge the Central Tower Key.");
    renderBlacksmith();
    return;
  }

  progress.gameProgress = GameRules.forgeCentralKey(progress.gameProgress, recipe);
  setMapStatus("Central Tower Key forged. The Central Tower is now available.");
  renderMap();
}

function showLoadError(error) {
  questionListElement.innerHTML = "";
  errorMessageElement.hidden = false;
  errorMessageElement.textContent =
    "The map or question bank could not be loaded. Please run the project through a local web server and try again.";
  console.error(error);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toRomanNumeral(value) {
  const numerals = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  return numerals[value] || String(value);
}

// Startup
async function initializeExam() {
  try {
    [allQuestions, mapData, allChronicles] = await Promise.all([
      loadJson("questions.json"),
      loadJson("map.json"),
      loadJson("chronicles.json"),
    ]);
    progress = createEmptyProgress();
    renderMap();
    setMapStatus("Choose a tower to begin a run.");
  } catch (error) {
    showLoadError(error);
  }
}

backToMapButton.addEventListener("click", showMapScreen);
closeChroniclesButton.addEventListener("click", showMapScreen);
saveProgressButton.addEventListener("click", saveProgress);
loadProgressButton.addEventListener("click", requestProgressFile);
openChroniclesButton.addEventListener("click", () => showChronicleScreen());

document.addEventListener("keydown", (event) => {
  if (
    chronicleScreenElement.hidden ||
    !currentChronicleExperience ||
    currentChronicleExperience.fragmentRevealed ||
    !["Enter", " "].includes(event.key)
  ) {
    return;
  }

  event.preventDefault();
  advanceChronicleExperience();
});
progressFileInput.addEventListener("change", loadProgressFile);
gameMapElement.addEventListener("click", handleMapClick);
blacksmithButton.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleBlacksmithPanel();
});
forgeKeyButton.addEventListener("click", forgeCentralTowerKey);
initializeExam();
