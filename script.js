/* ============================================================
   FLOODLENS PROTOTYPE SCRIPT.JS
   Fully front-end simulation muna (no backend needed)
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

/* ============================================================
   FLOODLENS INTERACTIVE MAP & DASHBOARD SCRIPT
   ============================================================ */

// -------------------- SAMPLE DATA --------------------
const monitoredAreas = [
  {
    id: 1,
    name: "Pasig City",
    coords: { x: 58, y: 52 }, // Percentage positions
    rainfall: 20,
    waterLevel: 90,
    status: "Normal",
    history: [],
  },
  {
    id: 2,
    name: "Marikina City",
    coords: { x: 65, y: 38 },
    rainfall: 45,
    waterLevel: 130,
    status: "Watch",
    history: [],
  },
  {
    id: 3,
    name: "Makati City",
    coords: { x: 45, y: 58 },
    rainfall: 35,
    waterLevel: 120,
    status: "Watch",
    history: [],
  },
  {
    id: 4,
    name: "Manila",
    coords: { x: 38, y: 48 },
    rainfall: 55,
    waterLevel: 150,
    status: "Flooded",
    history: [],
  },
  {
    id: 5,
    name: "Quezon City",
    coords: { x: 48, y: 35 },
    rainfall: 25,
    waterLevel: 100,
    status: "Normal",
    history: [],
  },
];

// Map state
let mapState = {
  scale: 1,
  translateX: 0,
  translateY: 0,
  isDragging: false,
  startX: 0,
  startY: 0,
};

// -------------------- UTILITY FUNCTIONS --------------------
function getStatusByRainfall(rainfall) {
  if (rainfall < 30) return "Normal";
  if (rainfall < 50) return "Watch";
  return "Flooded";
}

function getStatusColor(status) {
  switch (status) {
    case "Normal": return "#10b981";
    case "Watch": return "#f59e0b";
    case "Flooded": return "#dc2626";
    default: return "#6b7280";
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "Normal": return "✅";
    case "Watch": return "⚠️";
    case "Flooded": return "🚨";
    default: return "ℹ️";
  }
}

// -------------------- MAP FUNCTIONS --------------------
function initializeMap() {
  const mapCanvas = document.getElementById('mapCanvas');
  const mapMarkers = document.getElementById('mapMarkers');
  
  if (!mapCanvas || !mapMarkers) return;
  
  // Add drag functionality
  mapCanvas.addEventListener('mousedown', startDrag);
  mapCanvas.addEventListener('mousemove', drag);
  mapCanvas.addEventListener('mouseup', endDrag);
  mapCanvas.addEventListener('mouseleave', endDrag);
  
  // Touch support
  mapCanvas.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    startDrag({ clientX: touch.clientX, clientY: touch.clientY });
  });
  mapCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    drag({ clientX: touch.clientX, clientY: touch.clientY });
  });
  mapCanvas.addEventListener('touchend', endDrag);
  
  renderMapMarkers();
}

function startDrag(e) {
  mapState.isDragging = true;
  mapState.startX = e.clientX - mapState.translateX;
  mapState.startY = e.clientY - mapState.translateY;
}

function drag(e) {
  if (!mapState.isDragging) return;
  
  mapState.translateX = e.clientX - mapState.startX;
  mapState.translateY = e.clientY - mapState.startY;
  
  updateMapTransform();
}

function endDrag() {
  mapState.isDragging = false;
}

function zoomIn() {
  mapState.scale = Math.min(mapState.scale + 0.2, 3);
  updateMapTransform();
}

function zoomOut() {
  mapState.scale = Math.max(mapState.scale - 0.2, 0.5);
  updateMapTransform();
}

function resetMap() {
  mapState.scale = 1;
  mapState.translateX = 0;
  mapState.translateY = 0;
  updateMapTransform();
}

