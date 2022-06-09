function drawCatBase(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [1.0, 1.0, 1.0]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(2, shadow);
    setupMaterial(cameraMaterial, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

// Kuping anjing
function drawCatEars(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [0.25, 0.25, 0.15]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(2, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

// Badan anjing
function drawCatBody(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [1.5, 1.0, 2.0]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(2, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

// Kaki anjing
function drawCatLegs(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [0.3, 0.75, 0.3]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(2, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

// Ekor anjing
function drawCatTail(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [0.2, 1.5, 0.2]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(2, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

// Moncong anjing
function drawCatBeak(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [0.25, 0.15, 0.25]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(6, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

function initCatTree() {
    // Cat
    baseCatNode = { "draw": drawCatBase, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(baseCatNode.matrix, [0.0, -3.5, -2.0]);
    mat4.rotate(baseCatNode.matrix, baseCatAngle, [0.0, 1.5, 0.0]);

    // Kuping
    firstCatEarNode = { "draw": drawCatEars, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(firstCatEarNode.matrix, [0.25, 0.0, 0.45]);
    mat4.rotate(firstCatEarNode.matrix, firstCameraLegAngle, [-1.0, 0.0, 1.0]);
    mat4.translate(firstCatEarNode.matrix, [0.5, 1.0, 0.0]);

    secondCatEarNode = { "draw": drawCatEars, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(secondCatEarNode.matrix, [-0.25, 0.0, 0.45]);
    mat4.rotate(secondCatEarNode.matrix, secondCameraLegAngle, [-1.0, 0.0, -1.0]);
    mat4.translate(secondCatEarNode.matrix, [-0.5, 1.0, 0.0]);

    // Cat body
    catBodyNode = { "draw": drawCatBody, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(catBodyNode.matrix, [0.0, -1.75, -2.5]);

    // Kaki anjing
    firstCatLegNode = { "draw": drawCatLegs, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(firstCatLegNode.matrix, [-0.75, -1.25, 1.0]);

    secondCatLegNode = { "draw": drawCatLegs, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(secondCatLegNode.matrix, [1.5, 0.0, 0.0]);

    thirdCatLegNode = { "draw": drawCatLegs, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(thirdCatLegNode.matrix, [0.0, 0.0, -2.25]); //0.2

    fourthCatLegNode = { "draw": drawCatLegs, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(fourthCatLegNode.matrix, [-1.0, 0.0, 0.0]); //0.2

    // Moncong anjing
    catBeakNode = { "draw": drawCatBeak, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(catBeakNode.matrix, [0.0, 1.5, 3.5]);

    // Ekor anjing
    catTailNode = { "draw": drawCatTail, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(catTailNode.matrix, [0.0, 1.5, -1.75]);
    mat4.rotate(catTailNode.matrix, catTailAngle, [0.0, 0.0, 1.0]);

    // console.log(baseCatNode)
    // console.log(firstCatEarNode)
    // console.log(secondCatEarNode)
    // console.log(catBodyNode)
    // console.log(firstCatLegNode)
    // console.log(secondCatLegNode)
    // console.log(thirdCatLegNode)
    // console.log(fourthCatLegNode)
    // console.log(catTailNode)
    // console.log(catBeakNode)
  }