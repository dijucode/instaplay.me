// =======================
// Frontend Configuration
// =======================
const CONFIG = {
    SHEETS_ID: "1hi_iiN08N0nQ6gVLJPjDzbLIz6lZjCMB75U9Q2GadWk", // your spreadsheet ID

    // Google Apps Script Web App URL (replace with your latest deployment URL)
    APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbx95C6sJfaJUoO-hdqDhUIq-IuFQNdL8LFKyjulkyHzN0YamE06KgQGJ4qInyBCoTtUjQ/exec",

    // GIDs for each sheet (from your sheet URLs)
    TOPICS_GID: "0",
    QUIZZES_GID: "96315669",
    RESPONSES_GID: "1061310588",
    USERS_GID: "1396828792",
    PENDING_QUIZZES_GID: "1374803034",
    TICTACTOE_ROOMS_GID: "1670647859",
    CONNECT4_ROOMS_GID: "1603557701",
    GAME_HISTORY_GID: "2019136867"
};

// =======================
// API Helpers
// =======================
const API_BASE = CONFIG.APPS_SCRIPT_URL;

// Get available rooms
async function fetchAvailableRooms(gameType) {
    const url = `${API_BASE}?action=getAvailableRooms&gameType=${gameType}`;
    const res = await fetch(url);
    return await res.json();
}

// Get specific room
async function fetchRoom(gameType, roomId) {
    const url = `${API_BASE}?action=getRoom&gameType=${gameType}&roomId=${roomId}`;
    const res = await fetch(url);
    return await res.json();
}

// Update room
async function updateRoom(gameType, roomId, roomData) {
    const formData = new URLSearchParams();
    formData.append("action", "updateRoom");
    formData.append("gameType", gameType);
    formData.append("roomId", roomId);
    formData.append("roomData", JSON.stringify(roomData));

    const res = await fetch(API_BASE, { method: "POST", body: formData });
    return await res.json();
}

// Save game history
async function saveGameHistory(gameData) {
    const formData = new URLSearchParams();
    formData.append("action", "saveGameHistory");
    formData.append("gameData", JSON.stringify(gameData));

    const res = await fetch(API_BASE, { method: "POST", body: formData });
    return await res.json();
}

// =======================
// Game UI Functions
// =======================
function leaveGame() {
    showGameMessage("You left the game", "info");
}

function shareRoom() {
    navigator.clipboard.writeText(window.location.href);
    showGameMessage("Room link copied to clipboard!", "success");
}

function replayGame() {
    showGameMessage("Replay not implemented yet.", "warning");
}

function showGameMessage(message, type) {
    alert(`[${type.toUpperCase()}] ${message}`);
}

function showGameRoom() {
    console.log("Showing game room UI...");
}

function updateGameUI() {
    console.log("Updating game UI...");
}

// =======================
// Example Usage
// =======================
async function testAPIs() {
    console.log("Fetching available TicTacToe rooms...");
    const rooms = await fetchAvailableRooms("tictactoe");
    console.log("Rooms:", rooms);

    if (rooms.length > 0) {
        const roomId = rooms[0].room_id;
        console.log(`Fetching room ${roomId}...`);
        const room = await fetchRoom("tictactoe", roomId);
        console.log("Room data:", room);

        console.log("Updating room...");
        const result = await updateRoom("tictactoe", roomId, { status: "waiting", player1: "UserA" });
        console.log("Update result:", result);
    }
}

// =======================
// UI Wiring
// =======================

document.addEventListener("DOMContentLoaded", () => {
    // --- Navigation ---
    const gamesBtn = document.getElementById("gamesBtn");
    const userGamesBtn = document.getElementById("userGamesBtn");
    const backToQuizBtn = document.getElementById("backToQuizBtn");

    if (gamesBtn) gamesBtn.addEventListener("click", () => switchScreen("gamesScreen"));
    if (userGamesBtn) userGamesBtn.addEventListener("click", () => switchScreen("gamesScreen"));
    if (backToQuizBtn) backToQuizBtn.addEventListener("click", () => switchScreen("startScreen"));

    // --- Game selection buttons ---
    document.querySelectorAll(".play-game-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const gameType = btn.dataset.game;
            await joinGame(gameType);
        });
    });

    // --- Game room actions ---
    const leaveGameBtn = document.getElementById("leaveGameBtn");
    const shareRoomBtn = document.getElementById("shareRoomBtn");
    const replayGameBtn = document.getElementById("replayGameBtn");
    const quitGameBtn = document.getElementById("quitGameBtn");

    if (leaveGameBtn) leaveGameBtn.addEventListener("click", leaveGame);
    if (shareRoomBtn) shareRoomBtn.addEventListener("click", shareRoom);
    if (replayGameBtn) replayGameBtn.addEventListener("click", replayGame);
    if (quitGameBtn) quitGameBtn.addEventListener("click", leaveGame);
});

// =======================
// Screen Switching Helper
// =======================
function switchScreen(screenId) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(screenId);
    if (target) target.classList.add("active");
}

// =======================
// Game Join Flow
// =======================
async function joinGame(gameType) {
    showGameMessage(`Joining ${gameType} room...`, "info");

    const rooms = await fetchAvailableRooms(gameType);
    let room;
    if (rooms.length > 0) {
        room = rooms[0]; // pick the first available room
        await updateRoom(gameType, room.room_id, { status: "active", player2: "Guest" });
    } else {
        // create a new room
        const result = await updateRoom(gameType, Date.now().toString(), { status: "waiting", player1: "Guest" });
        room = { room_id: result.roomId, status: "waiting", player1: "Guest" };
    }

    // Show room
    document.getElementById("currentRoomId").textContent = room.room_id;
    document.getElementById("gameRoomTitle").textContent = gameType === "tictactoe" ? "Tic-Tac-Toe" : "Connect 4";
    switchScreen("gameRoomScreen");

    // Show board
    document.getElementById("tictactoeBoard").classList.toggle("hidden", gameType !== "tictactoe");
    document.getElementById("connect4Board").classList.toggle("hidden", gameType !== "connect4");
}


// Run test
// testAPIs();