function updateMapTransform() {
  const mapMarkers = document.getElementById('mapMarkers');
  if (!mapMarkers) return;
  
  mapMarkers.style.transform = `translate(${mapState.translateX}px, ${mapState.translateY}px) scale(${mapState.scale})`;
}

function renderMapMarkers() {
  const container = document.getElementById('mapMarkers');
  if (!container) return;
  
  container.innerHTML = '';
  
  monitoredAreas.forEach(area => {
    const marker = document.createElement('div');
    marker.className = 'map-marker';
    marker.style.left = `${area.coords.x}%`;
    marker.style.top = `${area.coords.y}%`;
    marker.onclick = () => openAreaDetail(area.id);
    
    marker.innerHTML = `
      <div class="marker-pin ${area.status.toLowerCase()}">
        <div class="marker-icon">${getStatusIcon(area.status)}</div>
      </div>
      <div class="marker-label">${area.name}</div>
      <div class="marker-rainfall">${area.rainfall}mm/hr</div>
    `;
    
    container.appendChild(marker);
  });
}

// -------------------- DASHBOARD RENDERING --------------------
function renderDashboard() {
  renderLocationCards();
  renderMapMarkers();
  updateWeatherAlert();
}

function renderLocationCards() {
  const container = document.getElementById('locationCards');
  if (!container) return;
  
  container.innerHTML = '';
  
  monitoredAreas.forEach(area => {
    const card = document.createElement('div');
    card.className = `location-card ${area.status.toLowerCase()}`;
    card.onclick = () => openAreaDetail(area.id);
    
    card.innerHTML = `
      <div class="location-header">
        <div class="location-name">${area.name}</div>
        <div class="status-badge ${area.status.toLowerCase()}">${area.status}</div>
      </div>
      
      <div class="metric">
        <div class="metric-label">💧 Rainfall Level</div>
        <div class="metric-value">${area.rainfall} mm/hr</div>
      </div>
      
      <div class="metric">
        <div class="metric-label">🌊 Water Level</div>
        <div class="metric-value">${area.waterLevel} cm</div>
      </div>
      
      <div class="prediction">
        <div class="prediction-title">AI Prediction</div>
        <div>${generatePrediction(area)}</div>
      </div>
    `;
    
    container.appendChild(card);
  });
}

function generatePrediction(area) {
  const trend = Math.random();
  if (area.status === "Flooded") {
    return "🚨 High risk - conditions may worsen";
  }
  if (area.status === "Watch") {
    return "⚠️ Monitor closely - possible escalation";
  }
  if (trend > 0.7) {
    return "📈 Rainfall may increase slightly";
  }
  if (trend < 0.3) {
    return "📉 Conditions expected to improve";
  }
  return "➡️ Maintain current status";
}

function updateWeatherAlert() {
  const alert = document.getElementById('weatherAlert');
  if (!alert) return;
  
  const floodedAreas = monitoredAreas.filter(a => a.status === "Flooded");
  const watchAreas = monitoredAreas.filter(a => a.status === "Watch");
  
  if (floodedAreas.length > 0) {
    alert.innerHTML = `🚨 <strong>FLOOD ALERT:</strong> ${floodedAreas.length} area(s) currently flooded. Avoid travel to: ${floodedAreas.map(a => a.name).join(', ')}`;
    alert.style.background = '#fee2e2';
    alert.style.borderLeftColor = '#dc2626';
  } else if (watchAreas.length > 0) {
    alert.innerHTML = `⚠️ <strong>FLOOD WATCH:</strong> ${watchAreas.length} area(s) under monitoring: ${watchAreas.map(a => a.name).join(', ')}`;
    alert.style.background = '#fef3c7';
    alert.style.borderLeftColor = '#f59e0b';
  } else {
    alert.innerHTML = `✅ All monitored areas are in normal condition. Continue to monitor weather updates.`;
    alert.style.background = '#d1fae5';
    alert.style.borderLeftColor = '#10b981';
  }
}

