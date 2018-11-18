let origBoard;
let huPlayer = 'O';
let aiPlayer = 'X';
let treeLength = 0;
let alpha = Infinity;
let beta = -Infinity;
const winCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

const cells = document.querySelectorAll('.cell');
startGame();

function selectSym(sym) {
    huPlayer = sym;
    aiPlayer = sym === 'O' ? 'X' : 'O';
    origBoard = Array.from(Array(9).keys());

    for (let i = 0; i < cells.length; i++) {
        cells[i].addEventListener('click', turnClick, false);
    }

    if (aiPlayer === 'X') {
        turn(bestSpot(), aiPlayer);
        console.log(treeLength);
        treeLength = 0;
    }

    document.querySelector('.selectSym').style.display = 'none';
}

function startGame() {
    document.querySelector('.endgame').style.display = "none";
    document.querySelector('.selectSym').style.display = "block";
    for (let i = 0; i < cells.length; i++) {
        cells[i].innerText = '';
        cells[i].style.removeProperty('background-color');
    }
}

function turnClick(square) {
    if (typeof origBoard[square.target.id] === 'number') {
        turn(square.target.id, huPlayer);
        if (!checkWin(origBoard, huPlayer) && !checkTie())
            turn(bestSpot(), aiPlayer);
    }
    console.log(treeLength);
    treeLength = 0;
}

function turn(squareId, player) {
    origBoard[squareId] = player;
    document.getElementById(squareId).innerText = player;
    let gameWon = checkWin(origBoard, player);
    if (gameWon)
        gameOver(gameWon);
    checkTie();
}

function checkWin(board, player) {
    let plays = board.reduce((a, e, i) => e === player ? a.concat(i) : a, []);
    let gameWon = null;
    for (let [index, win] of winCombos.entries()) {
        if (match(win, plays)) {
            gameWon = {index: index, player: player};
            break;
        }
    }
    return gameWon;
}

function match(win, plays) {
    return win.every(e => plays.includes(e));
}

function gameOver(gameWon) {
    for (let index of winCombos[gameWon.index]) {
        document.getElementById(String(index)).style.backgroundColor =
            gameWon.player === huPlayer ? "blue" : "red";
    }

    for (let i = 0; i < cells.length; i++) {
        cells[i].removeEventListener('click', turnClick, false);
    }

    declareWinner(gameWon.player === huPlayer ? "You win!" : "You lose!");
}

function declareWinner(who) {
    document.querySelector(".endgame").style.display = "block";
    document.querySelector(".endgame .text").innerText = who;
}

function emptySquares() {
    return origBoard.filter(s => typeof s === 'number');
}

function bestSpot() {
    return minimax(origBoard, aiPlayer).index;
}

function checkTie() {
    if (emptySquares().length === 0) {
        for (let i = 0; i < cells.length; i++) {
            cells[i].style.backgroundColor = "green";
            cells[i].removeEventListener('click', turnClick, false);
        }
        declareWinner("Tie Game!");
        return true;
    }
    return false;
}

// get the best move in the current board
function minimax(newBoard, player) {
	treeLength++;
	// get all available spots
	let availSpots = emptySquares(newBoard);

	// return a value (-10, 0, 10) if a terminal state is found
	// 3 terminal states:
	// - human player wins
	// - ai player wins
	// - 2 players tie
	if (checkWin(newBoard, huPlayer)) {
		return {score: -10};
	} else if (checkWin(newBoard, aiPlayer)) {
		return {score: 10};
	} else if (availSpots.length === 0) {
		return {score: 0};
	}

	// collect move objects in array moves
	let moves = [];

	// loop through all available spots
	for (let i = 0; i < availSpots.length; i++) {

		// create an object for a spot
		let move = {};
		// save its index
		move.index = newBoard[availSpots[i]];
		// place current player in that spot
		newBoard[availSpots[i]] = player;

		// collect the score of the opponent with minimax
		let result;
		if (player === aiPlayer) {
			result = minimax(newBoard, huPlayer);
			move.score = result.score;
		} else {
			result = minimax(newBoard, aiPlayer);
			move.score = result.score;
		}

		// reset the spot to empty
		newBoard[availSpots[i]] = move.index;

		// prune here
        if ((player === aiPlayer && move.score === 10) || (player === huPlayer && move.score === -10))
            return move;
        else
            moves.push(move);
	}

	// find the best move (with best score) from all the moves
	let bestMove;
	let bestScore;

	// look for the highest score if player is ai
	if (player === aiPlayer) {
		bestScore = -Infinity;

		for (let i = 0; i < moves.length; i++) {
			if (moves[i].score > bestScore) {
				bestScore = moves[i].score;
				bestMove = i;
			}
		}
	// look for the lowest score if player is human
	} else {
		bestScore = Infinity;

		for (let i = 0; i < moves.length; i++) {
			if (moves[i].score < bestScore) {
				bestScore = moves[i].score;
				bestMove = i;
			}
		}
	}

	// return the best move
	return moves[bestMove];
}

// get the best move in the current board
// function minimax(newBoard, player) {
//     treeLength++;
//     // get all available spots
//     let availSpots = emptySquares(newBoard);
//
//     // return a value (-10, 0, 10) if a terminal state is found
//     // 3 terminal states:
//     // - human player wins
//     // - ai player wins
//     // - 2 players tie
//     if (checkWin(newBoard, huPlayer)) {
//         return {score: -10};
//     } else if (checkWin(newBoard, aiPlayer)) {
//         return {score: 10};
//     } else if (availSpots.length === 0) {
//         return {score: 0};
//     }
//
//     // look for the highest score if player is ai
//     if (player === aiPlayer) {
//         let maxEval = -Infinity;
//         let move;
//         let theEval;
//         for (let i = 0; i < availSpots.length; i++) {
//             move = {};
//             // save its index
//             move.index = newBoard[availSpots[i]];
//             // place current player in that spot
//             newBoard[availSpots[i]] = player;
//
//             // collect the score of the opponent with minimax
//             theEval = minimax(newBoard, huPlayer);
//             maxEval = Math.max(maxEval, theEval.score);
//             move.score = maxEval;
//
//             // reset the spot to empty
//             newBoard[availSpots[i]] = move.index;
//         }
//
//         return move;
//     }
//     // look for the lowest score if player is human
//     else {
//         let minEval = +Infinity;
//         let move;
//         let theEval;
//         for (let i = 0; i < availSpots.length; i++) {
//             move = {};
//             // save its index
//             move.index = newBoard[availSpots[i]];
//             // place current player in that spot
//             newBoard[availSpots[i]] = player;
//
//             // collect the score of the opponent with minimax
//             theEval = minimax(newBoard, aiPlayer);
//             minEval = Math.min(minEval, theEval.score);
//             move.score = minEval;
//
//             // reset the spot to empty
//             newBoard[availSpots[i]] = move.index;
//         }
//         return move;
//     }
// }
