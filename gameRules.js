const GameRules = (() => {
  // Pure/reusable game rules. This file must not read or write the DOM.

  function createDefaultPlayerProgress({ playerStart, practiceTopics, outerTowers }) {
    const topicStats = {};
    const towerProgress = {};

    practiceTopics.forEach((topic) => {
      topicStats[topic] = {
        answered: 0,
        correct: 0,
        wrong: 0,
      };
    });

    outerTowers.forEach((tower) => {
      towerProgress[tower.id] = createDefaultTowerProgress();
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
          x: playerStart.x,
          y: playerStart.y,
        },
        clearedTowerIds: [],
        towerProgress,
        keyFragments: [],
        team: {
          size: 1,
          members: ["Explorer 1"],
        },
        chronicles: createDefaultChronicleProgress(),
        hasCentralTowerKey: false,
        centralTowerUnlocked: false,
      },
    };
  }

  function createDefaultTowerProgress() {
    return {
      cleared: false,
      clearCount: 0,
      bestRunProgress: 0,
      lastPlayedAt: null,
    };
  }

  function createDefaultChronicleProgress() {
    return {
      unlockedChronicleIds: [],
      readChronicleIds: [],
      currentChronicleId: null,
      lastUnlockedChronicleId: null,
    };
  }

  function normalizeChronicleProgress(
    importedChronicles = {},
    validChronicleIds = [],
    fallbackUnlockedCount = 0,
  ) {
    const validIds = new Set(validChronicleIds);
    let unlockedChronicleIds = getUniqueStringArray(
      importedChronicles.unlockedChronicleIds,
    ).filter((chronicleId) => validIds.has(chronicleId));

    if (unlockedChronicleIds.length === 0 && fallbackUnlockedCount > 0) {
      unlockedChronicleIds = validChronicleIds.slice(0, fallbackUnlockedCount);
    }

    const readChronicleIds = getUniqueStringArray(
      importedChronicles.readChronicleIds,
    ).filter(
      (chronicleId) =>
        validIds.has(chronicleId) && unlockedChronicleIds.includes(chronicleId),
    );
    const currentChronicleId = validIds.has(importedChronicles.currentChronicleId)
      ? importedChronicles.currentChronicleId
      : unlockedChronicleIds.at(-1) || null;
    const lastUnlockedChronicleId = validIds.has(importedChronicles.lastUnlockedChronicleId)
      ? importedChronicles.lastUnlockedChronicleId
      : currentChronicleId;

    return {
      unlockedChronicleIds,
      readChronicleIds,
      currentChronicleId,
      lastUnlockedChronicleId,
    };
  }

  function normalizeTowerProgress({
    importedTowerProgress = {},
    clearedTowerIds = [],
    outerTowers,
    clearProgress,
  }) {
    const towerProgress = {};

    outerTowers.forEach((tower) => {
      const importedTower = importedTowerProgress[tower.id] || {};
      const isCleared =
        Boolean(importedTower.cleared) || clearedTowerIds.includes(tower.id);

      towerProgress[tower.id] = {
        cleared: isCleared,
        clearCount: getNonNegativeNumber(importedTower.clearCount, isCleared ? 1 : 0),
        bestRunProgress: clamp(
          getNonNegativeNumber(
            importedTower.bestRunProgress,
            isCleared ? clearProgress : 0,
          ),
          0,
          clearProgress,
        ),
        lastPlayedAt:
          typeof importedTower.lastPlayedAt === "string"
            ? importedTower.lastPlayedAt
            : null,
      };
    });

    return towerProgress;
  }

  function calculateSealEnergyGain(streak) {
    return Math.max(0, Math.round(Number(streak) || 0));
  }

  function isTowerRunCleared(runProgress, clearProgress) {
    return runProgress >= clearProgress;
  }

  function isTowerCleared(state, towerId) {
    return state.clearedTowerIds.includes(towerId);
  }

  function awardTowerReward(state, tower) {
    if (tower.reward?.type !== "keyFragment") {
      return state;
    }

    if (!state.keyFragments.includes(tower.reward.id)) {
      state.keyFragments.push(tower.reward.id);
    }

    return state;
  }

  function clearTower(state, tower) {
    if (!tower || isTowerCleared(state, tower.id)) {
      return state;
    }

    state.clearedTowerIds.push(tower.id);
    return awardTowerReward(state, tower);
  }

  function hasAllFragments(state, recipe) {
    return recipe.input.every((fragmentId) => state.keyFragments.includes(fragmentId));
  }

  function canForgeKey(state, recipe) {
    return hasAllFragments(state, recipe) && !state.hasCentralTowerKey;
  }

  function forgeCentralKey(state, recipe) {
    if (!canForgeKey(state, recipe)) {
      return state;
    }

    state.hasCentralTowerKey = true;
    state.centralTowerUnlocked = true;
    return state;
  }

  function isCentralTowerUnlocked(state) {
    return state.centralTowerUnlocked;
  }

  function canAccessTower(state, tower) {
    if (tower.type !== "central") {
      return true;
    }

    return isCentralTowerUnlocked(state);
  }

  function onCorrectAnswer(state, tower) {
    if (!tower) {
      return state;
    }

    return clearTower(state, tower);
  }

  function updateTowerRunProgress(state, tower, { runProgress, wasCleared, playedAt }) {
    if (!state.towerProgress[tower.id]) {
      state.towerProgress[tower.id] = createDefaultTowerProgress();
    }

    const savedTower = state.towerProgress[tower.id];

    savedTower.lastPlayedAt = playedAt;
    savedTower.bestRunProgress = Math.max(savedTower.bestRunProgress, runProgress);

    if (wasCleared) {
      savedTower.cleared = true;
      savedTower.clearCount += 1;
    }

    return state;
  }

  function unlockNextChronicle(state, chronicles) {
    if (!state.chronicles) {
      state.chronicles = createDefaultChronicleProgress();
    }

    const unlockedIds = state.chronicles.unlockedChronicleIds;
    const nextChronicle = [...chronicles]
      .sort((first, second) => first.order - second.order)
      .find((chronicle) => !unlockedIds.includes(chronicle.id));

    if (!nextChronicle) {
      return { state, chronicle: null };
    }

    unlockedIds.push(nextChronicle.id);
    state.chronicles.currentChronicleId = nextChronicle.id;
    state.chronicles.lastUnlockedChronicleId = nextChronicle.id;

    return { state, chronicle: nextChronicle };
  }

  function markChronicleRead(state, chronicleId) {
    if (!state.chronicles) {
      state.chronicles = createDefaultChronicleProgress();
    }

    if (
      state.chronicles.unlockedChronicleIds.includes(chronicleId) &&
      !state.chronicles.readChronicleIds.includes(chronicleId)
    ) {
      state.chronicles.readChronicleIds.push(chronicleId);
    }

    state.chronicles.currentChronicleId = chronicleId;
    return state;
  }

  function getNonNegativeNumber(value, fallback) {
    const numberValue = Number(value);

    if (!Number.isFinite(numberValue) || numberValue < 0) {
      return fallback;
    }

    return Math.round(numberValue);
  }

  function getUniqueStringArray(value) {
    if (!Array.isArray(value)) {
      return [];
    }

    return [...new Set(value.filter((item) => typeof item === "string"))];
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  return {
    calculateSealEnergyGain,
    createDefaultPlayerProgress,
    createDefaultChronicleProgress,
    createDefaultTowerProgress,
    isTowerCleared,
    isTowerRunCleared,
    markChronicleRead,
    awardTowerReward,
    canForgeKey,
    forgeCentralKey,
    isCentralTowerUnlocked,
    canAccessTower,
    normalizeTowerProgress,
    normalizeChronicleProgress,
    onCorrectAnswer,
    unlockNextChronicle,
    updateTowerRunProgress,
  };
})();