// -------------------- AREA DETAIL MODAL --------------------
function openAreaDetail(areaId) {
  const area = monitoredAreas.find(a => a.id === areaId);
  if (!area) return;
  
  // Update modal content
  document.getElementById('modalAreaName').textContent = area.name;
  
  const statusBadge = document.getElementById('modalStatusBadge');
  statusBadge.textContent = area.status;
  statusBadge.className = `status-badge ${area.status.toLowerCase()}`;
  
  document.getElementById('modalRainfall').textContent = `${area.rainfall} mm/hr`;
  document.getElementById('modalWaterLevel').textContent = `${area.waterLevel} cm`;
  
  // LensBot Insights
  const insights = generateLensBotInsights(area);
  document.getElementById('modalLensBotInsights').textContent = insights;
  
  // Safety Alert
  const safetyAlertDiv = document.getElementById('modalSafetyAlert');
  if (area.status === "Flooded") {
    safetyAlertDiv.innerHTML = `
      <div class="alert-box">
        <h4>⚠️ Safety Alert</h4>
        <p>Evacuate immediately to higher ground. Avoid all travel through flooded areas. Keep emergency supplies ready and stay informed through official channels.</p>
        <ul>
          <li>Do not walk or drive through floodwater</li>
          <li>Move to the highest floor if evacuation isn't possible</li>
          <li>Stay away from electrical equipment</li>
          <li>Call emergency services if in danger</li>
        </ul>
      </div>
    `;
  } else {
    safetyAlertDiv.innerHTML = '';
  }
  
  // Risk Assessment
  const riskLevel = document.getElementById('modalRiskLevel');
  if (area.rainfall < 30) {
    riskLevel.textContent = 'Low Risk';
    riskLevel.style.color = '#10b981';
  } else if (area.rainfall < 50) {
    riskLevel.textContent = 'Medium Risk';
    riskLevel.style.color = '#f59e0b';
  } else {
    riskLevel.textContent = 'High Risk';
    riskLevel.style.color = '#dc2626';
  }
  
  // Prediction
  document.getElementById('modalPrediction').textContent = generatePrediction(area);
  
  // Status History
  const historyDiv = document.getElementById('modalStatusHistory');
  if (area.history.length === 0) {
    historyDiv.textContent = 'No status changes recorded yet';
  } else {
    historyDiv.innerHTML = area.history.slice(0, 5).map(h => 
      `<div style="margin: 0.5rem 0;">🕐 ${h.time} - Changed from ${h.from} to ${h.to}</div>`
    ).join('');
  }
  
  // Last Updated
  document.getElementById('modalLastUpdated').textContent = new Date().toLocaleString();
  
  // Open modal
  openModal('areaDetailModal');
}

function generateLensBotInsights(area) {
  if (area.status === "Flooded") {
    return `High risk: Area is flooded with heavy rainfall (${area.rainfall}mm/hr). Avoid travel and seek higher ground immediately. Emergency services have been alerted.`;
  }
  if (area.status === "Watch") {
    return `Moderate risk: Rainfall at ${area.rainfall}mm/hr is approaching flood threshold. Monitor conditions closely and prepare for possible evacuation.`;
  }
  return `Low risk: Current conditions are stable with ${area.rainfall}mm/hr rainfall. Continue normal activities but stay informed of weather updates.`;
}

// -------------------- SIMULATION --------------------
function updateRainfallData() {
  monitoredAreas.forEach(area => {
    const change = Math.floor(Math.random() * 20 - 10);
    area.rainfall = Math.max(0, Math.min(80, area.rainfall + change));
    area.waterLevel = Math.max(50, Math.min(200, area.waterLevel + change * 2));
    
    const prevStatus = area.status;
    area.status = getStatusByRainfall(area.rainfall);
    
    if (prevStatus !== area.status) {
      area.history.unshift({
        time: new Date().toLocaleTimeString(),
        from: prevStatus,
        to: area.status
      });
    }
  });
  
  renderDashboard();
}

