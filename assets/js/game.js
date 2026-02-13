window.addEventListener("load", () => {
  // =========================
  // MODEL (state variables)
  // =========================
  let leaves = 0;
  let clickValue = 1;

  // Upgrades owned
  const owned = {
    gloves: 0,
    ladder: 0,
    compost: 0,
    auto: 0, // how many times auto upgrade purchased
  };

  // Auto-click timer (only ever one running)
  let autoTimerId = null;
  let autoIntervalMs = null;

  // Rewards
  const rewards = [
    { id: "sprout",  threshold: 50,    title: "Tiny Sprout",    icon: "🌱", earned: false },
    { id: "sapling", threshold: 200,   title: "Sapling",        icon: "🌿", earned: false },
    { id: "tree",    threshold: 600,   title: "Healthy Tree",   icon: "🌳", earned: false },
    { id: "grove",   threshold: 1500,  title: "Mini Grove",     icon: "🌲", earned: false },
    { id: "forest",  threshold: 3000,  title: "Forest Keeper",  icon: "🏆", earned: false },
  ];

  // Upgrades (data-driven)
  const upgrades = [
    {
      key: "gloves",
      name: "Gardening Gloves",
      desc: "Pick leaves faster (+1 leaves/click).",
      type: "click",
      baseCost: 25,
      costGrowth: 1.55,
      effect: () => { clickValue += 1; }
    },
    {
      key: "ladder",
      name: "Sturdy Ladder",
      desc: "Reach higher branches (+3 leaves/click).",
      type: "click",
      baseCost: 120,
      costGrowth: 1.6,
      effect: () => { clickValue += 3; }
    },
    {
      key: "compost",
      name: "Magic Compost",
      desc: "Supercharged growth (+10 leaves/click).",
      type: "click",
      baseCost: 450,
      costGrowth: 1.7,
      effect: () => { clickValue += 10; }
    },
    {
      key: "auto",
      name: "Auto Waterer",
      desc: "Starts auto-collecting leaves, then upgrades to faster speeds.",
      type: "auto",
      baseCost: 200,
      costGrowth: 2.0,
      effect: () => {
        // Auto upgrade levels:
        // 1st purchase: 2000ms
        // 2nd purchase: 1000ms
        // 3rd+ purchase: 500ms
        if (owned.auto === 1) autoIntervalMs = 2000;
        else if (owned.auto === 2) autoIntervalMs = 1000;
        else autoIntervalMs = 500;

        startOrRestartAutoTimer();
      }
    }
  ];

  // =========================
  // VIEW (DOM elements)
  // =========================
  const leavesValueEl = document.getElementById("leavesValue");
  const clickValueEl = document.getElementById("clickValue");
  const upgradesOwnedEl = document.getElementById("upgradesOwned");
  const autoSpeedEl = document.getElementById("autoSpeed");

  const upgradesListEl = document.getElementById("upgradesList");
  const rewardsListEl = document.getElementById("rewardsList");

  const toastEl = document.getElementById("toast");
  const progressFillEl = document.getElementById("progressFill");
  const nextRewardLabelEl = document.getElementById("nextRewardLabel");

  const treeBtn = document.getElementById("treeBtn");
  const helpBtn = document.getElementById("helpBtn");
  const helpPanel = document.getElementById("helpPanel");
  const helpContent = document.getElementById("helpContent");

  // =========================
  // Helpers
  // =========================
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  function calcCost(upg) {
    const count = owned[upg.key];
    // cost = baseCost * growth^count
    return Math.floor(upg.baseCost * Math.pow(upg.costGrowth, count));
  }

  function totalUpgradesOwned() {
    return owned.gloves + owned.ladder + owned.compost + owned.auto;
  }

  function startOrRestartAutoTimer() {
    if (autoTimerId !== null) {
      clearInterval(autoTimerId);
      autoTimerId = null;
    }
    autoTimerId = setInterval(() => {
      leaves += clickValue; // applies current click value
      updateView();
      checkRewards();
    }, autoIntervalMs);
  }

  function autoSpeedLabel() {
    if (owned.auto === 0) return "Off";
    if (autoIntervalMs === 2000) return "Slow";
    if (autoIntervalMs === 1000) return "Medium";
    return "Fast";
  }

  // =========================
  // Rendering
  // =========================
  function renderUpgrades() {
    upgradesListEl.innerHTML = "";

    upgrades.forEach((upg) => {
      const cost = calcCost(upg);

      const row = document.createElement("div");
      row.className = "upgradeRow";

      const left = document.createElement("div");
      const title = document.createElement("div");
      title.className = "upgradeTitle";
      title.textContent = upg.name;

      const meta = document.createElement("div");
      meta.className = "upgradeMeta";
      meta.innerHTML = `
        <span>${upg.desc}</span>
        <span><strong>Cost:</strong> ${cost} 🍃</span>
        <span><strong>Owned:</strong> ${owned[upg.key]}</span>
      `;

      left.appendChild(title);
      left.appendChild(meta);

      const btn = document.createElement("button");
      btn.className = "btn";
      btn.type = "button";
      btn.textContent = "Buy";
      btn.disabled = leaves < cost;

      btn.addEventListener("click", () => {
        buyUpgrade(upg);
      });

      row.appendChild(left);
      row.appendChild(btn);

      upgradesListEl.appendChild(row);
    });
  }

  function renderRewards() {
    rewardsListEl.innerHTML = "";
    rewards.forEach((r) => {
      const badge = document.createElement("div");
      badge.className = "badge" + (r.earned ? " earned" : "");

      const icon = document.createElement("div");
      icon.className = "badgeIcon";
      icon.textContent = r.icon;

      const text = document.createElement("div");
      text.className = "badgeText";
      text.innerHTML = `<strong>${r.title}</strong><span>${r.threshold} leaves</span>`;

      badge.appendChild(icon);
      badge.appendChild(text);
      rewardsListEl.appendChild(badge);
    });
  }

  function updateProgressToNextReward() {
    const next = rewards.find(r => !r.earned);
    if (!next) {
      nextRewardLabelEl.textContent = "All rewards earned!";
      progressFillEl.style.width = "100%";
      return;
    }

    const pct = Math.max(0, Math.min(100, (leaves / next.threshold) * 100));
    nextRewardLabelEl.textContent = `${leaves} / ${next.threshold}`;
    progressFillEl.style.width = pct.toFixed(0) + "%";
  }

  function updateView() {
    leavesValueEl.textContent = leaves;
    clickValueEl.textContent = clickValue;
    upgradesOwnedEl.textContent = totalUpgradesOwned();
    autoSpeedEl.textContent = autoSpeedLabel();

    updateProgressToNextReward();
    renderUpgrades(); // refresh costs + disabled states
  }

  // =========================
  // Game Actions
  // =========================
  function buyUpgrade(upg) {
    const cost = calcCost(upg);
    if (leaves < cost) return;

    // Spend
    leaves -= cost;

    // Increase owned first (important for auto logic)
    owned[upg.key] += 1;

    // Apply effect
    upg.effect();

    showToast(`Purchased: ${upg.name}!`);

    updateView();
    checkRewards();
  }

  function checkRewards() {
    let earnedSomething = false;

    rewards.forEach((r) => {
      if (!r.earned && leaves >= r.threshold) {
        r.earned = true;
        earnedSomething = true;
        showToast(`🎉 Reward unlocked: ${r.title}!`);
      }
    });

    if (earnedSomething) {
      renderRewards();
      updateProgressToNextReward();
    }
  }

  // =========================
  // Help Panel
  // =========================
  function buildHelpText() {
    const upgLines = upgrades.map(u => {
      return `• ${u.name}: ${u.desc} (base cost ${u.baseCost})`;
    }).join("<br>");

    const rewardLines = rewards.map(r => {
      return `• ${r.title}: ${r.threshold} leaves`;
    }).join("<br>");

    return `
      <p><strong>Goal:</strong> Click the tree to collect leaves, buy upgrades, and unlock rewards.</p>
      <p><strong>How to play:</strong></p>
      <ul>
        <li>Click the tree to gain <strong>Leaves</strong>.</li>
        <li>Buy click upgrades to increase <strong>Leaves / Click</strong>.</li>
        <li>Buy the <strong>Auto Waterer</strong> to start auto-collecting leaves. Buy it again to speed it up.</li>
      </ul>
      <p><strong>Upgrades:</strong><br>${upgLines}</p>
      <p><strong>Rewards:</strong><br>${rewardLines}</p>
    `;
  }

  helpBtn.addEventListener("click", () => {
    const isHidden = helpPanel.hidden;
    if (isHidden) {
      helpContent.innerHTML = buildHelpText();
      helpPanel.hidden = false;
      helpBtn.textContent = "Close Help";
    } else {
      helpPanel.hidden = true;
      helpBtn.textContent = "Help";
    }
  });

  // =========================
  // Main Click
  // =========================
  treeBtn.addEventListener("click", () => {
    leaves += clickValue;
    updateView();
    checkRewards();
  });

  // =========================
  // Init
  // =========================
  renderRewards();
  updateView();
});
