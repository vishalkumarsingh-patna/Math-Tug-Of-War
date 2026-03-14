// --- CONFIGURATION ---
const APP_ID = "0cc4d8757a0d448b8b104d631539ad67";
const CHANNEL = "MathTugLobby";
let client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
let localAudioTrack;

let game = {
    A: { ans: 0, cur: "", score: 0 },
    B: { ans: 0, cur: "", score: 0 },
    pos: 0,
    timeLeft: 60,
    status: "WAITING",
    isMuted: false
};

// --- START GAME & VOICE ---
async function startGame() {
    let selectedTime = document.getElementById('time-select').value;
    game.timeLeft = parseInt(selectedTime);
    
    document.getElementById('setup-screen').style.display = 'none';
    game.status = "ON";

    // PUBG Style Voice Join
    try {
        await client.join(APP_ID, CHANNEL, null, null);
        localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        await client.publish([localAudioTrack]);
        console.log("Voice Chat Connected");

        client.on("user-published", async (user, mediaType) => {
            await client.subscribe(user, mediaType);
            if (mediaType === "audio") user.audioTrack.play();
        });
    } catch (err) {
        console.error("Voice Chat failed: ", err);
    }

    genNewQ('A');
    genNewQ('B');
    startTimer();
}

// --- VOICE MUTE LOGIC ---
async function toggleMute() {
    if (!localAudioTrack) return;
    game.isMuted = !game.isMuted;
    await localAudioTrack.setEnabled(!game.isMuted);
    
    const micBtn = document.getElementById('mic-btn');
    if (game.isMuted) {
        micBtn.classList.add('muted');
        micBtn.innerText = "🔇";
    } else {
        micBtn.classList.remove('muted');
        micBtn.innerText = "🎙️";
    }
}

// --- GAME CORE LOGIC ---
function genNewQ(team) {
    let n1 = Math.floor(Math.random() * 50) + 1;
    let n2 = Math.floor(Math.random() * 50) + 1;
    game[team].ans = n1 + n2;
    game[team].cur = "";
    document.getElementById(`q${team}`).innerText = `${n1} + ${n2}`;
    document.getElementById(`display${team}`).innerText = "0";
}

function press(num, team) {
    if (game.status !== "ON") return;
    if (game[team].cur.length < 4) {
        game[team].cur += num;
        document.getElementById(`display${team}`).innerText = game[team].cur;
    }
}

function clearInp(team) {
    game[team].cur = "";
    document.getElementById(`display${team}`).innerText = "0";
}

function submit(team) {
    if (game.status !== "ON" || game[team].cur === "") return;

    if (parseInt(game[team].cur) === game[team].ans) {
        game.pos += (team === 'A' ? -8 : 8);
        document.getElementById('video-stage').style.transform = `translateX(${game.pos}%)`;
        
        if (Math.abs(game.pos) >= 45) {
            matchOver(`TEAM ${team === 'A' ? '1' : '2'} JEET GAYI!`);
        }
        genNewQ(team);
    } else {
        triggerWrongEffect(team);
    }
}

function triggerWrongEffect(team) {
    let display = document.getElementById(`display${team}`);
    display.style.color = "red";
    setTimeout(() => { display.style.color = "#22c55e"; clearInp(team); }, 500);
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
    // Basic trigger for now
    alert("Gmail Login Successfully!");
}
