const APP_ID = "0cc4d8757a0d448b8b104d631539ad67";
let client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
let localAudioTrack;

let game = {
    A: { ans: 0, cur: "", score: 0 },
    B: { ans: 0, cur: "", score: 0 },
    pos: 0, timeLeft: 60, status: "WAITING", isMuted: false
};

async function startGame() {
    game.timeLeft = parseInt(document.getElementById('time-select').value);
    document.getElementById('setup-screen').style.display = 'none';
    game.status = "ON";
    
    // Voice Join
    try {
        await client.join(APP_ID, "math-tug", null, null);
        localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        await client.publish([localAudioTrack]);
        client.on("user-published", async (user, mediaType) => {
            await client.subscribe(user, mediaType);
            if (mediaType === "audio") user.audioTrack.play();
        });
    } catch(e) { console.log("Mic error"); }

    genNewQ('A'); genNewQ('B');
    startTimer();
}

function toggleMute() {
    if(!localAudioTrack) return;
    game.isMuted = !game.isMuted;
    localAudioTrack.setEnabled(!game.isMuted);
    document.getElementById('mic-btn').classList.toggle('muted');
    document.getElementById('mic-btn').innerText = game.isMuted ? "🔇" : "🎙️";
}

function genNewQ(team) {
    let n1 = Math.floor(Math.random() * 50);
    let n2 = Math.floor(Math.random() * 50);
    game[team].ans = n1 + n2;
    game[team].cur = "";
    document.getElementById(`q${team}`).innerText = `${n1} + ${n2}`;
    document.getElementById(`display${team}`).innerText = "0";
}

function press(num, team) {
    if(game.status !== "ON") return;
    game[team].cur += num;
    document.getElementById(`display${team}`).innerText = game[team].cur;
}

function clearInp(team) {
    game[team].cur = "";
    document.getElementById(`display${team}`).innerText = "0";
}

function submit(team) {
    if(game.status !== "ON" || game[team].cur === "") return;
    if(parseInt(game[team].cur) === game[team].ans) {
        game.pos += (team === 'A' ? -8 : 8);
        document.getElementById('video-stage').style.transform = `translateX(${game.pos}%)`;
        if(Math.abs(game.pos) >= 45) matchOver(`TEAM ${team === 'A' ? '1' : '2'} WON!`);
        genNewQ(team);
    } else {
        clearInp(team);
    }
}

function startTimer() {
    let loop = setInterval(() => {
        if(game.timeLeft <= 0) { clearInterval(loop); matchOver("TIME UP!"); }
        game.timeLeft--;
        document.getElementById('timer').innerText = `⏱ ${game.timeLeft}s`;
    }, 1000);
}

function matchOver(msg) {
    game.status = "OVER";
    document.getElementById('winner-text').innerText = msg;
    document.getElementById('overlay').style.display = 'flex';
}

function loginWithGoogle() { alert("Google Login logic connected!"); startGame(); }
