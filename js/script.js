let origBoard;
let huPlayer;
let aiPlayer;
// number of nodes on game tree
let numNodes = 0;
let gridSize = 3;
let winCombos = getWinCombos(3);

let cells = $('.cell');
resetGame();

/**
 * Generate all the win combos for a board.
 * @param n Length of the board's edge.
 * @returns {Array} All the win combos.
 */
function getWinCombos(n) {
    let result = [];
    let row = [];
    let col = [];
    let diagonalLeft = [];
    let diagonalRight = [];

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            row.push(n * i + j);
            col.push(i + n * j);
        }
        result.push(row, col);
        row = [];
        col = [];

        diagonalLeft.push((n + 1) * i);
        diagonalRight.push((n - 1) * (i + 1));
    }

    result.push(diagonalLeft, diagonalRight);

    return result;
}

/**
 * Bring the board back to initial state.
 */
function resetGame() {
    // create board
    origBoard = Array.from(Array(gridSize * gridSize).keys());

    // remove highlights from previous game
    cells.text('').css({'background-color': ''});

    // make cursor over cells normal
    cells.css({'cursor': 'default'});

    // close end game box
    $('.endgame').css({'display': 'none'});

    // open select symbol box
    $('.selectSym').css({'display': 'block'});
}

$('.iconReset').on('click', resetGame);

/**
 * Assign each player to a symbol
 * X goes first.
 * @param sym X or O.
 */
function selectSym(sym) {
    huPlayer = sym;
    aiPlayer = sym === 'O' ? 'X' : 'O';

    // close select symbol box
    $('.selectSym').css({'display': 'none'});

    // enable cursor for cells
    cells.css({'cursor': 'pointer'});

    // start the game
    startGame();
}

$('.iconX').on('click', function () {
    selectSym('X');
});

$('.iconO').on('click', function () {
    selectSym('O');
});

/**
 * Add click event to cells and switch between players after
 * each turn.
 */
function startGame() {
    // let AI move first if ai chooses X
    if (aiPlayer === 'X') {
        // AI plays in 1 of the corners as they're the strongest openings ỉn 3x3.
        // human must play the center cell to get a draw.
        turn([0, 2, 6, 8][Math.floor(Math.random() * 4)], aiPlayer);

        console.log(numNodes);
        numNodes = 0;
    }

    // switch between players when an empty cell is click on
    cells.on("click", function (event) {
        if (typeof origBoard[event.target.id] === 'number') {
            // human chooses a cell
            turn(event.target.id, huPlayer);

            // AI chooses a cell if game isn't over
            if (!checkWin(origBoard, huPlayer) && !checkTie())
                turn(findBestMove(origBoard), aiPlayer);
        }

        console.log("numNodes = " + numNodes);
        numNodes = 0;
    });
}

/**
 * Register player's move.
 * @param cellId The cell's id.
 * @param player AI or human.
 */
function turn(cellId, player) {
    // put player's symbol on cell
    origBoard[cellId] = player;

    // set the symbol's color
    $('#' + cellId).text(player).css({'color': player === 'X' ? '#3FC0E0' : '#E95151'});

    // check if game is won
    let gameWon = checkWin(origBoard, player);
    if (gameWon)
        gameOver(gameWon);

    // check if game is tie
    checkTie();
}

/**
 * Check if a player has won the game.
 * @param board The board.
 * @param player AI or human.
 * @returns {*} Index of the win combo and the winner, otherwise null.
 */
function checkWin(board, player) {
    let gameWon = null;

    // get player's current moves
    let moves = board.reduce((a, e, i) => e === player ? a.concat(i) : a, []);

    // check if player's moves match any win combo
    for (let [index, winCombo] of winCombos.entries()) {
        if (match(winCombo, moves)) {
            gameWon = {index: index, player: player};
            break;
        }
    }

    return gameWon;
}

/**
 * Check if player's moves match any win combo.
 * @param winCombo A win combo.
 * @param moves The moves player has made.
 * @returns {boolean} True if player's moves match any win combo, otherwise False.
 */
function match(winCombo, moves) {
    return winCombo.every(e => moves.includes(e));
}

