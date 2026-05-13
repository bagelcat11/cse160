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

function loadPattern(board, patternNum) {
    clearBoard(board);
    let c = board.length / 2;   // center
    switch (patternNum) {  
        case 1:
            // r-pentomino
            board[c][0][c] = new TexturedCube(g_texture_cell, g_cell_colors[0], 1);
            board[c+1][0][c] = new TexturedCube(g_texture_cell, g_cell_colors[0], 1);
            board[c+2][0][c] = new TexturedCube(g_texture_cell, g_cell_colors[0], 1);
            board[c][0][c+1] = new TexturedCube(g_texture_cell, g_cell_colors[0], 1);
            board[c+1][0][c-1] = new TexturedCube(g_texture_cell, g_cell_colors[0], 1);
            break;
        case 2:
            // gliders
            board[c][0][c] = new TexturedCube(g_texture_cell, g_cell_colors[0], 1);
            board[c+1][0][c-1] = new TexturedCube(g_texture_cell, g_cell_colors[0], 1);
            board[c+1][0][c-2] = new TexturedCube(g_texture_cell, g_cell_colors[0], 1);
            board[c][0][c-2] = new TexturedCube(g_texture_cell, g_cell_colors[0], 1);
            board[c-1][0][c-2] = new TexturedCube(g_texture_cell, g_cell_colors[0], 1);

            let offset = 5;
            board[c-offset][0][c-offset] = new TexturedCube(g_texture_cell, g_cell_colors[0], 1);
            board[c+1-offset][0][c-1-offset] = new TexturedCube(g_texture_cell, g_cell_colors[0], 1);
            board[c+1-offset][0][c-2-offset] = new TexturedCube(g_texture_cell, g_cell_colors[0], 1);
            board[c-offset][0][c-2-offset] = new TexturedCube(g_texture_cell, g_cell_colors[0], 1);
            board[c-1-offset][0][c-2-offset] = new TexturedCube(g_texture_cell, g_cell_colors[0], 1);

            board[c+offset][0][c+offset] = new TexturedCube(g_texture_cell, g_cell_colors[0], 1);
            board[c+1+offset][0][c-1+offset] = new TexturedCube(g_texture_cell, g_cell_colors[0], 1);
            board[c+1+offset][0][c-2+offset] = new TexturedCube(g_texture_cell, g_cell_colors[0], 1);
            board[c+offset][0][c-2+offset] = new TexturedCube(g_texture_cell, g_cell_colors[0], 1);
            board[c-1+offset][0][c-2+offset] = new TexturedCube(g_texture_cell, g_cell_colors[0], 1);
            break;

        case 3:
            parseCellsPlaintext(gosperGliderGun, board);
            break;

        case 4:
            parseCellsPlaintext(puffer2, board);
            break;

        case 5:
            parseCellsPlaintext(snark, board);
            break;

        case 6:
            parseCellsPlaintext(max, board);
            break;

        case 7:
            parseCellsPlaintext(piOrbital, board);
            break;

        case 8:
            //TODO: custom soup density?
            makeSoup(0.5, board);
            break;

        case 9:
            break;
        
        default:
            break;
    }
}

function parseCellsPlaintext(cells, board) {
    let rows = cells.split("\n");
    let longestRowLen = Math.max(...rows.map((r) => r.length));
    for (let x = 0; x < rows.length; x++) {
        for (let z = 0; z < rows[x].length; z++) {
            if (rows[x][z] == "O") {
                // offset x and z to center it kinda
                board[x+board.length/2 - Math.floor(rows.length/2)]
                [0]
                [z+board.length/2 - Math.floor(longestRowLen/2)]
                    = new TexturedCube(g_texture_cell, g_cell_colors[0], 1);
            }
        }
    }
}

function makeSoup(density, board) {
    for (let x = 0; x < board.length; x++) {
        for (let y = 0; y < board[x].length; y++) {
        for (let z = 0; z < board.length; z++) {
            if (Math.random() < density) {
                board[x][y][z] = new TexturedCube(g_texture_cell, g_cell_colors[y], 1);
            }
        }
        }
    }
}

