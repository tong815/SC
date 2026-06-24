const topicHubElement = document.querySelector("#topic-hub");
const topicListElement = document.querySelector("#topic-list");
const practiceViewElement = document.querySelector("#practice-view");
const backToTopicsButton = document.querySelector("#back-to-topics");
const saveProgressButton = document.querySelector("#save-progress");
const loadProgressButton = document.querySelector("#load-progress");
const progressFileInput = document.querySelector("#progress-file");
const questionsAnsweredElement = document.querySelector("#questions-answered");
const correctAnswersElement = document.querySelector("#correct-answers");
const wrongAnswersElement = document.querySelector("#wrong-answers");
const accuracyPercentageElement = document.querySelector("#accuracy-percentage");
const progressMessageElement = document.querySelector("#progress-message");
const gameMapElement = document.querySelector("#game-map");
const mapPlayerElement = document.querySelector("#map-player");
const mapTowersElement = document.querySelector("#map-towers");
const mapStatusElement = document.querySelector("#map-status");
const blacksmithButton = document.querySelector("#blacksmith-button");
const blacksmithPanelElement = document.querySelector("#blacksmith-panel");
const fragmentCountElement = document.querySelector("#fragment-count");
const forgeKeyButton = document.querySelector("#forge-key");
const questionListElement = document.querySelector("#question-list");
const questionListTitleElement = document.querySelector("#question-list-title");
const questionCountElement = document.querySelector("#question-count");
const errorMessageElement = document.querySelector("#error-message");

const APP_NAME = "Exam Visualizer";
const SAVE_FILE_VERSION = "2.0";
const ALL_QUESTIONS_TOPIC = "All Questions";

let allQuestions = [];
let mapData = null;
let progress = null;

async function loadJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Unable to load ${path} (HTTP ${response.status}).`);
  }

  return response.json();
}

function getOuterTowers() {
  return mapData.towers.filter((tower) => tower.type === "outer");
}

function getPracticeTopics() {
  return getOuterTowers().map((tower) => tower.topic);
}

function getTopicList() {
  return [ALL_QUESTIONS_TOPIC, ...getPracticeTopics()];
}

function createEmptyProgress() {
  const topicStats = {};

  getPracticeTopics().forEach((topic) => {
    topicStats[topic] = {
      answered: 0,
      correct: 0,
      wrong: 0,
    };
  });

  return {
    totalQuestionsAnswered: 0,
    totalCorrectAnswers: 0,
    totalWrongAnswers: 0,
    answeredQuestionIds: [],
    correctQuestionIds: [],
    wrongQuestionIds: [],
    topicStats,
    gameProgress: {
      playerPosition: {
        x: mapData.playerStart.x,
        y: mapData.playerStart.y,
      },
      clearedTowerIds: [],
      keyFragments: [],
      hasCentralTowerKey: false,
      centralTowerUnlocked: false,
    },
  };
}

function renderTopicHub(questions) {
  topicListElement.innerHTML = "";

  getTopicList().forEach((topic) => {
    const topicQuestions = getQuestionsForTopic(questions, topic);
    const card = document.createElement("button");
    card.className = "topic-card";
    card.type = "button";
    card.dataset.topic = topic;
    card.innerHTML = `
      <span class="topic-card-title">${topic}</span>
      <span class="topic-card-count">${topicQuestions.length} questions</span>
    `;

    card.addEventListener("click", () => showPracticeTopic(topic));
    topicListElement.append(card);
  });
}

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
      <span class="tower-icon">${tower.type === "central" ? "★" : "▲"}</span>
      <span class="tower-name">${tower.name}</span>
    `;
    towerButton.addEventListener("click", (event) => {
      event.stopPropagation();
      handleTowerClick(tower);
    });

    mapTowersElement.append(towerButton);
  });

  renderPlayerPosition();
  renderBlacksmith();
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

function getBlacksmithRecipe() {
  return mapData.shops[0].recipe;
}

function handleMapClick(event) {
  const rect = gameMapElement.getBoundingClientRect();
  const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
  const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);

  movePlayerTo(x, y);
  setMapStatus("Player moved.");
}

