let game = {
    A: { ans: 0, cur: "", score: 0, canPlay: true },
    B: { ans: 0, cur: "", score: 0, canPlay: true },
    pos: 0,         
    timeLeft: 240,   // <--- TIME 240 SECONDS KAR DIYA HAI
    status: "ON"    
};

// --- IMPROVED TIMER LOGIC ---
let timerLoop = setInterval(() => {
    if (game.timeLeft > 0 && game.status === "ON") {
        game.timeLeft--;
        
        // Minutes:Seconds format
        let mins = Math.floor(game.timeLeft / 60);
        let secs = game.timeLeft % 240;
        let displayTime = `${mins < 10 ? '0'+mins : mins}:${secs < 10 ? '0'+secs : secs}`;
        
        document.getElementById('timer').innerText = `⏱ ${displayTime}`;
    } else if (game.status === "ON") {
        matchOver("TIME KHATAM!");
    }
}, 1000);

function press(num, team) {
    if (game.status === "OFF") return;
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
    if (!game[team].canPlay || game.status === "OFF" || game[team].cur === "") return;

    if (parseInt(game[team].cur) === game[team].ans) {
        game[team].canPlay = false; 
        game[team].score++;
        document.getElementById(`score${team}`).innerText = game[team].score;

        // Movement in Percentage (%) for Responsiveness
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

genNewQ('A'); genNewQ('B');
