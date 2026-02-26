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
    "Forest Keeper"
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

  // basic functions.
  function showToast(text) {
    toastEl.textContent = text;
    toastEl.classList.add("show");

    setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2000);
  }

  function autoSpeedTextUpdate() {
    if (autoOwned > 0) {
      autoSpeedEl.textContent =
        autoSpeed == 2000 ? clickValue/2+" l/s" :
        autoSpeed == 1000 ? clickValue+" l/s" : clickValue*2+" l/s";
    }
  }

  function totalUpgrades() {
    return glovesOwned + ladderOwned + compostOwned + autoOwned;
  }

  function updateAuto() {

    if (autoOwned == 0) {
      autoSpeed = 0;
      autoSpeedEl.textContent = "Off";
      return;
    }

    if (autoOwned == 1){
      autoSpeed = 2000;
    } else if (autoOwned == 2) {
      autoSpeed = 1000;
    } else {
      autoSpeed = 500;
    }

    autoSpeedTextUpdate();

    if (autoTimer != null)
      clearInterval(autoTimer);

    autoTimer = setInterval(function () {
      leaves += clickValue;
      updateView();
      checkRewards();
    }, autoSpeed);
  }

  function updateNextReward() {

    for (let i = 0; i < rewardThresholds.length; i++) {

      if (!rewardEarned[i]) {

        nextRewardLabelEl.textContent =
          leaves + " / " + rewardThresholds[i];

        return;
      }
    }

    nextRewardLabelEl.textContent = "All rewards earned";
  }

  function updateView() {

    leavesValueEl.textContent = leaves;
    clickValueEl.textContent = clickValue;
    upgradesOwnedEl.textContent = totalUpgrades();

    updateNextReward();
    autoSpeedTextUpdate();
    renderUpgrades();
  }

  // rewards
  function renderRewards() {

    rewardsListEl.innerHTML = "";

    for (let i = 0; i < rewardNames.length; i++) {

      let badge = document.createElement("div");
      badge.className = "badge";

      if (rewardEarned[i])
        badge.className += " earned";

      badge.innerHTML =
        "<div>" + rewardIcons[i] + "</div>" +
        "<div><strong>" + rewardNames[i] +
        "</strong><br>" +
        rewardThresholds[i] + " leaves</div>";

      rewardsListEl.appendChild(badge);
    }
  }

  function checkRewards() {

    for (let i = 0; i < rewardThresholds.length; i++) {

      if (!rewardEarned[i] && leaves >= rewardThresholds[i]) {

        rewardEarned[i] = true;

        showToast("Reward unlocked: " + rewardNames[i]);

        renderRewards();
      }
    }
  }

  // Upgrades
  function glovesCost() {
    return Math.floor(25 * Math.pow(1.55, glovesOwned));
  }

  function ladderCost() {
    return Math.floor(120 * Math.pow(1.6, ladderOwned));
  }

  function compostCost() {
    return Math.floor(450 * Math.pow(1.7, compostOwned));
  }

  function autoCost() {
    return Math.floor(200 * Math.pow(2.0, autoOwned));
  }

  function buyGloves() {

    let cost = glovesCost();

    if (leaves < cost) return;

    leaves -= cost;
    glovesOwned++;
    clickValue += 1;

    showToast("Bought Gloves");

    updateView();
  }

  function buyLadder() {

    let cost = ladderCost();

    if (leaves < cost) return;

    leaves -= cost;
    ladderOwned++;
    clickValue += 3;

    showToast("Bought Ladder");

    updateView();
  }

  function buyCompost() {

    let cost = compostCost();

    if (leaves < cost) return;

    leaves -= cost;
    compostOwned++;
    clickValue += 10;

    showToast("Bought Compost");

    updateView();
  }

  function buyAuto() {

    let cost = autoCost();

    if (leaves < cost) return;

    leaves -= cost;
    autoOwned++;

    showToast("Bought Auto Waterer");

    updateAuto();
    updateView();
  }

  function renderUpgrades() {

    upgradesListEl.innerHTML = "";

    createUpgrade("🧤 Gloves (+1 click)", glovesCost(), glovesOwned, buyGloves);
    createUpgrade("🪜 Ladder (+3 click)", ladderCost(), ladderOwned, buyLadder);
    createUpgrade("🌿 Compost (+10 click)", compostCost(), compostOwned, buyCompost);
    createUpgrade("💧 Auto Waterer", autoCost(), autoOwned, buyAuto);
  }

  function createUpgrade(name, cost, ownedCount, buyFunction) {

    let row = document.createElement("div");
    row.className = "upgradeRow";

    let text = document.createElement("div");
    text.innerHTML =
      "<strong>" + name + "</strong><br>" +
      "Cost: " + cost + "<br>" +
      "Owned: " + ownedCount;

    let btn = document.createElement("button");
    btn.textContent = "Buy";
    btn.className = "btn";

    if (leaves < cost)
      btn.disabled = true;

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