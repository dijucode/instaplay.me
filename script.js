// =======================
// Frontend Configuration
// =======================
const CONFIG = {
    SHEETS_ID: "1hi_iiN08N0nQ6gVLJPjDzbLIz6lZjCMB75U9Q2GadWk", // your spreadsheet ID

    // Google Apps Script Web App URL (replace with your latest deployment URL)
    APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycby1EGLYacvRMftUlS77xg_oNI4KcD_BgVexxaXRluj-nsRyxGoZBZRw8Ozl0QV1rgi0Ng/exec",
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

// UI Wiring
document.addEventListener("DOMContentLoaded", () => {
    console.log("1. DOM loaded. Starting app initialization.");
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
