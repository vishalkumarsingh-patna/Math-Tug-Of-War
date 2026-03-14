// --- AGORA CONFIG ---
const APP_ID = "0cc4d8757a0d448b8b104d631539ad67";
const CHANNEL = "TugOfWar_Lobby";
let client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
let localAudioTrack = null;

let game = {
    A: { ans: 0, cur: "", score: 0 },
    B: { ans: 0, cur: "", score: 0 },
    pos: 0, timeLeft: 60, status: "WAITING", isMuted: false
};

// --- START GAME FUNCTION ---
async function startGame() {
    try {
        // 1. Voice Connection (PUBG Style)
        await client.join(APP_ID, CHANNEL, null, null);
        localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        await client.publish([localAudioTrack]);
        
        client.on("user-published", async (user, mediaType) => {
            await client.subscribe(user, mediaType);
            if (mediaType === "audio") user.audioTrack.play();
        });
        console.log("Voice connected!");

        // 2. UI & Timer Logic
        let selectedTime = document.getElementById('time-select').value;
        game.timeLeft = parseInt(selectedTime);
        document.getElementById('setup-screen').style.display = 'none';
        game.status = "ON";

        genNewQ('A');
        genNewQ('B');
        startTimer();
    } catch (err) {
        console.error("Game Start Error: ", err);
        alert("Please allow Microphone permission to play!");
    }
}

// --- MIC TOGGLE ---
async function toggleMute() {
    if (!localAudioTrack) return;
    game.isMuted = !game.isMuted;
    await localAudioTrack.setEnabled(!game.isMuted);
    const micBtn = document.getElementById('mic-btn');
    micBtn.innerText = game.isMuted ? "🔇" : "🎙️";
    micBtn.classList.toggle('muted');
}

// --- MATH LOGIC ---
function genNewQ(team) {
    let n1 = Math.floor(Math.random() * 20) + 1;
    let n2 = Math.floor(Math.random() * 20) + 1;
    game[team].ans = n1 + n2;
    game[team].cur = "";
    document.getElementById(`q${team}`).innerText = `${n1} + ${n2}`;
    document.getElementById(`display${team}`).innerText = "0";
}

function press(num, team) {
    if (game.status !== "ON") return;
    game[team].cur += num;
    document.getElementById(`display${team}`).innerText = game[team].cur;
}

function submit(team) {
    if (game.status !== "ON" || game[team].cur === "") return;
    if (parseInt(game[team].cur) === game[team].ans) {
        game.pos += (team === 'A' ? -10 : 10);
        document.getElementById('video-stage').style.transform = `translateX(${game.pos}%)`;
        if (Math.abs(game.pos) >= 50) matchOver(`TEAM ${team === 'A' ? '1' : '2'} WON!`);
        genNewQ(team);
    } else {
        document.getElementById(`display${team}`).innerText = "WRONG";
        setTimeout(() => { game[team].cur = ""; document.getElementById(`display${team}`).innerText = "0"; }, 500);
    }
}

function startTimer() {
    let loop = setInterval(() => {
        if (game.timeLeft <= 0 || game.status === "OVER") {
            clearInterval(loop);
            if (game.status !== "OVER") matchOver("TIME UP!");
            return;
        }
        game.timeLeft--;
        document.getElementById('timer').innerText = `⏱ ${game.timeLeft}s`;
    }, 1000);
}

function matchOver(msg) {
    game.status = "OVER";
    document.getElementById('winner-text').innerText = msg;
    document.getElementById('overlay').style.display = 'flex';
}

function loginWithGoogle() {
    alert("Gmail login linked! Now click START GAME.");
}
