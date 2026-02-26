/*
Names: Noah Mills & Jacob Zychowicz
Date: Feb 12, 2026
Description: Scripting for Tree Clicker including main game functionality
*/

window.addEventListener("load", function () {
  // game vars
  let leaves = 0;
  let clickValue = 1;

  let glovesOwned = 0;
  let ladderOwned = 0;
  let compostOwned = 0;
  let autoOwned = 0;

  let autoTimer = null;
  let autoSpeed = 0;

  // rewards
  let rewardThresholds = [50, 200, 600, 1500, 3000];
  let rewardNames = [
    "Tiny Sprout",
    "Sapling",
    "Healthy Tree",
    "Mini Grove",
    "Forest Keeper",
  ];
  let rewardIcons = ["🌱", "🌿", "🌳", "🌲", "🏆"];
  let rewardEarned = [false, false, false, false, false];

  // DOM elements
  let leavesValueEl = document.getElementById("leavesValue");
  let clickValueEl = document.getElementById("clickValue");
  let upgradesOwnedEl = document.getElementById("upgradesOwned");
  let autoSpeedEl = document.getElementById("autoSpeed");

  let upgradesListEl = document.getElementById("upgradesList");
  let rewardsListEl = document.getElementById("rewardsList");

  let treeBtn = document.getElementById("treeBtn");

  let nextRewardLabelEl = document.getElementById("nextRewardLabel");

  let helpBtn = document.getElementById("helpBtn");
  let helpPanel = document.getElementById("helpPanel");
  let helpContent = document.getElementById("helpContent");

  let toastEl = document.getElementById("toast");

  /**
   * Displays a temporary message on the screen.
   *
   * @param {String} text - The message to display in the toast notification.
   * @returns {void}
   */
  function showToast(text) {
    toastEl.textContent = text;
    toastEl.classList.add("show");

    setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2000);
  }

  /**
   * Updates the display showing the current auto-click rate in leaves per second.
   * Calculates the rate based on auto speed and current click value.
   *
   * @returns {void}
   */
  function autoSpeedTextUpdate() {
    if (autoOwned > 0) {
      autoSpeedEl.textContent =
        autoSpeed == 2000
          ? clickValue / 2 + " l/s"
          : autoSpeed == 1000
            ? clickValue + " l/s"
            : clickValue * 2 + " l/s";
    }
  }

  /**
   * Calculates the total number of upgrades owned.
   *
   * @param {void}
   * @returns {Number} The total upgrades purchased by the player.
   */
  function totalUpgrades() {
    return glovesOwned + ladderOwned + compostOwned + autoOwned;
  }

  /**
   * Starts or updates the auto-click timer based on upgrades owned.
   *
   * @param {void}
   * @returns {void}
   */
  function updateAuto() {
    if (autoOwned == 0) {
      autoSpeed = 0;
      autoSpeedEl.textContent = "Off";
      return;
    }

    if (autoOwned == 1) {
      autoSpeed = 2000;
    } else if (autoOwned == 2) {
      autoSpeed = 1000;
    } else {
      autoSpeed = 500;
    }

    autoSpeedTextUpdate();

    if (autoTimer != null) clearInterval(autoTimer);

    autoTimer = setInterval(function () {
      leaves += clickValue;
      updateView();
      checkRewards();
    }, autoSpeed);
  }

  /**
   * Updates the progress display for the next reward milestone.
   *
   * @param {void}
   * @returns {void}
   */
  function updateNextReward() {
    for (let i = 0; i < rewardThresholds.length; i++) {
      if (!rewardEarned[i]) {
        nextRewardLabelEl.textContent = leaves + " / " + rewardThresholds[i];

        return;
      }
    }

    nextRewardLabelEl.textContent = "All rewards earned";
  }

  /**
   * Updates all visual elements to match the current game state.
   *
   * @param {void}
   * @returns {void}
   */
  function updateView() {
    leavesValueEl.textContent = leaves;
    clickValueEl.textContent = clickValue;
    upgradesOwnedEl.textContent = totalUpgrades();

    updateNextReward();
    autoSpeedTextUpdate();
    renderUpgrades();
  }

  /**
   * Renders all reward badges in the rewards area.
   *
   * @param {void}
   * @returns {void}
   */
  function renderRewards() {
    rewardsListEl.innerHTML = "";

    for (let i = 0; i < rewardNames.length; i++) {
      let badge = document.createElement("div");
      badge.className = "badge";

      if (rewardEarned[i]) badge.className += " earned";

      badge.innerHTML =
        "<div>" +
        rewardIcons[i] +
        "</div>" +
        "<div><strong>" +
        rewardNames[i] +
        "</strong><br>" +
        rewardThresholds[i] +
        " leaves</div>";

      rewardsListEl.appendChild(badge);
    }
  }

  /**
   * Checks if any reward thresholds have been reached.
   *
   * @param {void}
   * @returns {void}
   */
  function checkRewards() {
    for (let i = 0; i < rewardThresholds.length; i++) {
      if (!rewardEarned[i] && leaves >= rewardThresholds[i]) {
        rewardEarned[i] = true;

        showToast("Reward unlocked: " + rewardNames[i]);

        renderRewards();
      }
    }
  }

  /**
   * Calculates the current cost of Gloves upgrade.
   *
   * @param {void}
   * @returns {Number} The cost of the next Gloves upgrade.
   */
  function glovesCost() {
    return Math.floor(25 * Math.pow(1.55, glovesOwned));
  }

  /**
   * Calculates the current cost of Ladder upgrade.
   *
   * @param {void}
   * @returns {Number} The cost of the next Ladder upgrade.
   */
  function ladderCost() {
    return Math.floor(120 * Math.pow(1.6, ladderOwned));
  }

  /**
   * Calculates the current cost of Compost upgrade.
   *
   * @param {void}
   * @returns {Number} The cost of the next Compost upgrade.
   */
  function compostCost() {
    return Math.floor(450 * Math.pow(1.7, compostOwned));
  }

  /**
   * Calculates the current cost of Auto Waterer upgrade.
   *
   * @param {void}
   * @returns {Number} The cost of the next Auto Waterer upgrade.
   */
  function autoCost() {
    return Math.floor(200 * Math.pow(2.0, autoOwned));
  }

  /**
   * Purchases Gloves upgrade if player can afford it.
   *
   * @param {void}
   * @returns {void}
   */
  function buyGloves() {
    let cost = glovesCost();

    if (leaves < cost) return;

    leaves -= cost;
    glovesOwned++;
    clickValue += 1;

    showToast("Bought Gloves");

    updateView();
  }

  /**
   * Purchases Ladder upgrade if player can afford it.
   *
   * @param {void}
   * @returns {void}
   */
  function buyLadder() {
    let cost = ladderCost();

    if (leaves < cost) return;

    leaves -= cost;
    ladderOwned++;
    clickValue += 3;

    showToast("Bought Ladder");

    updateView();
  }

  /**
   * Purchases Compost upgrade if player can afford it.
   *
   * @param {void}
   * @returns {void}
   */
  function buyCompost() {
    let cost = compostCost();

    if (leaves < cost) return;

    leaves -= cost;
    compostOwned++;
    clickValue += 10;

    showToast("Bought Compost");

    updateView();
  }

  /**
   * Purchases Auto Waterer upgrade if player can afford it.
   *
   * @param {void}
   * @returns {void}
   */
  function buyAuto() {
    let cost = autoCost();

    if (leaves < cost) return;

    leaves -= cost;
    autoOwned++;

    showToast("Bought Auto Waterer");

    updateAuto();
    updateView();
  }

  /**
   * Renders all upgrade rows in the upgrades area.
   *
   * @param {void}
   * @returns {void}
   */
  function renderUpgrades() {
    upgradesListEl.innerHTML = "";

    createUpgrade("🧤 Gloves (+1 click)", glovesCost(), glovesOwned, buyGloves);
    createUpgrade("🪜 Ladder (+3 click)", ladderCost(), ladderOwned, buyLadder);
    createUpgrade(
      "🌿 Compost (+10 click)",
      compostCost(),
      compostOwned,
      buyCompost,
    );
    createUpgrade("💧 Auto Waterer", autoCost(), autoOwned, buyAuto);
  }

  /**
   * Creates a single upgrade row in the upgrades list.
   *
   * @param {String} name - The display name of the upgrade.
   * @param {Number} cost - The cost required to purchase the upgrade.
   * @param {Number} ownedCount - How many of this upgrade the player owns.
   * @param {Function} buyFunction - The function executed when the Buy button is clicked.
   * @returns {void}
   */
  function createUpgrade(name, cost, ownedCount, buyFunction) {
    let row = document.createElement("div");
    row.className = "upgradeRow";

    let text = document.createElement("div");
    text.innerHTML =
      "<strong>" +
      name +
      "</strong><br>" +
      "Cost: " +
      cost +
      "<br>" +
      "Owned: " +
      ownedCount;

    let btn = document.createElement("button");
    btn.textContent = "Buy";
    btn.className = "btn";

    if (leaves < cost) btn.disabled = true;

    btn.addEventListener("click", buyFunction);

    row.appendChild(text);
    row.appendChild(btn);

    upgradesListEl.appendChild(row);
  }

  // tree clicking
  treeBtn.addEventListener("click", function () {
    leaves += clickValue;

    updateView();
    checkRewards();
  });

  // help button
  helpBtn.addEventListener("click", function () {
    if (helpPanel.hidden) {
      helpPanel.hidden = false;

      helpContent.innerHTML =
        "<strong>How to Play:</strong><br>" +
        "Click the tree to collect leaves. Each click gives you leaves based on your current click value.<br><br>" +
        "<strong>Upgrades:</strong><br>" +
        "Spend leaves to buy upgrades that increase the number of leaves you earn per click. " +
        "You can also purchase the Auto Waterer, which automatically collects leaves over time. " +
        "Buying it again makes it run faster.<br><br>" +
        "<strong>Rewards:</strong><br>" +
        "As you collect more leaves, you unlock rewards and your tree grows through new stages. " +
        "Try to earn all rewards and become the ultimate Forest Keeper!";

      helpBtn.textContent = "Close Help";
    } else {
      helpPanel.hidden = true;
      helpBtn.textContent = "Help";
    }
  });

  renderRewards();
  updateView();
  console.log(autoSpeed);
});