function refreshData() {
  updateRainfallData();
  
  const btn = event.target;
  btn.textContent = '🔄 Refreshing...';
  btn.disabled = true;
  
  setTimeout(() => {
    btn.textContent = '🔄 Refresh Data';
    btn.disabled = false;
  }, 1000);
}

// -------------------- LENSBOT --------------------
function askLensBot(question) {
  const response = document.getElementById('botResponse');
  if (!response) return;
  
  response.textContent = '🤔 Thinking...';
  
  setTimeout(() => {
    let answer = '';
    
    if (question.includes('flood risk')) {
      const floodedCount = monitoredAreas.filter(a => a.status === 'Flooded').length;
      const watchCount = monitoredAreas.filter(a => a.status === 'Watch').length;
      answer = `Currently ${floodedCount} area(s) are flooded and ${watchCount} area(s) are under watch. ${floodedCount > 0 ? 'Exercise extreme caution!' : 'Overall risk is manageable.'}`;
    } else if (question.includes('highest rainfall')) {
      const highest = monitoredAreas.reduce((max, area) => 
        area.rainfall > max.rainfall ? area : max
      );
      answer = `${highest.name} has the highest rainfall at ${highest.rainfall}mm/hr (Status: ${highest.status})`;
    } else if (question.includes('prepare')) {
      answer = 'Key preparation steps: 1) Keep emergency kit ready with food, water, and first aid. 2) Charge devices and have flashlights. 3) Know evacuation routes. 4) Secure important documents. 5) Monitor weather alerts regularly.';
    } else {
      answer = 'I can help you with flood risk information, rainfall data, safety tips, and area-specific updates. What would you like to know?';
    }
    
    response.textContent = answer;
  }, 800);
}

// -------------------- MODAL FUNCTIONS --------------------
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
});

// -------------------- INITIALIZATION --------------------
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('mapContainer')) {
    initializeMap();
    renderDashboard();
    
    // Auto-update every 15 seconds
    setInterval(updateRainfallData, 15000);
  }
});

/* ==================== LENSBOT CHAT INTERFACE ==================== */

let chatHistory = [];

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  // Add user message
  addChatMessage('user', message);
  chatHistory.push({ role: 'user', message, time: new Date() });
  
  // Clear input
  input.value = '';
  
  // Show typing indicator
  showTypingIndicator();
  
  // Get bot response after a delay
  setTimeout(() => {
    hideTypingIndicator();
    const response = getLensBotResponse(message);
    addChatMessage('bot', response);
    chatHistory.push({ role: 'bot', message: response, time: new Date() });
  }, 800 + Math.random() * 400);
}

