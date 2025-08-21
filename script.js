// =======================
// Frontend Configuration
// =======================
const CONFIG = {
  SHEETS_ID: "1hi_iiN08N0nQ6gVLJPjDzbLIz6lZjCMB75U9Q2GadWk", // your spreadsheet ID

  // Google Apps Script Web App URL (replace with your latest deployment URL)
  APPS_SCRIPT_URL:
    "https://script.google.com/macros/s/AKfycbyV-pOp20WbUU_Pn-ZVC2vaxvJJfcocXlAdkZJCWujt5j1Iy-RVj1rKGm-dC9J2fLKaHw/exec",
  TOPICS_GID: "0",
  QUIZZES_GID: "96315669",
  RESPONSES_GID: "1061310588",
  USERS_GID: "1396828792",
  PENDING_QUIZZES_GID: "1374803034",
  TICTACTOE_ROOMS_GID: "1670647859",
  CONNECT4_ROOMS_GID: "1603557701",
  GAME_HISTORY_GID: "2019136867",
}

const API_BASE = CONFIG.APPS_SCRIPT_URL

// Get a reference to the loading overlay
const loadingOverlay = document.getElementById("loadingOverlay")

function setLoading(isLoading, message = "Loading quiz data...") {
  if (loadingOverlay) {
    loadingOverlay.style.display = isLoading ? "flex" : "none"
    const loadingText = loadingOverlay.querySelector("p")
    if (loadingText) {
      loadingText.textContent = message
    }
  }
}

function showGameMessage(message, type) {
  console.log(`[${type.toUpperCase()}] ${message}`)

  // Create a more visible error display
  const errorDiv = document.createElement("div")
  errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "error" ? "#ff4444" : type === "warning" ? "#ffaa00" : "#44aa44"};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `
  errorDiv.textContent = message
  document.body.appendChild(errorDiv)

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv)
    }
  }, 5000)

  // Also show in alert for critical errors
  if (type === "error") {
    alert(message)
  }
}

// Screen Switching Helper
function switchScreen(screenId) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"))
  const target = document.getElementById(screenId)
  if (target) target.classList.add("active")
}

// =======================
// API Calls with Enhanced Error Handling
// =======================

async function fetchTopics() {
  console.log("Starting fetchTopics...")
  setLoading(true, "Connecting to quiz database...")

  const url = `${API_BASE}?action=getTopics`
  console.log("Fetching from URL:", url)

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    setLoading(true, "Fetching quiz topics...")
    const res = await fetch(url, {
      signal: controller.signal,
      mode: "cors",
      cache: "no-cache",
    })

    clearTimeout(timeoutId)

    console.log("Response status:", res.status)
    console.log("Response headers:", res.headers)

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status} - ${res.statusText}`)
    }

    setLoading(true, "Processing quiz data...")
    const data = await res.json()
    console.log("Received data:", data)

    if (data.error) {
      throw new Error(`Backend error: ${data.error}`)
    }

    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Detailed error in fetchTopics:", error)

    let errorMessage = "Failed to load quiz topics. "

    if (error.name === "AbortError") {
      errorMessage += "Request timed out. Please check your internet connection."
    } else if (error.message.includes("CORS")) {
      errorMessage += "Cross-origin request blocked. Please check the Google Apps Script deployment."
    } else if (error.message.includes("HTTP error")) {
      errorMessage += `Server responded with: ${error.message}`
    } else {
      errorMessage += `Error: ${error.message}`
    }

    showGameMessage(errorMessage, "error")
    return []
  } finally {
    setLoading(false)
  }
}

async function fetchAvailableRooms(gameType) {
  const url = `${API_BASE}?action=getAvailableRooms&gameType=${gameType}`
  console.log(`Fetching ${gameType} rooms from:`, url)

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()

    if (data.error) {
      throw new Error(`Backend error: ${data.error}`)
    }

    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error(`Failed to fetch ${gameType} rooms:`, error)
    showGameMessage(`Failed to load ${gameType} rooms: ${error.message}`, "error")
    return []
  }
}

