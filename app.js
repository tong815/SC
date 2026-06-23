const topicHubElement = document.querySelector("#topic-hub");
const topicListElement = document.querySelector("#topic-list");
const practiceViewElement = document.querySelector("#practice-view");
const backToTopicsButton = document.querySelector("#back-to-topics");
const questionListElement = document.querySelector("#question-list");
const questionListTitleElement = document.querySelector("#question-list-title");
const questionCountElement = document.querySelector("#question-count");
const errorMessageElement = document.querySelector("#error-message");

const TOPICS = [
  "All Questions",
  "Fractions",
  "Integers",
  "Percent",
  "Algebra",
  "Geometry",
  "Ratios",
];

let allQuestions = [];

/**
 * Data layer:
 * questions.json is the single source of question content.
 * This function imports that structured data without knowing how it will look.
 */
async function loadQuestions() {
  const response = await fetch("questions.json");

  if (!response.ok) {
    throw new Error(`Unable to load questions (HTTP ${response.status}).`);
  }

  return response.json();
}

/**
 * Visualization layer:
 * These functions transform each JSON question into interactive HTML.
 * Keeping rendering separate from data makes other question types easier to add.
 */
function renderTopicHub(questions) {
  topicListElement.innerHTML = "";

  TOPICS.forEach((topic) => {
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

function getQuestionsForTopic(questions, topic) {
  if (topic === "All Questions") {
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
}

function showLoadError(error) {
  topicListElement.innerHTML = "";
  questionListElement.innerHTML = "";
  questionCountElement.textContent = "";
  errorMessageElement.hidden = false;
  errorMessageElement.textContent =
    "The question bank could not be loaded. Please run the project through a local web server and try again.";
  console.error(error);
}

async function initializeExam() {
  try {
    allQuestions = await loadQuestions();
    renderTopicHub(allQuestions);
  } catch (error) {
    showLoadError(error);
  }
}

backToTopicsButton.addEventListener("click", showTopicHub);
initializeExam();
