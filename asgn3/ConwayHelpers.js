// finds neighbors in the xz plane (at height y)
function calcNumNeighbors(x, y, z) {
    let numNeighbors = 0;

    let leftOK = x > 0;
    let rightOK = x < g_mapSize - 1;
    let topOK = z > 0;
    let bottomOK = z < g_mapSize - 1;

    if (leftOK && topOK && g_map[x - 1][y][z - 1])
        numNeighbors++;
    if (topOK && g_map[x][y][z - 1])
        numNeighbors++;
    if (rightOK && topOK && g_map[x + 1][y][z - 1])
        numNeighbors++;
    
    if (leftOK && g_map[x - 1][y][z])
        numNeighbors++;
    if (rightOK && g_map[x + 1][y][z])
        numNeighbors++;

    if (leftOK && bottomOK && g_map[x - 1][y][z + 1])
        numNeighbors++;
    if (bottomOK && g_map[x][y][z + 1])
        numNeighbors++;
    if (rightOK && bottomOK && g_map[x + 1][y][z + 1])
        numNeighbors++;

    return numNeighbors;
}