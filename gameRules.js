const GameRules = (() => {
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

  return {
    isTowerCleared,
    awardTowerReward,
    canForgeKey,
    forgeCentralKey,
    isCentralTowerUnlocked,
    canAccessTower,
    onCorrectAnswer,
  };
})();
