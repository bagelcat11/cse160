// finds neighbors in the xz plane (at height y)
function calcNumNeighbors(board, x, y, z) {
    let numNeighbors = 0;

    let leftOK = x > 0;
    let rightOK = x < board.length - 1;
    let topOK = z > 0;
    let bottomOK = z < board.length - 1;

    if (leftOK && topOK && board[x - 1][y][z - 1])
        numNeighbors++;
    if (topOK && board[x][y][z - 1])
        numNeighbors++;
    if (rightOK && topOK && board[x + 1][y][z - 1])
        numNeighbors++;
    
    if (leftOK && board[x - 1][y][z])
        numNeighbors++;
    if (rightOK && board[x + 1][y][z])
        numNeighbors++;

    if (leftOK && bottomOK && board[x - 1][y][z + 1])
        numNeighbors++;
    if (bottomOK && board[x][y][z + 1])
        numNeighbors++;
    if (rightOK && bottomOK && board[x + 1][y][z + 1])
        numNeighbors++;

    return numNeighbors;
}

function clearBoard(board) {
    for (let x = 0; x < board.length; x++) {
        for (let y = 0; y < board[0].length; y++) {
            for (let z = 0; z < board.length; z++) {
                board[x][y][z] = null;
            }
        }
    }
}

function loadPattern(board, y) {
    clearBoard(board);
    let c = board.length / 2;   // center
    // r-pentomino
    board[c][y][c] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 1);
    board[c+1][y][c] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 1);
    board[c+2][y][c] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 1);
    board[c][y][c+1] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 1);
    board[c+1][y][c-1] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 1);
}
