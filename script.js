// Game ki state maintain karne ke liye object
let game = {
    A: { ans: 0, cur: "", score: 0, canPlay: true },
    B: { ans: 0, cur: "", score: 0, canPlay: true },
    pos: 0,         // Video kitna khichna hai
    timeLeft: 30,   // Match ka time
    status: "ON"    // Game chalu hai ya khatam
};

// --- TIMER LOGIC ---
let timerLoop = setInterval(() => {
    if (game.timeLeft > 0 && game.status === "ON") {
        game.timeLeft--;
        document.getElementById('timer').innerText = `⏱ 00:${game.timeLeft < 10 ? '0' + game.timeLeft : game.timeLeft}`;
    } else {
        matchOver("TIME KHATAM!");
    }
}, 1000);

// Keypad press handle karne ke liye
function press(num, team) {
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
    // ANTI-CHEAT: Agar game khatam hai ya pehle se submit kar chuke ho toh ruko
    if (!game[team].canPlay || game.status === "OFF" || game[team].cur === "") return;

    if (parseInt(game[team].cur) === game[team].ans) {
        game[team].canPlay = false; // Button lock kar do
        game[team].score++;
        document.getElementById(`score${team}`).innerText = game[team].score;

        // Rassi khichne ka logic (Team A: Left, Team B: Right)
        game.pos += (team === 'A' ? -60 : 60); 
        document.getElementById('video-stage').style.transform = `translateX(${game.pos}px)`;

        // Agar rassi ekdum kinare pahunch jaye (Win by Pull)
        if (Math.abs(game.pos) >= 300) {
            matchOver(`TEAM ${team === 'A' ? '1' : '2'} NE RASSI KHICH LI!`);
        }

        // Button ka color badal ke feedback do (No Pop-up)
        document.getElementById(`btn${team}`).style.backgroundColor = "#22c55e";

        setTimeout(() => {
            document.getElementById(`btn${team}`).style.backgroundColor = "#3b82f6";
            genNewQ(team); // Naya sawal aayega aur button unlock hoga
        }, 500);
    } else {
        clearInp(team); // Galat jawab pe input saaf
    }
}

// Naya random sawal banane ke liye
function genNewQ(team) {
    let n1 = Math.floor(Math.random() * 90) + 1;
    let n2 = Math.floor(Math.random() * 90) + 1;
    game[team].ans = n1 + n2;
    game[team].cur = "";
    game[team].canPlay = true; // Button wapas chalu
    document.getElementById(`q${team}`).innerText = `${n1} + ${n2} = ?`;
    document.getElementById(`display${team}`).innerText = "0";
}

// Match khatam hone pe result dikhane ke liye
function matchOver(msg) {
    game.status = "OFF";
    clearInterval(timerLoop);
    document.getElementById('overlay').style.display = 'flex';
    
    // Agar time up hua toh points check karo
    if (msg === "TIME KHATAM!") {
        if (game.A.score > game.B.score) msg = "TEAM 1 JEET GAYI (POINTS PE)!";
        else if (game.B.score > game.A.score) msg = "TEAM 2 JEET GAYI (POINTS PE)!";
        else msg = "MATCH DRAW HO GAYA!";
    }
    document.getElementById('winner-text').innerText = msg;
}

// Pehli baar sawal load karo
genNewQ('A'); genNewQ('B');