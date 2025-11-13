/* ============================================================
   FLOODLENS PROTOTYPE SCRIPT.JS
   Fully front-end simulation (no backend needed)
   ============================================================ */

// -------------------- SAMPLE DATA --------------------
const monitoredAreas = [
  {
    name: "Pasig City",
    coords: [14.573, 121.085],
    rainfall: 20,
    waterLevel: 10,
    status: "Normal",
    history: [],
  },
  {
    name: "Marikina City",
    coords: [14.65, 121.10],
    rainfall: 35,
    waterLevel: 20,
    status: "Watch",
    history: [],
  },
  {
    name: "Makati City",
    coords: [14.554, 121.024],
    rainfall: 55,
    waterLevel: 40,
    status: "Flooded",
    history: [],
  },
  {
    name: "Quezon City",
    coords: [14.676, 121.0437],
    rainfall: 45,
    waterLevel: 30,
    status: "Watch",
    history: [],
  },
  {
    name: "Taguig City",
    coords: [14.5176, 121.0509],
    rainfall: 15,
    waterLevel: 8,
    status: "Normal",
    history: [],
  },
];

// Mock blockchain ledger
let blockchainLedger = [];
let reports = [];
let floodlensTokens = 0;

// -------------------- RISK LOGIC --------------------
function getStatusByRainfall(rainfall) {
  if (rainfall < 30) return "Normal";
  if (rainfall < 50) return "Watch";
  return "Flooded";
}

function getStatusColor(status) {
  switch (status) {
    case "Normal":
      return "green";
    case "Watch":
      return "yellow";
    case "Flooded":
      return "red";
    case "Cleared":
      return "blue";
    default:
      return "gray";
  }
}

// -------------------- SIMULATION: UPDATE RAINFALL --------------------
function updateRainfallData() {
  monitoredAreas.forEach((area) => {
    const change = Math.floor(Math.random() * 20 - 10); // -10 to +10 mm/hr
    area.rainfall = Math.max(0, area.rainfall + change);
    const prevStatus = area.status;
    area.status = getStatusByRainfall(area.rainfall);

    if (prevStatus !== area.status) {
      logStatusChange(area, prevStatus, area.status);
      addToBlockchain(area, prevStatus, area.status);
    }
  });
  renderDashboard();
}

// -------------------- DASHBOARD RENDERING --------------------
function renderDashboard() {
  const container = document.getElementById("areaCards");
  if (!container) return;
  container.innerHTML = "";

  monitoredAreas.forEach((area) => {
    const card = document.createElement("div");
    card.classList.add("area-card");
    card.style.borderLeft = `5px solid ${getStatusColor(area.status)}`;
    const icon = getStatusIcon(area.status);

    card.innerHTML = `
      <h3>${area.name} ${icon}</h3>
      <p><strong>Rainfall:</strong> ${area.rainfall} mm/hr</p>
      <p><strong>Status:</strong> <span style="color:${getStatusColor(area.status)}">${area.status}</span></p>
      <p><strong>Prediction (1h):</strong> ${generatePrediction(area)}</p>
      <p class="timestamp">Last updated: ${new Date().toLocaleTimeString()}</p>
    `;
    container.appendChild(card);
  });
}

function getStatusIcon(status) {
  switch (status) {
    case "Normal":
      return "✅";
    case "Watch":
      return "⚠️";
    case "Flooded":
      return "🚨";
    case "Cleared":
      return "💧";
    default:
      return "ℹ️";
  }
}

// -------------------- MOCK PREDICTION --------------------
function generatePrediction(area) {
  const trend = Math.random();
  if (trend > 0.7) return "Rainfall may increase — possible flooding.";
  if (trend < 0.3) return "Conditions improving — lower risk expected.";
  return "Stable conditions — maintain awareness.";
}

// -------------------- STATUS CHANGE HISTORY --------------------
function logStatusChange(area, fromStatus, toStatus) {
  const entry = {
    time: new Date().toLocaleTimeString(),
    from: fromStatus,
    to: toStatus,
  };
  area.history.push(entry);
  addHistoryEntry(area.name, fromStatus, toStatus);
}

