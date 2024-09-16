const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const resultScreen = document.getElementById('resultScreen');
const resultMessage = document.getElementById('resultMessage');
const newGameBtn = document.getElementById('newGameBtn');
const difficultySelect = document.getElementById('difficulty');
const startScreen = document.getElementById('startScreen');
const gameContainer = document.getElementById('gameContainer');
const leaderboardBtn = document.getElementById('leaderboardBtn');
const multiplayerOptions = document.getElementById('multiplayerOptions');
const startMultiplayerBtn = document.getElementById('startMultiplayerBtn');
const player1Input = document.getElementById('player1Name');
const player2Input = document.getElementById('player2Name');

let currentPlayer = 'X';
let board = ['', '', '', '', '', '', '', '', ''];
let isGameActive = true;
let isSinglePlayer = true;
let difficulty = 'easy';
let player1Name = 'You';
let player2Name = 'Ai';

// Winning conditions
const winningConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

// Handle Singleplayer selection
document.getElementById('singlePlayerBtn').addEventListener('click', () => {
  isSinglePlayer = true;
  difficultySelect.style.display = 'block'; // Show difficulty options
  startScreen.style.display = 'none';
  gameContainer.style.display = 'block';
});

// Handle Multiplayer selection
document.getElementById('multiPlayerBtn').addEventListener('click', () => {
  isSinglePlayer = false;
  startScreen.style.display = 'none';
  multiplayerOptions.style.display = 'block';
});

// Handle Leaderboard button click
leaderboardBtn.addEventListener('click', () => {
  alert('Leaderboard feature coming soon!');
});

// Start Multiplayer Game
startMultiplayerBtn.addEventListener('click', () => {
  player1Name = player1Input.value.trim() || 'Player 1';
  player2Name = player2Input.value.trim() || 'Player 2';
  multiplayerOptions.style.display = 'none';
  gameContainer.style.display = 'block';
  statusText.textContent = `${player1Name}'s Turn`;
});

// Update difficulty when changed from the dropdown
difficultySelect.addEventListener('change', (e) => {
  difficulty = e.target.value;
});

// Handle a cell click
const handleCellClick = (e) => {
  const cell = e.target;
  const index = cell.getAttribute('data-index');

  if (board[index] !== '' || !isGameActive) return;

  // Player's move
  board[index] = currentPlayer;
  cell.textContent = currentPlayer;

  if (checkWinner()) {
    showResult(`${currentPlayer === 'X' ? player1Name : player2Name} Wins!🎉`);
    isGameActive = false;
    return;
  } else if (board.every(cell => cell !== '')) {
    showResult('Draw!');
    isGameActive = false;
    return;
  }

  // Switch player
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  statusText.textContent = `${currentPlayer === 'X' ? player1Name : player2Name}'s Turn`;

  if (isSinglePlayer && currentPlayer === 'O') {
    setTimeout(() => {
      makeAIMove();
    }, 500);
  }
};

// AI move based on difficulty
const makeAIMove = () => {
  if (!isGameActive) return;

  let aiMove;
  if (difficulty === 'easy') {
    aiMove = getRandomMove();
  } else if (difficulty === 'medium') {
    aiMove = getMediumMove();
  } else if (difficulty === 'hard') {
    aiMove = getBestMove(); // Use minimax for hard level
  }

  board[aiMove] = currentPlayer;
  cells[aiMove].textContent = currentPlayer;

  if (checkWinner()) {
    showResult(`${currentPlayer} Wins!`);
    isGameActive = false;
  } else if (board.every(cell => cell !== '')) {
    showResult('Draw!');
    isGameActive = false;
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusText.textContent = `${currentPlayer === 'X' ? player1Name : player2Name}'s Turn`;
  }
};

// Random AI move (Easy level)
const getRandomMove = () => {
  let availableMoves = board.map((val, idx) => (val === '' ? idx : null)).filter(val => val !== null);
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
};

// Medium level: Try to block player from winning, else random
const getMediumMove = () => {
  const player = currentPlayer === 'X' ? 'O' : 'X';
  
  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];
    if (board[a] === player && board[b] === player && board[c] === '') return c;
    if (board[a] === player && board[c] === player && board[b] === '') return b;
    if (board[b] === player && board[c] === player && board[a] === '') return a;
  }
  
  return getRandomMove();
};

// Hard level (Minimax algorithm for AI to play optimally)
const getBestMove = () => {
  let bestScore = -Infinity;
  let move;

  for (let i = 0; i < board.length; i++) {
    if (board[i] === '') {
      board[i] = currentPlayer;
      let score = minimax(board, 0, false);
      board[i] = '';
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
};

const minimax = (newBoard, depth, isMaximizing) => {
  let scores = { 'X': -1, 'O': 1, 'tie': 0 };

  let result = checkWinnerForMinimax();
  if (result !== null) {
    return scores[result];
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === '') {
        newBoard[i] = 'O';
        let score = minimax(newBoard, depth + 1, false);
        newBoard[i] = '';
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === '') {
        newBoard[i] = 'X';
        let score = minimax(newBoard, depth + 1, true);
        newBoard[i] = '';
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
};

const checkWinnerForMinimax = () => {
  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every(cell => cell !== '')) {
    return 'tie';
  }
  return null;
};

// Check for a winner
const checkWinner = () => {
  return winningConditions.some(condition => {
    return condition.every(index => board[index] === currentPlayer);
  });
};

// Restart the game
const restartGame = () => {
  board = ['', '', '', '', '', '', '', '', ''];
  cells.forEach(cell => cell.textContent = '');
  currentPlayer = 'X';
  isGameActive = true;
  statusText.textContent = `${currentPlayer === 'X' ? player1Name : player2Name}'s Turn`;
};

// Show the result
const showResult = (message) => {
  resultMessage.textContent = message;
  resultScreen.style.display = 'flex';
};

// Start a new game
const newGame = () => {
  restartGame();
  resultScreen.style.display = 'none';
};

// Event listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', restartGame);
newGameBtn.addEventListener('click', newGame);
statusText.textContent = `${currentPlayer === 'X' ? player1Name : player2Name}'s Turn`;