// Get specific room
async function fetchRoom(gameType, roomId) {
  const url = `${API_BASE}?action=getRoom&gameType=${gameType}&roomId=${roomId}`
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()

    if (data.error) {
      throw new Error(`Backend error: ${data.error}`)
    }

    return data
  } catch (error) {
    console.error("Failed to fetch room data:", error)
    showGameMessage(`Failed to get room data: ${error.message}`, "error")
    return null
  }
}

// Update room
async function updateRoom(gameType, roomId, roomData) {
  const formData = new URLSearchParams()
  formData.append("action", "updateRoom")
  formData.append("gameType", gameType)
  formData.append("roomId", roomId)
  formData.append("roomData", JSON.stringify(roomData))

  try {
    const res = await fetch(API_BASE, { method: "POST", body: formData })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()

    if (data.error) {
      throw new Error(`Backend error: ${data.error}`)
    }

    return data
  } catch (error) {
    console.error("Failed to update room:", error)
    showGameMessage(`Failed to update room: ${error.message}`, "error")
    return { success: false, message: error.message }
  }
}

// Save game history
async function saveGameHistory(gameData) {
  const formData = new URLSearchParams()
  formData.append("action", "saveGameHistory")
  formData.append("gameData", JSON.stringify(gameData))

  try {
    const res = await fetch(API_BASE, { method: "POST", body: formData })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()

    if (data.error) {
      throw new Error(`Backend error: ${data.error}`)
    }

    return data
  } catch (error) {
    console.error("Failed to save game history:", error)
    showGameMessage(`Failed to save game history: ${error.message}`, "error")
    return { success: false, message: error.message }
  }
}

// =======================
// Main Application Logic
// =======================

function populateTopics(topics) {
  const select = document.getElementById("topicSelect")
  if (!select) {
    console.error("Topic select element not found!")
    return
  }

  // Clear existing options
  select.innerHTML = '<option value="">Select a topic...</option>'

  if (topics && topics.length > 0) {
    console.log(`Populating ${topics.length} topics`)
    topics.forEach((topic, index) => {
      const option = document.createElement("option")
      option.value = topic.id || topic.topic_id || index
      option.textContent = topic.name || topic.topic_name || `Topic ${index + 1}`
      select.appendChild(option)
    })
    showGameMessage(`Loaded ${topics.length} quiz topics successfully!`, "success")
  } else {
    console.warn("No topics received or empty array")
    const fallbackTopics = [
      { id: "general", name: "General Knowledge" },
      { id: "science", name: "Science" },
      { id: "history", name: "History" },
    ]

    fallbackTopics.forEach((topic) => {
      const option = document.createElement("option")
      option.value = topic.id
      option.textContent = topic.name
      select.appendChild(option)
    })

    showGameMessage("Using fallback topics. Please check your backend connection.", "warning")
  }
}

// Game Join Flow
async function joinGame(gameType) {
  showGameMessage(`Joining ${gameType} room...`, "info")

  const rooms = await fetchAvailableRooms(gameType)
  let room
  if (rooms.length > 0) {
    room = rooms[0]
    await updateRoom(gameType, room.room_id, { status: "active", player2: "Guest" })
  } else {
    const result = await updateRoom(gameType, Date.now().toString(), { status: "waiting", player1: "Guest" })
    room = { room_id: result.roomId, status: "waiting", player1: "Guest" }
  }

  document.getElementById("currentRoomId").textContent = room.room_id
  document.getElementById("gameRoomTitle").textContent = gameType === "tictactoe" ? "Tic-Tac-Toe" : "Connect 4"
  switchScreen("gameRoomScreen")

  document.getElementById("tictactoeBoard").classList.toggle("hidden", gameType !== "tictactoe")
  document.getElementById("connect4Board").classList.toggle("hidden", gameType !== "connect4")
}

