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
    return findBestMove(origBoard, aiPlayer);
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

// check if there is any move left
function isMoveLeft(board) {
    for (let elem of board) {
        if (typeof elem === 'number') {
            return true;
        }
    }
    return false;
}

// evaluate the board
// return -10 if human player wins
// return 10 if ai player wins
// return 0 if
function evaluate(board) {
    if (checkWin(board, huPlayer)) {
        return -10;
    } else if (checkWin(board, aiPlayer)) {
        return 10;
    } else if (!isMoveLeft(board)) {
        return 0;
    }
}

// consider all possible ways the game can go and return
// the value of the board
function minimax_0(board, depth, player) {
    treeLength++;
    let score = evaluate(board);

    if (score === 10 ) {
        return score;
    }

    if (score === -10) {
        return score;
    }

    if (!isMoveLeft(board)) {
        return 0;
    }

    // ai player is the maximizer
    if (player === aiPlayer) {
        let best = -Infinity;

        for (let [i, elem] of board.entries()) {
            if (typeof elem === 'number') {
                // make the move
                board[i] = player;

                // call minimax recursively and choose
                // the maximum value
                best = Math.max(best, minimax_0(board, depth + 1, huPlayer));

                // undo the move
                board[i] = i;
            }
        }

        return best;
    }

    // hu player is the minimizer
    if (player === huPlayer) {
        let best = +Infinity;

        for (let [i, elem] of board.entries()) {
            if (typeof elem === 'number') {
                // make the move
                board[i] = player;

                // call minimax recursively and choose
                // the minimum value
                best = Math.min(best, minimax_0(board, depth + 1, aiPlayer));

                // undo the move
                board[i] = i;
            }
        }

        return best;
    }
}

// return index of the best move
function findBestMove(board, player) {
    let bestVal = -Infinity;
    let index = -1;

    for (let [i, elem] of board.entries()) {
        if (typeof elem === 'number') {
            // make the move
            board[i] = player;

            // call minimax recursively and choose
            // the minimum value
            let moveVal = minimax_0(board, 0, huPlayer);

            // undo the move
            board[i] = i;

            // update best if current move is greater than best
            if (moveVal > bestVal) {
                index = i;
                bestVal = moveVal;
            }
        }
    }
    return index;
}

// // get the best move in the current board
// // ai is the maximizer
// // human is the minimizer
// function minimax(newBoard, player) {
// 	treeLength++;
// 	// get all available spots
// 	let availSpots = emptySquares(newBoard);
//
// 	// return a value (-10, 0, 10) if a terminal state is found
// 	// 3 terminal states:
// 	// - human player wins
// 	// - ai player wins
// 	// - 2 players tie
// 	if (checkWin(newBoard, huPlayer)) {
// 		return {score: -10};
// 	} else if (checkWin(newBoard, aiPlayer)) {
// 		return {score: 10};
// 	} else if (availSpots.length === 0) {
// 		return {score: 0};
// 	}
//
// 	// collect move objects in array moves
// 	let moves = [];
//
// 	// loop through all available spots
// 	for (let i = 0; i < availSpots.length; i++) {
//
// 		// create an object for a spot
// 		let move = {};
// 		// save its index
// 		move.index = newBoard[availSpots[i]];
// 		// place current player in that spot
// 		newBoard[availSpots[i]] = player;
//
// 		// collect the score of the opponent with minimax
// 		let result;
// 		if (player === aiPlayer) {
// 			result = minimax(newBoard, huPlayer);
// 			move.score = result.score;
// 		} else {
// 			result = minimax(newBoard, aiPlayer);
// 			move.score = result.score;
// 		}
//
// 		// reset the spot to empty
// 		newBoard[availSpots[i]] = move.index;
//
// 		// prune here
//         if ((player === aiPlayer && move.score === 10) || (player === huPlayer && move.score === -10))
//             return move;
//         else
//             moves.push(move);
// 	}
//
// 	// find the best move (with best score) from all the moves
// 	let bestMove;
// 	let bestScore;
//
// 	// look for the highest score if player is ai
// 	if (player === aiPlayer) {
// 		bestScore = -Infinity;
//
// 		for (let i = 0; i < moves.length; i++) {
// 			if (moves[i].score > bestScore) {
// 				bestScore = moves[i].score;
// 				bestMove = i;
// 			}
// 		}
// 	// look for the lowest score if player is human
// 	} else {
// 		bestScore = Infinity;
//
// 		for (let i = 0; i < moves.length; i++) {
// 			if (moves[i].score < bestScore) {
// 				bestScore = moves[i].score;
// 				bestMove = i;
// 			}
// 		}
// 	}
//
// 	// return the best move
// 	return moves[bestMove];
// }
