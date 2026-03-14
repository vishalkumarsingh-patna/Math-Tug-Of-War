// --- IMPORT SDKs (Inhe HTML me include karna hoga) ---
// Firebase configuration aur Agora setup
let game = {
    A: { ans: 0, cur: "", score: 0, canPlay: true, name: "Player 1" },
    B: { ans: 0, cur: "", score: 0, canPlay: true, name: "Player 2" },
    pos: 0,
    timeLeft: 60,
    status: "WAITING",
    isMuted: false
};

let timerLoop;
let myTeam = 'A'; // Login ke baad decide hoga

// --- FIREBASE & MULTIPLAYER SETUP ---
async function loginWithGoogle() {
    console.log("Starting Google Login...");
    // Firebase Auth logic yahan aayegi
    // Login ke baad joinVoiceChannel() call hoga
    startGame(); 
}

// --- START GAME WITH RESPONSIVE FIX ---
function startGame() {
    let selectedTime = document.getElementById('time-select').value;
    game.timeLeft = parseInt(selectedTime);
    
    document.getElementById('setup-screen').style.display = 'none';
    game.status = "ON";
    
    // Agora Voice Join
    if(typeof joinVoiceChannel === "function") joinVoiceChannel("math-room-1");

    genNewQ('A');
    genNewQ('B');
    startTimer();
}

// --- AGORA VOICE INTEGRATION (PUBG Style) ---
async function joinVoiceChannel(roomId) {
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    const APP_ID = "YOUR_AGORA_APP_ID"; // Yahan apni ID dalein
    
    await client.join(APP_ID, roomId, null, null);
    const localTrack = await AgoraRTC.createMicrophoneAudioTrack();
    await client.publish([localTrack]);

    client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "audio") user.audioTrack.play();
    });
}

// --- UPDATED SUBMIT (With Real-time Logic) ---
function submit(team) {
    if (!game[team].canPlay || game.status !== "ON" || game[team].cur === "") return;

    if (parseInt(game[team].cur) === game[team].ans) {
        game[team].canPlay = false;
        game[team].score++;
        
        // Multiplayer Sync: Firebase par update bhejein
        updateFirebasePos(team);

        game.pos += (team === 'A' ? -8 : 8);
        document.getElementById('video-stage').style.transform = `translateX(${game.pos}%)`;

        if (Math.abs(game.pos) >= 45) {
            matchOver(`TEAM ${team === 'A' ? '1' : '2'} WON!`);
        }

        let btn = document.getElementById(`btn${team}`);
        btn.style.backgroundColor = "#22c55e";

        setTimeout(() => {
            btn.style.backgroundColor = "#3b82f6";
            genNewQ(team);
        }, 500);
    } else {
        triggerWrongAnswerEffect(team);
    }
}

// --- UX IMPROVEMENTS ---
function triggerWrongAnswerEffect(team) {
    clearInp(team);
    let screen = document.getElementById(`display${team}`);
    screen.classList.add('shake-effect'); // CSS me shake animation add karein
    screen.style.color = "red";
    setTimeout(() => { 
        screen.style.color = "white"; 
        screen.classList.remove('shake-effect');
    }, 500);
}

function toggleMute() {
    game.isMuted = !game.isMuted;
    // Agora mic track enable/disable logic
    document.getElementById('mic-icon').innerText = game.isMuted ? "🔇" : "🎙️";
}
