window.HistoryPreview = {
  normalizeMode(value) {
    return value === "difficult" ? "difficult" : "easy";
  },

  getRequestedMode() {
    const params = new URLSearchParams(window.location.search);
    return HistoryPreview.normalizeMode(
      params.get("curriculum") || params.get("mode") || "easy"
    );
  },

  async loadCurriculumContext() {
    const mode = HistoryPreview.getRequestedMode();

    try {
      const [configResponse, questionsResponse, mapResponse] = await Promise.all([
        fetch("../../curriculum/curriculum-config.json"),
        fetch("../../curriculum/question-bank.json"),
        fetch("../../engine/world-map.json")
      ]);

      if (!configResponse.ok || !questionsResponse.ok || !mapResponse.ok) {
        throw new Error("Curriculum files could not be loaded.");
      }

      const curriculumConfig = await configResponse.json();
      const questions = await questionsResponse.json();
      const worldMap = await mapResponse.json();
      const curriculum = curriculumConfig[mode] || curriculumConfig.easy;
      const towerIds = Object.keys(curriculum.towerTopics || {});
      const towers = towerIds.map((towerId) => {
        const mapTower = (worldMap.towers || []).find((tower) => tower.id === towerId) || {};
        const topic = curriculum.towerTopics[towerId];
        return {
          id: towerId,
          topic,
          name: curriculum.towerNames?.[towerId] || mapTower.name || topic,
          description: curriculum.towerDescriptions?.[towerId] || mapTower.description || "",
          x: Number(mapTower.x) || 50,
          y: Number(mapTower.y) || 50,
          rewardId: mapTower.reward?.id || towerId.replace("tower-", "fragment-")
        };
      });

      return {
        mode,
        label: curriculum.label || "Easy Mode",
        shortLabel: curriculum.shortLabel || "Easy",
        description: curriculum.description || "",
        towers,
        questions
      };
    } catch (error) {
      console.warn("History preview fallback:", error);
      return HistoryPreview.createFallbackContext(mode);
    }
  },

  createFallbackContext(mode = "easy") {
    const fallbackTowers = [
      { id: "tower-fractions", topic: "Addition", name: "Addition Tower", x: 25, y: 25, rewardId: "fragment-addition" },
      { id: "tower-integers", topic: "Subtraction", name: "Subtraction Tower", x: 75, y: 25, rewardId: "fragment-subtraction" },
      { id: "tower-percent", topic: "Multiplication", name: "Multiplication Tower", x: 85, y: 50, rewardId: "fragment-multiplication" },
      { id: "tower-algebra", topic: "Division", name: "Division Tower", x: 75, y: 75, rewardId: "fragment-division" },
      { id: "tower-geometry", topic: "Mixed Basic Operations", name: "Mixed Basic Tower", x: 25, y: 75, rewardId: "fragment-mixed-basic" },
      { id: "tower-ratios", topic: "Mixed Advanced Operations", name: "Mixed Advanced Tower", x: 15, y: 50, rewardId: "fragment-mixed-advanced" }
    ];

    return {
      mode: HistoryPreview.normalizeMode(mode),
      label: "Easy Mode",
      shortLabel: "Easy",
      description: "Fallback arithmetic preview.",
      towers: fallbackTowers,
      questions: [
        {
          id: "fallback-addition",
          topic: "Addition",
          title: "Addition",
          question: "What is 6 + 4?",
          options: [
            { id: "A", text: "8" },
            { id: "B", text: "9" },
            { id: "C", text: "10" },
            { id: "D", text: "12" }
          ],
          answer: "C",
          difficulty: "easy"
        }
      ]
    };
  },

  getQuestionsForTopic(context, topic) {
    const matching = context.questions.filter((question) => (
      question.topic === topic && HistoryPreview.normalizeMode(question.difficulty) === context.mode
    ));
    return matching.length ? matching : context.questions.filter((question) => question.topic === topic);
  },

  getSampleQuestion(context, topic) {
    const towerTopic = topic || context.towers[0]?.topic;
    const question = HistoryPreview.getQuestionsForTopic(context, towerTopic)[0] || context.questions[0];
    return HistoryPreview.normalizeQuestion(question, towerTopic);
  },

  normalizeQuestion(question, fallbackTopic = "Question") {
    const options = Array.isArray(question?.options) ? question.options : [];
    const answerOption = options.find((option) => option.id === question.answer);

    return {
      title: question?.title || `${fallbackTopic} Sample`,
      prompt: question?.question || question?.prompt || "What is 6 + 4?",
      choices: options.length ? options.map((option) => option.text) : question?.choices || ["8", "9", "10", "12"],
      answer: answerOption?.text || question?.answer || "10"
    };
  },

  showLoadError(target) {
    target.innerHTML = `
      <h2>Preview Still Loading</h2>
      <p class="feedback bad">This Time Fragment could not read the curriculum files, so it is showing a safe fallback.</p>
    `;
  },

  markChoice(button, isCorrect, feedbackElement, correctText = "Correct!", wrongText = "Try again.") {
    button
      .closest(".choices")
      .querySelectorAll(".choice")
      .forEach((choice) => choice.classList.remove("is-correct", "is-wrong"));

    button.classList.add(isCorrect ? "is-correct" : "is-wrong");
    feedbackElement.textContent = isCorrect ? correctText : wrongText;
    feedbackElement.className = `feedback ${isCorrect ? "good" : "bad"}`;
  },

  setSelected(container, selectedElement, selectedClass) {
    container
      .querySelectorAll(`.${selectedClass}`)
      .forEach((item) => item.classList.remove(selectedClass));
    selectedElement.classList.add(selectedClass);
  },

  makeQuestion(target, question) {
    target.innerHTML = `
      <h2>${question.title}</h2>
      <p class="soft-text">${question.prompt}</p>
      <div class="choices">
        ${question.choices.map((choice) => `
          <button class="choice" type="button" data-answer="${choice}">${choice}</button>
        `).join("")}
      </div>
      <p class="feedback" aria-live="polite"></p>
    `;

    const feedback = target.querySelector(".feedback");
    target.querySelectorAll(".choice").forEach((button) => {
      button.addEventListener("click", () => {
        const isCorrect = button.dataset.answer === question.answer;
        HistoryPreview.markChoice(
          button,
          isCorrect,
          feedback,
          "Correct. The old prototype lights up.",
          `Not yet. The answer is ${question.answer}.`
        );
      });
    });
  }
};
