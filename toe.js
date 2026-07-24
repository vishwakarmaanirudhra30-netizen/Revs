// toe.js - Ultimate Unbeatable & Self-Trainable (Anirudh)
(function() {
    'use strict';

    // ─── DOM References ──────────────────────────────────
    const boardEl        = document.getElementById('board');
    const cells          = Array.from(boardEl.querySelectorAll('.cell'));
    const statusEl       = document.getElementById('status');
    const restartBtn     = document.getElementById('restartBtn');
    const playerScoreEl  = document.getElementById('playerScore');
    const aiScoreEl      = document.getElementById('aiScore');
    const drawScoreEl    = document.getElementById('drawScore');

    // ─── Game State ──────────────────────────────────────
    let board        = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';       // Human: X, Anirudh: O
    let gameActive   = true;
    let winningCombo = null;
    let aiTimeout    = null;

    let scores = { player: 0, ai: 0, draw: 0 };

    // ─── Self-Trainable Q-Learning Memory ────────────────
    let qTable = {};
    try {
        const savedQ = localStorage.getItem('anirudh_tictactoe_q_table');
        if (savedQ) qTable = JSON.parse(savedQ);
    } catch(e) { qTable = {}; }

    let currentGameStates = []; 

    function saveQTable() {
        try {
            if (Object.keys(qTable).length > 5000) qTable = {};
            localStorage.setItem('anirudh_tictactoe_q_table', JSON.stringify(qTable));
        } catch(e) {}
    }

    function getInstanceStateKey(b) {
        return b.join('');
    }

    // ─── Win conditions ──────────────────────────────────
    const winConditions = [
        [0,1,2], [3,4,5], [6,7,8],  // rows
        [0,3,6], [1,4,7], [2,5,8],  // columns
        [0,4,8], [2,4,6]            // diagonals
    ];

    // ─── Audio ───────────────────────────────────────────
    let audioCtx = null;
    function ensureAudio() {
        if (!audioCtx) {
            try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
            catch(e) { audioCtx = null; }
        }
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    }
    function playTone(freq, dur, vol = 0.07, type = 'sine') {
        if (!audioCtx) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.frequency.value = freq;
            osc.type = type;
            gain.gain.setValueAtTime(vol, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
            osc.start(); osc.stop(audioCtx.currentTime + dur);
        } catch(e) {}
    }
        // Apni audio file ka path yahan dein (jaise 'fahh.mp3')
        // Audio files setup
    const drawAudio = new Audio('fahh.mp3');         // Draw ke liye
    const anirudhWinAudio = new Audio('w.mp3'); // Anirudh ke jeetne ke liye (yahan apni file ka naam dein)

    const sound = {
        playerMove: ()=> playTone(700, 0.08),
        aiMove:     ()=> playTone(480, 0.1),
        playerWin:  ()=> { playTone(600,0.12); setTimeout(()=>playTone(800,0.12),120); setTimeout(()=>playTone(1000,0.18),240); },
        
        // Jab Anirudh jeetega, tab yeh custom audio play hogi
        aiWin:      ()=> { 
            anirudhWinAudio.currentTime = 0; 
            anirudhWinAudio.play().catch(e => console.log("Audio play blocked:", e)); 
        },
        
        draw:       ()=> { 
            drawAudio.currentTime = 0; 
            drawAudio.play().catch(e => console.log("Audio play blocked:", e)); 
        },
        
        restart:    ()=> playTone(300, 0.06, 0.04, 'triangle')
    };


    // ─── Rendering ───────────────────────────────────────
    function renderBoard() {
        cells.forEach((cell, idx) => {
            cell.classList.remove('x-mark','o-mark','filled','winning','game-over-cell');
            cell.textContent = '';
            const mark = board[idx];
            if (mark === 'X') { cell.textContent = 'X'; cell.classList.add('x-mark','filled'); }
            if (mark === 'O') { cell.textContent = 'O'; cell.classList.add('o-mark','filled'); }
        });
        if (winningCombo && !gameActive) {
            winningCombo.forEach(idx => cells[idx].classList.add('winning'));
        }
        if (!gameActive) cells.forEach(c => c.classList.add('game-over-cell'));
    }

    function updateStatus(text, cssClass) {
        statusEl.textContent = text;
        statusEl.className = 'status';
        if (cssClass) statusEl.classList.add(cssClass);
    }

    function updateScoreboard() {
        playerScoreEl.textContent = scores.player;
        aiScoreEl.textContent = scores.ai;
        drawScoreEl.textContent = scores.draw;
    }

    // ─── Win / Draw checks ──────────────────────────────
    function checkWinner() {
        for (const [a,b,c] of winConditions) {
            if (board[a] && board[a] === board[b] && board[b] === board[c]) return [a,b,c];
        }
        return null;
    }
    function isBoardFull() { return board.every(c => c !== ''); }

    function checkWinnerOnBoard(boardArr, mark) {
        for (const [a,b,c] of winConditions) {
            if (boardArr[a] === mark && boardArr[b] === mark && boardArr[c] === mark) return true;
        }
        return false;
    }

    // ─── End game & Reinforcement Update ──────────────────
    function endGame(result, combo) {
        gameActive = false;
        winningCombo = combo;
        renderBoard();

        let reward = 0;
        switch(result) {
            case 'player': 
                scores.player++; 
                updateStatus('🎉 You Win! (Impossible)','win-state'); 
                sound.playerWin(); 
                reward = -100; // Severe Penalty
                break;
            case 'ai':     
                scores.ai++;     
                updateStatus('🦇 Anirudh Wins!','lose-state'); 
                sound.aiWin(); 
                reward = 10;  // High reward for winning
                break;
            case 'draw':   
                scores.draw++;   
                updateStatus('🤝 It\'s a Draw!','draw-state'); 
                sound.draw(); 
                reward = 2;   // Positive reward for flawless defense
                break;
        }
        updateScoreboard();

        // Q-Learning backpropagation
        currentGameStates.forEach(item => {
            const stateKey = item.state;
            const action = item.action;
            if (!qTable[stateKey]) qTable[stateKey] = {};
            if (!qTable[stateKey][action]) qTable[stateKey][action] = 0;
            
            const lr = 0.3; // Learning rate
            qTable[stateKey][action] += lr * (reward - qTable[stateKey][action]);
        });
        saveQTable();
        currentGameStates = [];
    }

    // ─── UNBEATABLE ALGORITHM: Minimax + Q-Learning ──────
    const AI_MARK = 'O';
    const HUMAN_MARK = 'X';

    function getAvailableMoves(boardState) {
        return boardState.map((val, index) => val === '' ? index : null).filter(val => val !== null);
    }

    // Pure Mathematical Perfection
    function minimax(newBoard, player, alpha, beta, depth) {
        const availSpots = getAvailableMoves(newBoard);
        
        // Depth is used to favor faster wins or longer losses
        if (checkWinnerOnBoard(newBoard, HUMAN_MARK)) return -100 + depth;
        if (checkWinnerOnBoard(newBoard, AI_MARK)) return 100 - depth;
        if (availSpots.length === 0) return 0;

        if (player === AI_MARK) {
            let bestScore = -Infinity;
            for (let i = 0; i < availSpots.length; i++) {
                newBoard[availSpots[i]] = player;
                let score = minimax(newBoard, HUMAN_MARK, alpha, beta, depth + 1);
                newBoard[availSpots[i]] = '';
                bestScore = Math.max(score, bestScore);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break; // Alpha-beta pruning
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < availSpots.length; i++) {
                newBoard[availSpots[i]] = player;
                let score = minimax(newBoard, AI_MARK, alpha, beta, depth + 1);
                newBoard[availSpots[i]] = '';
                bestScore = Math.min(score, bestScore);
                beta = Math.min(beta, score);
                if (beta <= alpha) break; // Alpha-beta pruning
            }
            return bestScore;
        }
    }

    function getAIMove() {
        const stateKey = getInstanceStateKey(board);
        const availSpots = getAvailableMoves(board);
        
        if (availSpots.length === 0) return null;
        if (availSpots.length === 9) return 4; // Always take center if going first

        let bestScore = -Infinity;
        let optimalMoves = [];

        // 1. Find ALL mathematically perfect moves
        for (let i = 0; i < availSpots.length; i++) {
            let idx = availSpots[i];
            board[idx] = AI_MARK;
            let score = minimax(board, HUMAN_MARK, -Infinity, Infinity, 0);
            board[idx] = '';

            if (score > bestScore) {
                bestScore = score;
                optimalMoves = [idx];
            } else if (score === bestScore) {
                optimalMoves.push(idx);
            }
        }

        // 2. Tie-Breaker using Q-Learning (Self-Training)
        let bestAction = optimalMoves[0];
        
        if (qTable[stateKey] && optimalMoves.length > 1) {
            let maxQ = -Infinity;
            let foundTrainedMove = false;
            
            for (let idx of optimalMoves) {
                let qVal = qTable[stateKey][idx] || 0;
                if (qVal > maxQ) {
                    maxQ = qVal;
                    bestAction = idx;
                    foundTrainedMove = true;
                }
            }
            // Add a little randomness among optimal moves if Q-values are equal
            if (!foundTrainedMove || maxQ === 0) {
                bestAction = optimalMoves[Math.floor(Math.random() * optimalMoves.length)];
            }
        } else if (optimalMoves.length > 1) {
            bestAction = optimalMoves[Math.floor(Math.random() * optimalMoves.length)];
        }

        currentGameStates.push({ state: stateKey, action: bestAction });
        return bestAction;
    }

    // ─── Execute move ───────────────────────────────────
    function executeAIMove() {
        if (!gameActive || currentPlayer !== 'O') return;
        const moveIndex = getAIMove();
        if (moveIndex === null) return;

        board[moveIndex] = 'O';
        sound.aiMove();
        renderBoard();

        const aiWin = checkWinner();
        if (aiWin) { endGame('ai', aiWin); return; }
        if (isBoardFull()) { endGame('draw', null); return; }

        currentPlayer = 'X';
        updateStatus('Your Turn', 'player-turn');
    }

    function scheduleAIMove() {
        if (aiTimeout) clearTimeout(aiTimeout);
        // CHANGED HERE: Now it says "Anirudh is calculating..."
        updateStatus('Anirudh is calculating best move…', 'ai-turn');
        
        // Fast reaction time to make it feel intense
        const delay = 300 + Math.floor(Math.random() * 250); 
        aiTimeout = setTimeout(() => {
            aiTimeout = null;
            executeAIMove();
        }, delay);
    }

    // ─── Player move ─────────────────────────────────────
    function handlePlayerMove(index) {
        if (!gameActive) return;
        if (currentPlayer !== 'X') return;
        if (board[index] !== '') return;

        ensureAudio();
        board[index] = 'X';
        sound.playerMove();
        renderBoard();

        const playerWin = checkWinner();
        if (playerWin) { endGame('player', playerWin); return; }
        if (isBoardFull()) { endGame('draw', null); return; }

        currentPlayer = 'O';
        scheduleAIMove();
    }

    // ─── Restart ─────────────────────────────────────────
        // Ek variable track karega ki agle game me kiski pehli turn hogi
    let nextFirstPlayer = 'X'; 

    function restartGame() {
        if (aiTimeout) { clearTimeout(aiTimeout); aiTimeout = null; }
        board = ['', '', '', '', '', '', '', '', ''];
        
        // Turn switch karo (Pehle agar X tha, toh O hoga; agar O tha, toh X hoga)
        currentPlayer = nextFirstPlayer;
        nextFirstPlayer = (nextFirstPlayer === 'X') ? 'O' : 'X'; // Agli baar ke liye badal do

        gameActive = true;
        winningCombo = null;
        renderBoard();

        // Agar Anirudh ki pehli turn hai, toh status update karke uska move trigger karo
        if (currentPlayer === 'O') {
            updateStatus('Anirudh is calculating best move…', 'ai-turn');
            scheduleAIMove();
        } else {
            updateStatus('Your Turn', 'player-turn');
        }

        cells.forEach(c => c.classList.remove('game-over-cell'));
    }


    // ─── Events ──────────────────────────────────────────
    boardEl.addEventListener('click', e => {
        const cell = e.target.closest('.cell');
        if (!cell) return;
        const idx = parseInt(cell.getAttribute('data-index'), 10);
        if (!isNaN(idx)) handlePlayerMove(idx);
    });

    restartBtn.addEventListener('click', () => {
        restartGame();
        ensureAudio();
        sound.restart();
    });

    // ─── Initial render ──────────────────────────────────
    renderBoard();
    updateStatus('Your Turn', 'player-turn');
    updateScoreboard();
})();