function addChatMessage(sender, message) {
  const container = document.getElementById('chatContainer');
  if (!container) return;
  
  // Remove welcome message if exists
  const welcome = container.querySelector('.welcome-message');
  if (welcome) welcome.remove();
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${sender}`;
  
  const time = new Date().toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  const avatar = sender === 'bot' ? '🤖' : '👤';
  
  messageDiv.innerHTML = `
    <div class="message-avatar">${avatar}</div>
    <div>
      <div class="message-bubble">${message}</div>
      <div class="message-time">${time}</div>
    </div>
  `;
  
  // Insert before typing indicator
  const typingIndicator = document.getElementById('typingIndicator');
  container.insertBefore(messageDiv, typingIndicator);
  
  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) {
    indicator.classList.add('active');
    const container = document.getElementById('chatContainer');
    container.scrollTop = container.scrollHeight;
  }
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) {
    indicator.classList.remove('active');
  }
}

function getLensBotResponse(message) {
  const msg = message.toLowerCase();
  
  // Flood risk queries
  if (msg.includes('risk') || msg.includes('status') || msg.includes('today')) {
    const floodedCount = monitoredAreas.filter(a => a.status === 'Flooded').length;
    const watchCount = monitoredAreas.filter(a => a.status === 'Watch').length;
    const normalCount = monitoredAreas.filter(a => a.status === 'Normal').length;
    
    if (floodedCount > 0) {
      const floodedNames = monitoredAreas.filter(a => a.status === 'Flooded').map(a => a.name).join(', ');
      return `🚨 HIGH ALERT: ${floodedCount} area(s) currently flooded (${floodedNames}). ${watchCount} area(s) under watch. Avoid travel and seek higher ground immediately!`;
    } else if (watchCount > 0) {
      const watchNames = monitoredAreas.filter(a => a.status === 'Watch').map(a => a.name).join(', ');
      return `⚠️ MODERATE RISK: ${watchCount} area(s) under flood watch (${watchNames}). ${normalCount} area(s) are normal. Stay alert and monitor conditions.`;
    } else {
      return `✅ LOW RISK: All ${normalCount} monitored areas are in normal condition. Continue regular activities but stay informed of weather updates.`;
    }
  }
  
  // Highest rainfall query
  if (msg.includes('highest') || msg.includes('most rain') || msg.includes('worst')) {
    const highest = monitoredAreas.reduce((max, area) => 
      area.rainfall > max.rainfall ? area : max
    );
    return `📊 ${highest.name} has the highest rainfall at ${highest.rainfall}mm/hr with a water level of ${highest.waterLevel}cm. Current status: ${highest.status} ${getStatusIcon(highest.status)}`;
  }
  
  // Safety and preparation
  if (msg.includes('safe') || msg.includes('prepare') || msg.includes('what to do') || msg.includes('advice')) {
    return `🛡️ KEY SAFETY STEPS:\n\n1. 🎒 Keep emergency kit ready (food, water, first aid, flashlight)\n2. 📱 Charge devices and have backup power\n3. 🗺️ Know your evacuation routes\n4. 📄 Secure important documents in waterproof containers\n5. 🚫 Never walk or drive through floodwater\n6. 📻 Monitor official weather alerts regularly`;
  }
  
  // Token queries
  if (msg.includes('token') || msg.includes('reward') || msg.includes('point')) {
    return `🪙 You currently have ${floodlensTokens || 0} FloodLens Tokens. Earn more by submitting verified flood reports through the Reports page! Tokens can be redeemed for community rewards.`;
  }
  
  // Prediction queries
  if (msg.includes('predict') || msg.includes('forecast') || msg.includes('future') || msg.includes('next')) {
    const randomArea = monitoredAreas[Math.floor(Math.random() * monitoredAreas.length)];
    return `🔮 AI PREDICTION: Based on current patterns, ${randomArea.name} is expected to ${randomArea.rainfall > 40 ? 'see continued high rainfall' : 'maintain stable conditions'} over the next hour. Overall trend suggests ${Math.random() > 0.5 ? 'slight improvement' : 'continued monitoring needed'}.`;
  }
  
  // Rescue zones
  if (msg.includes('rescue') || msg.includes('emergency') || msg.includes('evacuate') || msg.includes('priority')) {
    const critical = monitoredAreas.filter(a => a.status === 'Flooded');
    if (critical.length > 0) {
      return `🚨 PRIORITY RESCUE ZONES: ${critical.map(a => `${a.name} (${a.rainfall}mm/hr)`).join(', ')}. Emergency services are deployed. If you're in these areas, call emergency hotlines immediately!`;
    }
    return `✅ No priority rescue zones at this time. All areas are manageable. Continue monitoring for updates.`;
  }
  
  // Anonymous reporting
  if (msg.includes('report') || msg.includes('anonymous') || msg.includes('how to report')) {
    return `📝 To report flooding anonymously:\n\n1. Go to the Reports page\n2. Toggle "Report Anonymously"\n3. Select location and severity\n4. Submit (earns you FloodLens Tokens!)\n\nYour identity is protected while helping your community stay safe.`;
  }
  
  // Specific area queries
  const areaNames = monitoredAreas.map(a => a.name.toLowerCase());
  const mentionedArea = areaNames.find(name => msg.includes(name));
  if (mentionedArea) {
    const area = monitoredAreas.find(a => a.name.toLowerCase() === mentionedArea);
    return `📍 ${area.name} Status:\n\n${getStatusIcon(area.status)} ${area.status}\n💧 Rainfall: ${area.rainfall}mm/hr\n🌊 Water Level: ${area.waterLevel}cm\n\n${generatePrediction(area)}`;
  }
  
  // Help/greeting
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('help') || msg.includes('what can you')) {
    return `👋 Hello! I'm LensBot, your flood monitoring AI assistant. I can help you with:\n\n🌊 Current flood risk levels\n📊 Rainfall and water level data\n🛡️ Safety tips and preparation\n🚨 Priority rescue zones\n📝 Anonymous reporting\n🔮 AI predictions\n🪙 FloodLens Token balance\n\nJust ask me anything!`;
  }
  
  // Weather queries
  if (msg.includes('weather') || msg.includes('rain') || msg.includes('storm')) {
    const avgRainfall = Math.round(monitoredAreas.reduce((sum, a) => sum + a.rainfall, 0) / monitoredAreas.length);
    return `🌧️ Current Weather Overview:\n\nAverage rainfall across Metro Manila: ${avgRainfall}mm/hr\n\nMost affected areas are highlighted on the map. ${avgRainfall > 40 ? 'Heavy rainfall expected to continue.' : 'Conditions are relatively stable.'} Stay updated!`;
  }
  
  // Thank you
  if (msg.includes('thank') || msg.includes('thanks')) {
    return `You're welcome! 😊 Stay safe and don't hesitate to ask if you need more information. Remember to check the dashboard regularly for updates!`;
  }
  
  // Default response
  return `I'm here to help with flood monitoring! Ask me about:\n\n• Current flood risks\n• Specific area conditions\n• Safety tips\n• AI predictions\n• How to report flooding\n\nWhat would you like to know?`;
}

