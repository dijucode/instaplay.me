// =======================
// Frontend Configuration
// =======================
const CONFIG = {
    SHEETS_ID: "1hi_iiN08N0nQ6gVLJPjDzbLIz6lZjCMB75U9Q2GadWk", // your spreadsheet ID

    // Google Apps Script Web App URL (replace with your latest deployment URL)
    APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycby2w9l0p1a7Ef0jaiK3_ZEXFo1OgVce_oJy8Bu6vkD4P2RHHpodc8uHLsl_z_K_giPvVw/exec",
    TOPICS_GID: "0",
    QUIZZES_GID: "96315669",
    RESPONSES_GID: "1061310588",
    USERS_GID: "1396828792",
    PENDING_QUIZZES_GID: "1374803034",
    TICTACTOE_ROOMS_GID: "1670647859",
    CONNECT4_ROOMS_GID: "1603557701",
    GAME_HISTORY_GID: "2019136867"
};

const API_BASE = CONFIG.APPS_SCRIPT_URL;

// Get a reference to the loading overlay
const loadingOverlay = document.getElementById("loadingOverlay");

// Helper function to show/hide the loading state
function setLoading(isLoading) {
    if (loadingOverlay) {
        loadingOverlay.style.display = isLoading ? 'flex' : 'none';
    }
}

// UI Helpers
function showGameMessage(message, type) {
    alert(`[${type.toUpperCase()}] ${message}`);
}

// Screen Switching Helper
function switchScreen(screenId) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(screenId);
    if (target) target.classList.add("active");
}

// =======================
// API Calls with Error Handling
// =======================

// Fetch available quiz topics from the backend
async function fetchTopics() {
    setLoading(true);
    const url = `${API_BASE}?action=getTopics`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch topics:", error);
        showGameMessage(`Failed to load topics. Please try again.`, "error");
        return [];
    } finally {
        setLoading(false);
    }
}

// Get available rooms
async function fetchAvailableRooms(gameType) {
    const url = `${API_BASE}?action=getAvailableRooms&gameType=${gameType}`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch available rooms:", error);
        showGameMessage(`Failed to load ${gameType} rooms.`, "error");
        return [];
    }
}

// Get specific room
async function fetchRoom(gameType, roomId) {
    const url = `${API_BASE}?action=getRoom&gameType=${gameType}&roomId=${roomId}`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch room data:", error);
        showGameMessage("Failed to get room data.", "error");
        return null;
    }
}

// Update room
async function updateRoom(gameType, roomId, roomData) {
    const formData = new URLSearchParams();
    formData.append("action", "updateRoom");
    formData.append("gameType", gameType);
    formData.append("roomId", roomId);
    formData.append("roomData", JSON.stringify(roomData));

    try {
        const res = await fetch(API_BASE, { method: "POST", body: formData });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    } catch (error) {
        console.error("Failed to update room:", error);
        showGameMessage("Failed to update room. Please try again.", "error");
        return { success: false, message: "Network error" };
    }
}

// Save game history
async function saveGameHistory(gameData) {
    const formData = new URLSearchParams();
    formData.append("action", "saveGameHistory");
    formData.append("gameData", JSON.stringify(gameData));

    try {
        const res = await fetch(API_BASE, { method: "POST", body: formData });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    } catch (error) {
        console.error("Failed to save game history:", error);
        showGameMessage("Failed to save game history.", "error");
        return { success: false, message: "Network error" };
    }
}

// =======================
// Main Application Logic
// =======================

// Function to populate the topic dropdown
function populateTopics(topics) {
    const select = document.getElementById("topicSelect");
    if (!select) return;

    // Clear existing options
    select.innerHTML = '<option value="">Select a topic...</option>';

    if (topics && topics.length > 0) {
        topics.forEach(topic => {
            const option = document.createElement("option");
            option.value = topic.id;
            option.textContent = topic.name;
            select.appendChild(option);
        });
    } else {
        showGameMessage("No quiz topics available. Please check the backend.", "warning");
    }
}

// Game Join Flow
async function joinGame(gameType) {
    showGameMessage(`Joining ${gameType} room...`, "info");

    const rooms = await fetchAvailableRooms(gameType);
    let room;
    if (rooms.length > 0) {
        room = rooms[0];
        await updateRoom(gameType, room.room_id, { status: "active", player2: "Guest" });
    } else {
        const result = await updateRoom(gameType, Date.now().toString(), { status: "waiting", player1: "Guest" });
        room = { room_id: result.roomId, status: "waiting", player1: "Guest" };
    }

    document.getElementById("currentRoomId").textContent = room.room_id;
    document.getElementById("gameRoomTitle").textContent = gameType === "tictactoe" ? "Tic-Tac-Toe" : "Connect 4";
    switchScreen("gameRoomScreen");

    document.getElementById("tictactoeBoard").classList.toggle("hidden", gameType !== "tictactoe");
    document.getElementById("connect4Board").classList.toggle("hidden", gameType !== "connect4");
}

// Main initialization function
async function initializeApp() {
    console.log("App initializing...");
    
    // First, load the quiz topics for the main screen
    const topics = await fetchTopics();
    populateTopics(topics);

    // Then, load the game room counts
    const tttRooms = await fetchAvailableRooms('tictactoe');
    const c4Rooms = await fetchAvailableRooms('connect4');
    document.getElementById("tictactoeRooms").textContent = `${tttRooms.length}/20 Active`;
    document.getElementById("connect4Rooms").textContent = `${c4Rooms.length}/20 Active`;
}

// =======================
// UI Wiring and Event Listeners
// =======================
document.addEventListener("DOMContentLoaded", () => {
    // This is the main entry point of the app
    initializeApp();

    document.getElementById("gamesBtn")?.addEventListener("click", () => switchScreen("gamesScreen"));
    document.getElementById("userGamesBtn")?.addEventListener("click", () => switchScreen("gamesScreen"));
    document.getElementById("backToQuizBtn")?.addEventListener("click", () => switchScreen("startScreen"));

    document.querySelectorAll(".play-game-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const gameType = btn.dataset.game;
            await joinGame(gameType);
        });
    });

    document.getElementById("leaveGameBtn")?.addEventListener("click", () => showGameMessage("You left the game", "info"));
    document.getElementById("shareRoomBtn")?.addEventListener("click", () => {
        navigator.clipboard.writeText(window.location.href);
        showGameMessage("Room link copied to clipboard!", "success");
    });
    document.getElementById("replayGameBtn")?.addEventListener("click", () => showGameMessage("Replay not implemented yet.", "warning"));
    document.getElementById("quitGameBtn")?.addEventListener("click", () => showGameMessage("You left the game", "info"));
});
