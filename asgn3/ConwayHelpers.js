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
        for (let y = 0; y < board.length; y++) {
            for (let z = 0; z < board.length; z++) {
                board[x][y][z] = null;
            }
        }
    }
}

function loadPattern(board, patternNum) {
    clearBoard(board);
    switch (patternNum) {  
        case 1:
            // r-pentomino
            board[16][0][16] = new TexturedCube(0, [1,1,1,1], 1);
            board[17][0][16] = new TexturedCube(0, [1,1,1,1], 1);
            board[18][0][16] = new TexturedCube(0, [1,1,1,1], 1);
            board[16][0][17] = new TexturedCube(0, [1,1,1,1], 1);
            board[17][0][15] = new TexturedCube(0, [1,1,1,1], 1);
            break;
        case 2:
            // glider
            board[16][0][16] = new TexturedCube(0, [1,1,1,1], 1);
            board[17][0][15] = new TexturedCube(0, [1,1,1,1], 1);
            board[17][0][14] = new TexturedCube(0, [1,1,1,1], 1);
            board[16][0][14] = new TexturedCube(0, [1,1,1,1], 1);
            board[15][0][14] = new TexturedCube(0, [1,1,1,1], 1);
            break;

        default:
            break;
    }
}