/**
 * Check if game is a tie. Declare it's a tie if board is full and
 * no one has won.
 * @returns {boolean} Return True if game is a tie, otherwise False.
 */
function checkTie() {
    // check if board is full
    if (!moveLeft(origBoard)) {
        // highlights all cells
        cells.css({'background-color': '#414141'});

        // make cells unclickable
        cells.off('click');

        // make cursor normal
        cells.css({'cursor': 'default'});

        // declare a tie
        declareWinner("It's a Tie!");
        return true;
    }

    return false;
}

/**
 * Bring game to an end.
 * @param gameWon
 */
function gameOver(gameWon) {
    // color win combo of the winner
    for (let index of winCombos[gameWon.index]) {
        $('#' + index).css({'background-color': "#414141"});
    }

    // make cells unclickable
    cells.off('click');

    // make cursor normal
    cells.css({'cursor': 'default'});

    // declare victory or defeat for human
    declareWinner(gameWon.player === huPlayer ? "You win!" : "You lose!");
}

/**
 * Declare the winner in end game box.
 * @param player AI or human.
 */
function declareWinner(player) {
    // add end game text
    $(".endgame .text").text(player);
    // open end game box
    $(".endgame").css({'display': 'block'});
}

/**
 * Check if there's any empty cell left.
 * @param board The board.
 * @returns {boolean} True if board is not full, otherwise False.
 */
function moveLeft(board) {
    for (let elem of board) {
        if (typeof elem === 'number') {
            return true;
        }
    }
    return false;
}

// /**
//  * Evaluate the board when it's full (in terminal state).
//  * @param board The board.
//  * @returns {number} -100 if AI wins, 100 if human wins, 0 if it's a draw.
//  */
// function evaluate(board) {
//     if (checkWin(board, huPlayer)) {
//         return -100;
//     } else if (checkWin(board, aiPlayer)) {
//         return 100;
//     } else if (!moveLeft(board)) {
//         return 0;
//     }
// }

/**
 * The heuristic evaluation function for the current board
 * @param board The board.
 * @returns {number} sum of the evaluations of 3 rows, 3 columns and 2 diagonals
 */
function evaluate(board) {
    let score = 0;
    // Evaluate score for each of the 8 lines (3 rows, 3 columns, 2 diagonals)
    for (let line of winCombos) {
        score += evaluateLine(board, line[0], line[1], line[2]);
    }
    return score;
}

// function evaluate(board) {
//     let pos_X = [];
//     let pos_O = [];
//
//     for (var [i, cell] of board.entries()) {
//         if (cell == 'X')
//             pos_X.push(i);
//
//         if (cell == 'O')
//             pos_O.push(i);
//     }
//
//     // number of possible winning line for X
//     let score_X = winCombos.reduce((acc, combo) => acc + (combo.filter(val => pos_O.indexOf(val) !== -1).length === 0 ? 1 : 0), 0);
//     // number of possible winning line for O
//     let score_O = winCombos.reduce((acc, combo) => acc + (combo.filter(val => pos_X.indexOf(val) !== -1).length === 0 ? 1 : 0), 0);
//
//     return score_X - score_O;
// }

/**
 * The heuristic evaluation function for the given line of 3 cells
 * @param board The board.
 * @param cellId1 Id of the first cell in the line
 * @param cellId2 Id of the second cell in the line
 * @param cellId3 Id of the third cell in the line
 * @returns {number} +100 for 3-in-a-line for AI,
 *  +10 for 2-in-a-line (with a empty cell) for AI,
 *  +1 for 1-in-a-line (with two empty cells) for AI,
 *  -100, -10, -1 for 3-, 2-, 1-in-a-line for opponent,
 *  0 otherwise (empty lines or lines with both AI's and human's seed)
 */