// Update the original askLensBot function to use the new chat interface
function askLensBot(question) {
  const input = document.getElementById('chatInput');
  if (input) {
    input.value = question;
    sendChatMessage();
  }
}

// Initialize chat on page load
document.addEventListener('DOMContentLoaded', () => {
  // Add initial bot greeting after a short delay
  setTimeout(() => {
    if (document.getElementById('chatContainer') && chatHistory.length === 0) {
      addChatMessage('bot', '👋 Hi! I\'m LensBot. Ask me about flood risks, safety tips, or anything related to flood monitoring!');
      chatHistory.push({ role: 'bot', message: 'Initial greeting', time: new Date() });
    }
  }, 1000);
});

/* script.js — simple simulation and UI wiring for dashboard.html */

/* sample area data — positions are percentages used to position markers */
const AREAS = [
  { id: 'makati', name: 'Makati', x: 58, y: 48, rainfall: 35, water: 120 },
  { id: 'manila', name: 'Manila', x: 36, y: 42, rainfall: 55, water: 150 },
  { id: 'marikina', name: 'Marikina', x: 68, y: 26, rainfall: 45, water: 130 },
  { id: 'pasig', name: 'Pasig', x: 60, y: 34, rainfall: 20, water: 90 },
  { id: 'qc', name: 'Quezon City', x: 52, y: 18, rainfall: 25, water: 100 }
];

/* helpers */
const el = id => document.getElementById(id);
const formatTime = (d = new Date()) => d.toLocaleString();

/* compute status from rainfall */
function statusFromRainfall(rain) {
  if (rain >= 50) return 'flooded';
  if (rain >= 30) return 'watch';
  return 'normal';
}