function handleTowerClick(tower) {
  movePlayerTo(tower.x, tower.y);

  if (!GameRules.canAccessTower(progress.gameProgress, tower)) {
    setMapStatus(
      "The Central Tower is locked. Clear all six outer towers and forge the key first.",
    );
    return;
  }

  setMapStatus(`${tower.name} opened.`);
  showPracticeTopic(tower.topic);
}

function movePlayerTo(x, y) {
  progress.gameProgress.playerPosition = {
    x: Math.round(x),
    y: Math.round(y),
  };
  renderPlayerPosition();
}

function clearTowerForTopic(topic) {
  const tower = getOuterTowers().find((candidate) => candidate.topic === topic);

  if (!tower || GameRules.isTowerCleared(progress.gameProgress, tower.id)) {
    return;
  }

  progress.gameProgress = GameRules.onCorrectAnswer(progress.gameProgress, tower);
  setMapStatus(`${tower.name} cleared. Key fragment collected.`);
  renderMap();
}

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

function updateProgress(question, isCorrect) {
  if (progress.answeredQuestionIds.includes(question.id)) {
    return false;
  }

  progress.answeredQuestionIds.push(question.id);
  progress.totalQuestionsAnswered += 1;

  if (!progress.topicStats[question.topic]) {
    progress.topicStats[question.topic] = {
      answered: 0,
      correct: 0,
      wrong: 0,
    };
  }

  progress.topicStats[question.topic].answered += 1;

  if (isCorrect) {
    progress.correctQuestionIds.push(question.id);
    progress.totalCorrectAnswers += 1;
    progress.topicStats[question.topic].correct += 1;
    clearTowerForTopic(question.topic);
  } else {
    progress.wrongQuestionIds.push(question.id);
    progress.totalWrongAnswers += 1;
    progress.topicStats[question.topic].wrong += 1;
  }

  renderProgress();
  return true;
}

function renderProgress() {
  const accuracy =
    progress.totalQuestionsAnswered === 0
      ? 0
      : Math.round(
          (progress.totalCorrectAnswers / progress.totalQuestionsAnswered) * 100,
        );

  questionsAnsweredElement.textContent = progress.totalQuestionsAnswered;
  correctAnswersElement.textContent = progress.totalCorrectAnswers;
  wrongAnswersElement.textContent = progress.totalWrongAnswers;
  accuracyPercentageElement.textContent = `${accuracy}%`;
}

function setProgressMessage(message) {
  progressMessageElement.textContent = message;
}

function setMapStatus(message) {
  mapStatusElement.textContent = message;
}

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
      renderProgress();
      renderMap();
      renderTopicHub(allQuestions);
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

  answeredIds.forEach((questionId) => {
    const question = questionById.get(questionId);

    if (!question) {
      return;
    }

    nextProgress.answeredQuestionIds.push(questionId);
    nextProgress.totalQuestionsAnswered += 1;
    nextProgress.topicStats[question.topic].answered += 1;
  });

  correctIds.forEach((questionId) => {
    const question = questionById.get(questionId);

    if (!question || !nextProgress.answeredQuestionIds.includes(questionId)) {
      return;
    }

    nextProgress.correctQuestionIds.push(questionId);
    nextProgress.totalCorrectAnswers += 1;
    nextProgress.topicStats[question.topic].correct += 1;
  });

  wrongIds.forEach((questionId) => {
    const question = questionById.get(questionId);

    if (
      !question ||
      !nextProgress.answeredQuestionIds.includes(questionId) ||
      nextProgress.correctQuestionIds.includes(questionId)
    ) {
      return;
    }

    nextProgress.wrongQuestionIds.push(questionId);
    nextProgress.totalWrongAnswers += 1;
    nextProgress.topicStats[question.topic].wrong += 1;
  });

  nextProgress.gameProgress = normalizeGameProgress(importedProgress.gameProgress);
  return nextProgress;
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

  return {
    playerPosition: {
      x: clamp(Number(position.x) || emptyGameProgress.playerPosition.x, 0, 100),
      y: clamp(Number(position.y) || emptyGameProgress.playerPosition.y, 0, 100),
    },
    clearedTowerIds: getUniqueStringArray(importedGameProgress.clearedTowerIds).filter(
      (towerId) => validTowerIds.has(towerId),
    ),
    keyFragments,
    hasCentralTowerKey: Boolean(importedGameProgress.hasCentralTowerKey),
    centralTowerUnlocked: Boolean(importedGameProgress.centralTowerUnlocked),
  };
}

function getUniqueStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((item) => typeof item === "string"))];
}

function getQuestionsForTopic(questions, topic) {
  if (topic === ALL_QUESTIONS_TOPIC) {
    return questions;
  }

  return questions.filter((question) => question.topic === topic);
}

function showPracticeTopic(topic) {
  const questions = getQuestionsForTopic(allQuestions, topic);

  topicHubElement.hidden = true;
  practiceViewElement.hidden = false;
  questionListTitleElement.textContent = topic;
  renderQuestions(questions);
}

function showTopicHub() {
  practiceViewElement.hidden = true;
  topicHubElement.hidden = false;
  questionListElement.innerHTML = "";
  questionCountElement.textContent = "";
}

function renderQuestions(questions) {
  questionListElement.innerHTML = "";
  questionCountElement.textContent = `${questions.length} questions`;

  questions.forEach((question, questionIndex) => {
    questionListElement.append(createQuestionCard(question, questionIndex));
  });
}

function createQuestionCard(question, questionIndex) {
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
      <span class="question-number">Question ${questionIndex + 1}</span>
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
    button.addEventListener("click", () => handleAnswer(question, card, button));
  });

  return card;
}

function handleAnswer(question, card, selectedButton) {
  const optionButtons = card.querySelectorAll(".option-button");
  const selectedAnswer = selectedButton.dataset.optionId;
  const isCorrect = selectedAnswer === question.answer;
  const correctOption = question.options.find(
    (option) => option.id === question.answer,
  );

  optionButtons.forEach((button) => {
    button.disabled = true;

    if (button.dataset.optionId === question.answer) {
      button.classList.add("is-correct");
    }
  });

  if (!isCorrect) {
    selectedButton.classList.add("is-incorrect");
  }

  const wasCounted = updateProgress(question, isCorrect);

  const feedbackElement = card.querySelector(".feedback");
  feedbackElement.hidden = false;
  feedbackElement.className = `feedback ${isCorrect ? "correct" : "incorrect"}`;
  feedbackElement.innerHTML = `
    <p class="feedback-status">${isCorrect ? "Correct" : "Incorrect"}</p>
    <p class="feedback-answer">
      <strong>Correct answer:</strong> ${correctOption.id}. ${correctOption.text}
    </p>
    <p class="feedback-explanation">
      <strong>Explanation:</strong> ${question.explanation}
    </p>
  `;

  if (wasCounted) {
    setProgressMessage("Progress updated.");
  } else {
    setProgressMessage("This question was already counted in your progress.");
  }
}

function showLoadError(error) {
  topicListElement.innerHTML = "";
  questionListElement.innerHTML = "";
  questionCountElement.textContent = "";
  errorMessageElement.hidden = false;
  errorMessageElement.textContent =
    "The map or question bank could not be loaded. Please run the project through a local web server and try again.";
  console.error(error);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

async function initializeExam() {
  try {
    [allQuestions, mapData] = await Promise.all([
      loadJson("questions.json"),
      loadJson("map.json"),
    ]);
    progress = createEmptyProgress();
    renderMap();
    renderTopicHub(allQuestions);
    renderProgress();
    setMapStatus("Choose a tower or click anywhere to move.");
  } catch (error) {
    showLoadError(error);
  }
}

backToTopicsButton.addEventListener("click", showTopicHub);
saveProgressButton.addEventListener("click", saveProgress);
loadProgressButton.addEventListener("click", requestProgressFile);
progressFileInput.addEventListener("change", loadProgressFile);
gameMapElement.addEventListener("click", handleMapClick);
blacksmithButton.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleBlacksmithPanel();
});
forgeKeyButton.addEventListener("click", forgeCentralTowerKey);
initializeExam();