function evaluateLine(board, cellId1, cellId2, cellId3) {
    let score = 0;

    // First cell
    if (board[cellId1] === aiPlayer) {
        score = 1;
    } else if (board[cellId1] === huPlayer) {
        score = -1;
    }

    // Second cell
    if (board[cellId2] === aiPlayer) {
        // 1st cell is aiPlayer => 2-in-a-line
        if (score === 1) {
            score = 10;
        }
        // 1st cell is huPlayer
        else if (score === -1) {
            return 0;
        }
        // 1st cell is empty => 1-in-a-line
        else {
            score = 1;
        }
    } else if (board[cellId2] === huPlayer) {
        // 1st cell is huPlayer => 2-in-a-line
        if (score === -1) {
            score = -10;
        }
        // 1st cell is aiPlayer
        else if (score === 1) {
            return 0;
        }
        // 1st cell is empty => 1-in-a-line
        else {
            score = -1;
        }
    }

    // Third cell
    if (board[cellId3] === aiPlayer) {
        // 1st and/or 2nd cell is aiPlayer => 2- or 3-in-a-line
        if (score > 0) {
            score *= 10;
        }
        // 1st and/or 2nd cell is huPlayer
        else if (score < 0) {
            return 0;
        }
        // 1st and 2nd cell are empty => 1-in-a-line
        else {
            score = 1;
        }
    } else if (board[cellId3] === huPlayer) {
        // 1st and/or 2nd cell is huPlayer => 2- or 3-in-a-line
        if (score < 0) {
            score *= 10;
        }
        // 1st and/or 2nd cell is aiPlayer
        else if (score > 1) {
            return 0;
        }
        // 1st and 2nd cell are empty => 1-in-a-line
        else {
            score = -1;
        }
    }
    return score;
}

/**
 * Use the minimax algorithm to consider all possible
 * positions the game can go and return the value of the
 * board in terminal state. Alpha beta pruning helps
 * reducing the number of evaluation. Depth helps finding
 * the shortest path to victory.
 * @param board The board.
 * @param player AI or human.
 * @param depth Depth starts at 0 and increases as we go down
 * the tree.
 * @param alpha Best score for AI.
 * @param beta Best score for human.
 * @returns {*} Evaluation of a move.
 */
function minimax(board, player, depth, alpha, beta) {
    numNodes++;

    // evaluate the current position
    let score = evaluate(board);

    // ai player wins
    if (score > 0) {
        return score - depth;
    }

    // human player wins
    if (score < 0) {
        return score + depth;
    }

    // a tie
    if (!moveLeft(board)) {
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

                // prune with alpha, beta
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

                // prune with alpha, beta
                beta = Math.min(beta, val);
                if (beta <= alpha) {
                    break;
                }
            }
        }

        return best;
    }
}

function minimaxLimitedDepth(board, player, depth, maxDepth, alpha, beta) {
    numNodes++;
    // evaluate the current position
    let score = evaluate(board);

    // base cases
    // maxDepth reached
    if (depth >= maxDepth) {
        return score;
    }
    // ai player wins
    if (score > 0) {
        return score - depth;
    }
    // human player wins
    if (score < 0) {
        return score + depth;
    }
    // a tie
    if (!moveLeft(board)) {
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
                val = minimaxLimitedDepth(board, huPlayer, depth + 1, maxDepth, alpha, beta);
                best = Math.max(best, val);

                // undo the move
                board[i] = i;

                // prune with alpha, beta
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
                val = minimaxLimitedDepth(board, aiPlayer, depth + 1, maxDepth, alpha, beta);
                best = Math.min(best, val);

                // undo the move
                board[i] = i;

                // prune with alpha, beta
                beta = Math.min(beta, val);
                if (beta <= alpha) {
                    break;
                }
            }
        }

        return best;
    }
}

/**
 * Find the best move for AI.
 * @param board The board.
 * @returns {number} The index of the move on the board.
 */
function findBestMove(board) {
    // AI starts as the maximizer
    let bestVal = -Infinity;
    let index;

    for (let [i, elem] of board.entries()) {
        if (typeof elem === 'number') {
            // make the move
            board[i] = aiPlayer;

            // call minimax recursively and choose
            // the minimum value
            // let moveVal = minimax(board, huPlayer, 0, -Infinity, Infinity);
            let moveVal = minimaxLimitedDepth(board, huPlayer, 0, 3, -Infinity, Infinity);

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