let max = '..................O\n\
.................OOO\n\
............OOO....OO\n\
...........O..OOO..O.OO\n\
..........O...O.O..O.O\n\
..........O....O.O.O.O.OO\n\
............O....O.O...OO\n\
OOOO.....O.O....O...O.OOO\n\
O...OO.O.OOO.OO.........OO\n\
O.....OO.....O\n\
.O..OO.O..O..O.OO\n\
.......O.O.O.O.O.O.....OOOO\n\
.O..OO.O..O..O..OO.O.OO...O\n\
O.....OO...O.O.O...OO.....O\n\
O...OO.O.OO..O..O..O.OO..O\n\
OOOO.....O.O.O.O.O.O\n\
..........OO.O..O..O.OO..O\n\
.............O.....OO.....O\n\
.OO.........OO.OOO.O.OO...O\n\
..OOO.O...O....O.O.....OOOO\n\
..OO...O.O....O\n\
..OO.O.O.O.O....O\n\
.....O.O..O.O...O\n\
....OO.O..OOO..O\n\
......OO....OOO\n\
.......OOO\n\
........O';

let gosperGliderGun = '........................O...........\n\
......................O.O...........\n\
............OO......OO............OO\n\
...........O...O....OO............OO\n\
OO........O.....O...OO..............\n\
OO........O...O.OO....O.O...........\n\
..........O.....O.......O...........\n\
...........O...O....................\n\
............OO......................';

let puffer2 = '.OOO...........OOO\n\
O..O..........O..O\n\
...O....OOO......O\n\
...O....O..O.....O\n\
..O....O........O'

let snark = '......OO...OO....\n\
......OO..O.OOO..\n\
..........O....O.\n\
......OOOO.OO..O.\n\
......O..O.O.O.OO\n\
.........O.O.O.O.\n\
..........OO.O.O.\n\
..............O..\n\
.................\n\
OO...............\n\
.O.......OO......\n\
.O.O.....OO......\n\
..OO.............\n\
.................\n\
.................\n\
.................\n\
.................\n\
.................\n\
.................\n\
............OO...\n\
...OO.......O....\n\
..O.O........OOO.\n\
....O..........O.'

let piOrbital = '..............OO..........OO\n\
.............O..O........O..O\n\
.............OOO..OOOOOO..OOO\n\
................OO......OO\n\
...............O..........O\n\
...............OO.O....O.OO\n\
....................OO\n\
............O.........................OO..........O\n\
.......OOOO...O....O......O...........OO..........O\n\
..........O...O..OOOOO..O...OOOO..................O\n\
..............O..OOOOO..O...O....................OO\n\
...........O......OOO...O......................O\n\
............OO.....O.......O..................O....O\n\
.........................OO...................O.........OO\n\
................................................OOO.....O.O\n\
.....................................................OO.O.O\n\
.....................................................O.O.O\n\
.......................................................O\n\
...................................OO...........O.....O..O\n\
.......OO..........................O.O..........OO....O\n\
.......OO............................OO.........O.....O...O\n\
...................................O.O................O...O\n\
....................OO.............OO.................O\n\
.......................O.O............................O..O\n\
.........................O.....................OOO.....O\n\
.......................O.....................O.......O.O.O\n\
...................O.........................O....O..OO.O.O\n\
.........O..........OO........................O.........O.O\n\
.........O......................................OO......OO\n\
.........O.......................................O\n\
.OO......OO......................................O\n\
O.O.........O....................................O\n\
O.O.OO..O....O\n\
.O.O.O.......O\n\
...O.....OOO\n\
.O..O\n\
....O\n\
O...O\n\
O...O.....O.......................................OO\n\
....O....OO.......................................OO\n\
.O..O.....O\n\
...O\n\
.O.O.O\n\
O.O.OO\n\
O.O.....OOO\n\
.OO.........O...................OO\n\
.......O....O..................O.......O.....OO\n\
...........O......................O...OOO......O\n\
........OO....................O...O..OOOOO..O\n\
........O..................OOOO...O..OOOOO..O...O\n\
........O..........OO...........O......O....O...OOOO\n\
........O..........OO.........................O\n\
.....................................OO\n\
................................OO.O....O.OO\n\
................................O..........O\n\
.................................OO......OO\n\
..............................OOO..OOOOOO..OOO\n\
..............................O..O........O..O\n\
...............................OO..........OO';