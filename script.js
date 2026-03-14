let game = {
    A: { ans: 0, cur: "", score: 0, canPlay: true },
    B: { ans: 0, cur: "", score: 0, canPlay: true },
    pos: 0,         
    timeLeft: 60,   // Default time, ye start game par change hoga
    status: "WAITING" // Shuru mein game ruka rahega
};

let timerLoop;

// --- DYNAMIC START LOGIC ---
function startGame() {
    // HTML ke select menu se time lena
    let selectedTime = document.getElementById('time-select').value;
    game.timeLeft = parseInt(selectedTime);
    
    // UI update
    document.getElementById('setup-screen').style.display = 'none';
    game.status = "ON";
    
    // Questions generate karna
    genNewQ('A'); 
    genNewQ('B');
    
    // Timer shuru karna
    startTimer();
}

function startTimer() {
    timerLoop = setInterval(() => {
        if (game.timeLeft > 0 && game.status === "ON") {
            game.timeLeft--;
            
            let mins = Math.floor(game.timeLeft / 60);
            let secs = game.timeLeft % 60; // FIX: % 60 hona chahiye 240 nahi
            let displayTime = `${mins < 10 ? '0'+mins : mins}:${secs < 10 ? '0'+secs : secs}`;
            
            document.getElementById('timer').innerText = `⏱ ${displayTime}`;
        } else if (game.status === "ON") {
            matchOver("TIME KHATAM!");
        }
    }, 1000);
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
    if (!game[team].canPlay || game.status !== "ON" || game[team].cur === "") return;

    if (parseInt(game[team].cur) === game[team].ans) {
        game[team].canPlay = false; 
        game[team].score++;
        document.getElementById(`score${team}`).innerText = game[team].score;

        // Responsibility ke liye Percentage movement
        game.pos += (team === 'A' ? -8 : 8); 
        document.getElementById('video-stage').style.transform = `translateX(${game.pos}%)`;

        if (Math.abs(game.pos) >= 45) {
            matchOver(`TEAM ${team === 'A' ? '1' : '2'} NE RASSI KHICH LI!`);
        }

        let btn = document.getElementById(`btn${team}`);
        btn.style.backgroundColor = "#22c55e";

        setTimeout(() => {
            btn.style.backgroundColor = "#3b82f6";
            genNewQ(team); 
        }, 500);
    } else {
        clearInp(team);
        // Galat answer par feedback (Optional: Red shake)
        let screen = document.getElementById(`display${team}`);
        screen.style.color = "red";
        setTimeout(() => { screen.style.color = "white"; }, 300);
    }
}

function genNewQ(team) {
    let n1 = Math.floor(Math.random() * 90) + 1;
    let n2 = Math.floor(Math.random() * 90) + 1;
    game[team].ans = n1 + n2;
    game[team].cur = "";
    game[team].canPlay = true; 
    document.getElementById(`q${team}`).innerText = `${n1} + ${n2} = ?`;
    document.getElementById(`display${team}`).innerText = "0";
}

function matchOver(msg) {
    game.status = "OFF";
    clearInterval(timerLoop);
    document.getElementById('overlay').style.display = 'flex';
    
    if (msg === "TIME KHATAM!") {
        if (game.A.score > game.B.score) msg = "TEAM 1 JEET GAYI (POINTS PE)!";
        else if (game.B.score > game.A.score) msg = "TEAM 2 JEET GAYI (POINTS PE)!";
        else msg = "MATCH DRAW HO GAYA!";
    }
    document.getElementById('winner-text').innerText = msg;
}

// Multiplayer/Firebase Placeholder (Gmail login ke liye)
function loginWithGoogle() {
    console.log("Firebase login trigger...");
    // Jab aap Firebase connect karenge, yahan uska code aayega
    alert("Google Login API connect karni hogi (Firebase Console se)");
}
