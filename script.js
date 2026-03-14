// Game ki state maintain karne ke liye object
let game = {
    A: { ans: 0, cur: "", score: 0, canPlay: true },
    B: { ans: 0, cur: "", score: 0, canPlay: true },
    pos: 0,         // Percentage mein position (0 = center)
    timeLeft: 30,   // Match ka time
    status: "ON"    // Game chalu hai ya khatam
};

// --- TIMER LOGIC ---
let timerLoop = setInterval(() => {
    if (game.timeLeft > 0 && game.status === "ON") {
        game.timeLeft--;
        let displayTime = game.timeLeft < 10 ? '0' + game.timeLeft : game.timeLeft;
        document.getElementById('timer').innerText = `⏱ 00:${displayTime}`;
    } else if (game.status === "ON") {
        matchOver("TIME KHATAM!");
    }
}, 1000);

// Keypad press handle karne ke liye
function press(num, team) {
    if (game.status === "OFF") return;
    if (game[team].cur.length < 4) {
        game[team].cur += num;
        document.getElementById(`display${team}`).innerText = game[team].cur;
    }
}

// Input clear karne ke liye
function clearInp(team) {
    game[team].cur = "";
    document.getElementById(`display${team}`).innerText = "0";
}

// Jawab submit karne ka logic
function submit(team) {
    if (!game[team].canPlay || game.status === "OFF" || game[team].cur === "") return;

    if (parseInt(game[team].cur) === game[team].ans) {
        game[team].canPlay = false; 
        game[team].score++;
        document.getElementById(`score${team}`).innerText = game[team].score;

        // --- RESPONSIVE LOGIC ---
        // Pixels ki jagah percentage use kar rahe hain (Har screen pe sahi chalega)
        let shift = (team === 'A' ? -10 : 10); 
        game.pos += shift;
        
        // Video stage ko move karna
        document.getElementById('video-stage').style.transform = `translateX(${game.pos}%)`;

        // Winning condition check (e.g., 50% shift hone par jeet)
        if (Math.abs(game.pos) >= 50) {
            matchOver(`TEAM ${team === 'A' ? '1' : '2'} NE RASSI KHICH LI!`);
        }

        // Feedback
        let btn = document.getElementById(`btn${team}`);
        let originalColor = btn.style.backgroundColor;
        btn.style.backgroundColor = "#22c55e";

        setTimeout(() => {
            btn.style.backgroundColor = originalColor;
            genNewQ(team); 
        }, 500);
    } else {
        clearInp(team);
    }
}

// Naya random sawal banane ke liye
function genNewQ(team) {
    let n1 = Math.floor(Math.random() * 90) + 1;
    let n2 = Math.floor(Math.random() * 90) + 1;
    game[team].ans = n1 + n2;
    game[team].cur = "";
    game[team].canPlay = true; 
    document.getElementById(`q${team}`).innerText = `${n1} + ${n2} = ?`;
    document.getElementById(`display${team}`).innerText = "0";
}

// Match khatam hone pe result dikhane ke liye
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

// Init
genNewQ('A'); genNewQ('B');