async function initializeApp() {
  console.log("App initializing...")

  try {
    setLoading(true, "Initializing application...")

    console.log("Testing API connectivity...")
    setLoading(true, "Testing connection...")

    // First, load the quiz topics for the main screen
    console.log("Loading quiz topics...")
    const topics = await fetchTopics()
    populateTopics(topics)

    // Then, load the game room counts
    console.log("Loading game room data...")
    setLoading(true, "Loading game rooms...")

    const [tttRooms, c4Rooms] = await Promise.allSettled([
      fetchAvailableRooms("tictactoe"),
      fetchAvailableRooms("connect4"),
    ])

    const tttCount = tttRooms.status === "fulfilled" ? tttRooms.value.length : 0
    const c4Count = c4Rooms.status === "fulfilled" ? c4Rooms.value.length : 0

    document.getElementById("tictactoeRooms").textContent = `${tttCount}/20 Active`
    document.getElementById("connect4Rooms").textContent = `${c4Count}/20 Active`

    console.log("App initialization completed successfully")
    showGameMessage("App loaded successfully!", "success")
  } catch (error) {
    console.error("Critical error during app initialization:", error)
    showGameMessage(`Failed to initialize app: ${error.message}`, "error")
  } finally {
    setLoading(false)
  }
}

function retryConnection() {
  console.log("Manual retry triggered")
  initializeApp()
}

async function testConnection() {
  console.log("Testing connection to:", API_BASE)
  setLoading(true, "Testing connection...")

  try {
    const response = await fetch(API_BASE + "?action=getTopics", {
      method: "GET",
      mode: "cors",
    })

    console.log("Test response status:", response.status)
    console.log("Test response headers:", [...response.headers.entries()])

    const text = await response.text()
    console.log("Raw response:", text)

    try {
      const json = JSON.parse(text)
      console.log("Parsed JSON:", json)
      showGameMessage("Connection test successful!", "success")
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      showGameMessage(`Response is not valid JSON: ${text.substring(0, 100)}...`, "error")
    }
  } catch (error) {
    console.error("Connection test failed:", error)
    showGameMessage(`Connection test failed: ${error.message}`, "error")
  } finally {
    setLoading(false)
  }
}

// =======================
// UI Wiring and Event Listeners
// =======================
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, starting app...")

  const retryButton = document.createElement("button")
  retryButton.textContent = "Retry Connection"
  retryButton.style.cssText =
    "margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;"
  retryButton.onclick = retryConnection

  const testButton = document.createElement("button")
  testButton.textContent = "Test Connection"
  testButton.style.cssText =
    "margin-top: 10px; margin-left: 10px; padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;"
  testButton.onclick = testConnection

  if (loadingOverlay) {
    loadingOverlay.appendChild(retryButton)
    loadingOverlay.appendChild(testButton)
  }

  // This is the main entry point of the app
  initializeApp()

  document.getElementById("gamesBtn")?.addEventListener("click", () => switchScreen("gamesScreen"))
  document.getElementById("userGamesBtn")?.addEventListener("click", () => switchScreen("gamesScreen"))
  document.getElementById("backToQuizBtn")?.addEventListener("click", () => switchScreen("startScreen"))

  document.querySelectorAll(".play-game-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const gameType = btn.dataset.game
      await joinGame(gameType)
    })
  })

  document.getElementById("leaveGameBtn")?.addEventListener("click", () => showGameMessage("You left the game", "info"))
  document.getElementById("shareRoomBtn")?.addEventListener("click", () => {
    navigator.clipboard.writeText(window.location.href)
    showGameMessage("Room link copied to clipboard!", "success")
  })
  document
    .getElementById("replayGameBtn")
    ?.addEventListener("click", () => showGameMessage("Replay not implemented yet.", "warning"))
  document.getElementById("quitGameBtn")?.addEventListener("click", () => showGameMessage("You left the game", "info"))
})