function addHistoryEntry(areaName, from, to) {
  const list = document.getElementById("historyList");
  if (!list) return;
  const li = document.createElement("li");
  li.textContent = `${new Date().toLocaleTimeString()} — ${areaName}: ${from} → ${to}`;
  list.prepend(li);
}

// -------------------- MOCK BLOCKCHAIN --------------------
function addToBlockchain(area, from, to) {
  const hash = Math.random().toString(36).substring(2, 12);
  const entry = {
    hash,
    timestamp: new Date().toLocaleTimeString(),
    location: area.name,
    change: `${from} → ${to}`,
  };
  blockchainLedger.unshift(entry);
  updateBlockchainUI();
}

function updateBlockchainUI() {
  const table = document.getElementById("blockchainTable");
  if (!table) return;
  table.innerHTML = `
    <tr>
      <th>Hash</th>
      <th>Time</th>
      <th>Location</th>
      <th>Status Change</th>
    </tr>
  `;
  blockchainLedger.forEach((b) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${b.hash}</td>
      <td>${b.timestamp}</td>
      <td>${b.location}</td>
      <td>${b.change}</td>
    `;
    table.appendChild(row);
  });
}

// -------------------- REPORT SYSTEM --------------------
function submitReport() {
  const name = document.getElementById("reporterName").value;
  const location = document.getElementById("reportLocation").value;
  const severity = document.getElementById("reportSeverity").value;
  const isAnon = document.getElementById("anonymousToggle").checked;

  if (!location || !severity) {
    alert("Please complete required fields.");
    return;
  }

  const report = {
    id: reports.length + 1,
    name: isAnon ? "Anonymous" : name || "Unnamed",
    location,
    severity,
    time: new Date().toLocaleTimeString(),
  };

  reports.unshift(report);
  floodlensTokens++;
  renderReports();
  alert("Report submitted successfully!");
  updateTokenDisplay();
}

function renderReports() {
  const list = document.getElementById("reportsList");
  if (!list) return;
  list.innerHTML = "";
  reports.forEach((r) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${r.name}</strong> (${r.time}) — ${r.location} [${r.severity}]`;
    list.appendChild(li);
  });
}

function updateTokenDisplay() {
  const el = document.getElementById("tokenCount");
  if (el) el.textContent = floodlensTokens;
}

// -------------------- LENSBOT SIMULATION --------------------
function sendLensBotMessage() {
  const input = document.getElementById("lensbotInput");
  const chat = document.getElementById("lensbotChat");
  if (!input || !chat) return;

  const userMsg = input.value.trim();
  if (!userMsg) return;
  appendChatMessage("user", userMsg);

  const botReply = getLensBotReply(userMsg);
  setTimeout(() => appendChatMessage("bot", botReply), 500);
  input.value = "";
}

function appendChatMessage(sender, msg) {
  const chat = document.getElementById("lensbotChat");
  const div = document.createElement("div");
  div.className = sender === "user" ? "user-msg" : "bot-msg";
  div.textContent = msg;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function getLensBotReply(message) {
  message = message.toLowerCase();
  if (message.includes("risk") || message.includes("status")) {
    const randomArea = monitoredAreas[Math.floor(Math.random() * monitoredAreas.length)];
    return `The current risk in ${randomArea.name} is ${randomArea.status} (${randomArea.rainfall}mm/hr).`;
  }
  if (message.includes("safe") || message.includes("advice"))
    return "Stay indoors and avoid flooded streets. Keep an emergency kit ready.";
  if (message.includes("token")) return `You currently have ${floodlensTokens} FloodLens Tokens.`;
  if (message.includes("prediction"))
    return "Rainfall trend suggests stable conditions for the next hour.";
  if (message.includes("rescue")) return "Priority rescue zones are highlighted in red on the map.";
  return "I'm LensBot! Ask about flood risk, safety, or your token balance.";
}

// -------------------- AUTO-UPDATES --------------------
setInterval(updateRainfallData, 10000); // update every 10s

document.addEventListener("DOMContentLoaded", () => {
  renderDashboard();
  renderReports();
  updateBlockchainUI();
  updateTokenDisplay();

  const sendBtn = document.getElementById("lensbotSend");
  if (sendBtn) sendBtn.addEventListener("click", sendLensBotMessage);

  const reportBtn = document.getElementById("submitReport");
  if (reportBtn) reportBtn.addEventListener("click", submitReport);
});
