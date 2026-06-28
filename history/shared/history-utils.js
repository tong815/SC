const HistoryPreview = {
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
