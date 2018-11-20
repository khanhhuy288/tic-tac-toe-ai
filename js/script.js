let origBoard;
let huPlayer;
let aiPlayer;
let numNodes = 0;
let gridSize = 3;
let winCombos = getWinCombos(3);

let cells = $('.cell');
startGame();

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
            row.push(n*i + j);
            col.push(i + n*j);
        }
        result.push(row, col);
        row = [];
        col = [];

        diagonalLeft.push((n+1) * i);
        diagonalRight.push((n-1) * (i+1));
    }

    result.push(diagonalLeft, diagonalRight);

    return result;
}

/**
 * Bring the board to start state.
 */
function startGame() {
    // create board
    origBoard = Array.from(Array(gridSize * gridSize).keys());

    // remove highlights from previous game
    cells.text('').css({'background-color' : ''});

    // make cursor over cells normal
    cells.css({'cursor' : 'default'});

    // close end game box
    $('.endgame').css({'display' : 'none'});

    // open select symbol box
    $('.selectSym').css({'display' : 'block'});
}

/**
 * Select the symbol to play.
 * X goes first.
 * @param sym X or O.
 */
function selectSym(sym) {
    huPlayer = sym;
    aiPlayer = sym === 'O' ? 'X' : 'O';

    // close select symbol box
    $('.selectSym').css({'display' : 'none'});

    // enable cursor for cells
    cells.css({'cursor' : 'pointer'});

    // let AI move first if ai chooses X
    if (aiPlayer === 'X') {
        // AI plays in 1 of the corners as they're the strongest openings ỉn 3x3.
        // human must play the center cell to get a draw.
        turn([0, 2, 6, 8][Math.floor(Math.random()*4)], aiPlayer);

        console.log(numNodes);
        numNodes = 0;
    }

    // switch between players when an empty cell is click on
    cells.on("click", function(event) {
        if (typeof origBoard[event.target.id] === 'number') {
            // human chooses a cell
            turn(event.target.id, huPlayer);

            // AI chooses a cell if game isn't over
            if (!checkWin(origBoard, huPlayer) && !checkTie())
                turn(findBestMove(origBoard), aiPlayer);
        }


        console.log(numNodes);
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
    $('#' + cellId).text(player).css({'color' : player === 'X' ? '#3FC0E0' : '#E95151'});

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
    if (!isNotFull(origBoard)) {
        // highlights all cells
        cells.css({'background-color' : '#414141'});

        // make cells unclickable
        cells.off('click');

        // make cursor normal
        cells.css({'cursor' : 'default'});

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
        $('#' + index).css({'background-color' : "#414141"});
    }

    // make cells unclickable
    cells.off('click');

    // make cursor normal
    cells.css({'cursor' : 'default'});

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
    $(".endgame").css({'display' : 'block'});
}

/**
 * Check if board is not full.
 * @param board The board.
 * @returns {boolean} True if board is not full, otherwise False.
 */
function isNotFull(board) {
    for (let elem of board) {
        if (typeof elem === 'number') {
            return true;
        }
    }
    return false;
}

/**
 * Evaluate the board when it's full (in terminal state).
 * @param board The board.
 * @returns {number} -1 if AI wins, 1 if human wins, 0 if it's a draw.
 */
function evaluate(board) {
    if (checkWin(board, huPlayer)) {
        return -10;
    } else if (checkWin(board, aiPlayer)) {
        return 10;
    } else if (!isNotFull(board)) {
        return 0;
    }
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
    if (score === 10) {
        return score - depth;
    }

    // human player wins
    if (score === -10) {
        return score + depth;
    }

    // a tie
    if (!isNotFull(board)) {
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