/* create marker DOM */
function createMarker(area) {
  const m = document.createElement('div');
  m.className = 'marker';
  m.style.left = area.x + '%';
  m.style.top = area.y + '%';
  m.setAttribute('data-id', area.id);

  const dot = document.createElement('div');
  dot.className = 'dot';
  const s = statusFromRainfall(area.rainfall);
  if (s === 'normal') { dot.style.background = '#10b981'; dot.textContent = '✓' }
  if (s === 'watch') { dot.style.background = '#f59e0b'; dot.textContent = '!' }
  if (s === 'flooded') { dot.style.background = '#ef4444'; dot.textContent = '⚠' }

  const lbl = document.createElement('div');
  lbl.className = 'label';
  lbl.textContent = `${area.name} • ${area.rainfall} mm/hr`;

  m.appendChild(dot);
  m.appendChild(lbl);

  // click opens modal
  m.addEventListener('click', () => openAreaModal(area.id));

  return m;
}

/* create card DOM */
function createCard(area) {
  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('data-id', area.id);

  const head = document.createElement('div');
  head.style.display = 'flex';
  head.style.alignItems = 'center';
  head.style.justifyContent = 'space-between';

  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = area.name;

  const badge = document.createElement('div');
  badge.className = 'badge ' + statusFromRainfall(area.rainfall);
  badge.textContent = statusFromRainfall(area.rainfall).toUpperCase();

  head.appendChild(title);
  head.appendChild(badge);

  const metrics = document.createElement('div');
  metrics.className = 'metric-row';

  const left = document.createElement('div');
  left.innerHTML = `<div class="metric-icon">💧</div>`;
  const v1 = document.createElement('div');
  v1.innerHTML = `<div style="color:var(--muted);font-size:13px">Rainfall Level</div><div class="metric-value">${area.rainfall} mm/hr</div>`;

  const right = document.createElement('div');
  right.innerHTML = `<div class="metric-icon">🌊</div>`;
  const v2 = document.createElement('div');
  v2.innerHTML = `<div style="color:var(--muted);font-size:13px">Water Level</div><div class="metric-value">${area.water} cm</div>`;

  const topRow = document.createElement('div');
  topRow.style.display = 'flex';
  topRow.style.gap = '12px';
  topRow.style.marginTop = '12px';
  topRow.appendChild(left);
  topRow.appendChild(v1);
  topRow.appendChild(right);
  topRow.appendChild(v2);

  const aiBox = document.createElement('div');
  aiBox.style.marginTop = '12px';
  aiBox.style.border = '1px solid rgba(11,35,56,0.04)';
  aiBox.style.padding = '10px';
  aiBox.style.borderRadius = '10px';
  aiBox.style.background = '#fbfdff';
  aiBox.textContent = 'AI Prediction — Maintain current status';

  const footer = document.createElement('div');
  footer.style.marginTop = '12px';
  footer.style.fontSize = '13px';
  footer.style.color = 'var(--muted)';
  footer.textContent = `Updated ${formatTime()}`;

  card.appendChild(head);
  card.appendChild(topRow);
  card.appendChild(aiBox);
  card.appendChild(footer);

  card.addEventListener('click', () => openAreaModal(area.id));

  return card;
}

/* render UI */
function renderAll() {
  const markersEl = el('mapMarkers');
  markersEl.innerHTML = '';
  const cardsEl = el('locationCards');
  cardsEl.innerHTML = '';

  AREAS.forEach(a => {
    markersEl.appendChild(createMarker(a));
    cardsEl.appendChild(createCard(a));
  });
}

