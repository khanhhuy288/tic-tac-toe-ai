let origBoard;
let huPlayer;
let aiPlayer;
let numNodes = 0;
let gridSize = 3;
let winCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

let cells = $('.cell');
startGame();

function startGame() {
    $('.endgame').css({'display' : 'none'});
    $('.selectSym').css({'display' : 'block'});
    cells.text('');
    cells.css({'background-color' : ''});
}

function selectSym(sym) {
    huPlayer = sym;
    aiPlayer = sym === 'O' ? 'X' : 'O';
    origBoard = Array.from(Array(gridSize * gridSize).keys());

    cells.on("click", turnClick);

    $('.selectSym').css({'display' : 'none'});

    if (aiPlayer === 'X') {
        turn([0, 2, 6, 8][Math.floor(Math.random()*4)], aiPlayer);
        console.log(numNodes);
        numNodes = 0;
    }
}

function turnClick(square) {
    if (typeof origBoard[square.target.id] === 'number') {
        turn(square.target.id, huPlayer);
        if (!checkWin(origBoard, huPlayer) && !checkTie())
            turn(bestSpot(), aiPlayer);
    }
    console.log(numNodes);
    numNodes = 0;
}

function turn(squareId, player) {
    origBoard[squareId] = player;
    $('#' + squareId).text(player).css({'color' : player === 'X' ? '#3FC0E0' : '#E95151'});
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

function checkTie() {
    if (!isMoveLeft(origBoard)) {
        cells.css({'background-color' : '#414141'});
        cells.off('click');
        declareWinner("It's a Tie!");
        return true;
    }
    return false;
}

function match(win, plays) {
    return win.every(e => plays.includes(e));
}

function gameOver(gameWon) {
    for (let index of winCombos[gameWon.index]) {
        $('#' + index).css({'background-color' : "#414141"});
    }

    cells.off('click');

    declareWinner(gameWon.player === huPlayer ? "You win!" : "You lose!");
}

function declareWinner(who) {
    $(".endgame").css({'display' : 'block'});
    $(".endgame .text").text(who);
}

function bestSpot() {
    return findBestMove(origBoard, aiPlayer);
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
function minimax(board, player, depth, alpha, beta) {
    numNodes++;

    let score = evaluate(board);

    // ai player wins
    if (score === 10) {
        return score - depth;
    }

    // human player wins
    if (score === -10) {
        return score + depth;
    }

    // a tie
    if (!isMoveLeft(board)) {
        return 0;
    }

    // ai player is the maximizer
    if (player === aiPlayer) {
        let best = -Infinity;
        let val;
        for (let [i, elem] of board.entries()) {
            if (typeof elem === 'number') {
                // make the move
                board[i] = player;

                // call minimax recursively and choose
                // the maximum value
                val = minimax(board, huPlayer, depth + 1, alpha, beta);
                best = Math.max(best, val);

                // undo the move
                board[i] = i;

                alpha = Math.max(alpha, val);
                if (beta <= alpha) {
                    break;
                }
            }
        }

        return best;
    }

    // hu player is the minimizer
    else {
        let best = +Infinity;
        let val;

        for (let [i, elem] of board.entries()) {
            if (typeof elem === 'number') {
                // make the move
                board[i] = player;

                // call minimax recursively and choose
                // the minimum value
                val = minimax(board, aiPlayer, depth + 1, alpha, beta);
                best = Math.min(best, val);

                // undo the move
                board[i] = i;

                beta = Math.min(beta, val);
                if (beta <= alpha) {
                    break;
                }
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
            let moveVal = minimax(board, huPlayer, 0, -Infinity, Infinity);

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