/* open modal and populate */
function openAreaModal(id) {
  const area = AREAS.find(x => x.id === id);
  if (!area) return;
  // populate
  el('modalAreaName').textContent = area.name;
  el('modalRainfall').textContent = `${area.rainfall} mm/hr`;
  el('modalWaterLevel').textContent = `${area.water} cm`;
  const status = statusFromRainfall(area.rainfall);
  const badge = el('modalStatusBadge');
  badge.textContent = status.toUpperCase();
  badge.className = 'status-badge ' + status;
  el('modalLastUpdated').textContent = formatTime();
  // lensbot insight (simple)
  const insight = area.rainfall >= 50
    ? 'High risk: Area is flooded with heavy rainfall. Avoid travel and seek higher ground.'
    : area.rainfall >= 30
    ? 'Elevated risk: Monitor water levels and prepare to evacuate if conditions worsen.'
    : 'Low risk: Conditions are stable but stay alert for updates.';
  el('modalLensBotInsights').textContent = insight;

  // risk level
  const riskLevel = area.rainfall >= 50 ? 'High Risk' : area.rainfall >= 30 ? 'Moderate Risk' : 'Low Risk';
  const riskSpan = el('modalRiskLevel');
  riskSpan.textContent = riskLevel;
  if (riskLevel === 'High Risk') riskSpan.style.color = 'var(--danger)';
  else if (riskLevel === 'Moderate Risk') riskSpan.style.color = 'var(--warn)';
  else riskSpan.style.color = 'var(--success)';

  // prediction (very simple simulated)
  el('modalPrediction').textContent = area.rainfall > 45 ? 'Rain expected to continue — risk may increase' : 'Maintain current status';

  // history placeholder
  el('modalStatusHistory').textContent = 'No status changes recorded yet';

  // show modal
  const modal = el('areaDetailModal');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

/* close modal */
function closeModal() {
  const modal = el('areaDetailModal');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* map controls — these are mock zoom/pan to avoid heavy libs */
let zoom = 1;
function zoomIn() { zoom = Math.min(2, zoom + 0.1); el('mapCanvas').style.transform = `scale(${zoom})`; }
function zoomOut(){ zoom = Math.max(0.8, zoom - 0.1); el('mapCanvas').style.transform = `scale(${zoom})`; }
function resetMap(){ zoom = 1; el('mapCanvas').style.transform = `scale(1)`; el('mapCanvas').scrollIntoView({behavior:'smooth'}); }

/* LensBot chat (very simple) */
function appendChat(text, who='bot') {
  const target = el('chatMessages');
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble' + (who === 'user' ? ' user' : '');
  bubble.textContent = text;
  target.appendChild(bubble);
  target.scrollTop = target.scrollHeight;
}
function sendChatMessage() {
  const input = el('chatInput');
  const v = input.value && input.value.trim();
  if (!v) return;
  appendChat(v, 'user');
  input.value = '';
  // show typing
  const typing = el('typingIndicator');
  typing.style.display = 'block';
  setTimeout(() => {
    typing.style.display = 'none';
    // dummy responses
    if (v.toLowerCase().includes('manila')) appendChat('Manila currently shows Flooded status — avoid travel. (LensBot)');
    else if (v.toLowerCase().includes('tips')) appendChat('Keep emergency supplies, charge devices, and move to higher ground if needed.');
    else appendChat("I'm here to help — try asking 'What's the flood prediction in Manila right now?'");
  }, 800);
}
function askLensBot(q) {
  el('chatInput').value = q;
  sendChatMessage();
}

/* small interactive: close modal btn event */
document.addEventListener('click', (ev) => {
  if (ev.target.id === 'closeModalBtn' || ev.target.id === 'areaDetailModal') closeModal();
});
el('closeModalBtn')?.addEventListener('click', closeModal);
el('areaDetailModal').addEventListener('click', (e)=> {
  if (e.target === el('areaDetailModal')) closeModal();
});

/* wire map controls */
document.getElementById('zoomIn').addEventListener('click', zoomIn);
document.getElementById('zoomOut').addEventListener('click', zoomOut);
document.getElementById('resetMap').addEventListener('click', resetMap);

/* initial render */
renderAll();

/* keyboard escape closes modal */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
