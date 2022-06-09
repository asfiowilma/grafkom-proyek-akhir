function drawPuppyBase(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [1.5, 1.5, 1.5]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(0, shadow);
    setupMaterial(cameraMaterial, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

function drawPuppyEars(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [0.35, 1.5, 0.15]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(0, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

function drawPuppyBody(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [1.8, 1.8, 2.55]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(0, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

function drawPuppyLegs(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [0.3, 1.0, 0.3]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(0, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

function drawPuppyTail(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [0.3, 1.5, 0.3]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(0, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

function drawPuppyBeak(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [1.0, 0.5, 0.5]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(6, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

function initPuppyTree() {
    // PUPPY
    basePuppyNode = { "draw": drawPuppyBase, "matrix": mat4.identity(mat4.create()), "location": [5.0, 0.0, 0.0], "rotation": basePuppyAngle };
    mat4.translate(basePuppyNode.matrix, [9.0, -2.5, 0.0]);
    mat4.rotate(basePuppyNode.matrix, basePuppyAngle, [0.0, 1.5, 0.0]);

    firstPuppyEarNode = { "draw": drawPuppyEars, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(firstPuppyEarNode.matrix, [0.2, -0.25, 0.45]);
    mat4.rotate(firstPuppyEarNode.matrix, -puppyEarAngle, [0.0, 0.0, 1.0]);
    mat4.translate(firstPuppyEarNode.matrix, [0.5, 1.0, 0.0]);

    secondPuppyEarNode = { "draw": drawPuppyEars, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(secondPuppyEarNode.matrix, [-0.2, -0.25, 0.45]);
    mat4.rotate(secondPuppyEarNode.matrix, puppyEarAngle, [0.0, 0.0, 1.0]);
    mat4.translate(secondPuppyEarNode.matrix, [-0.5, 1.0, 0.0]);

    puppyBodyNode = { "draw": drawPuppyBody, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(puppyBodyNode.matrix, [0.0, -2.75, -3.5]);

    firstPuppyLegNode = { "draw": drawPuppyLegs, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(firstPuppyLegNode.matrix, [-0.75, -2.0, 2.0]);

    secondPuppyLegNode = { "draw": drawPuppyLegs, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(secondPuppyLegNode.matrix, [1.5, 0.0, 0.0]);

    thirdPuppyLegNode = { "draw": drawPuppyLegs, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(thirdPuppyLegNode.matrix, [0.0, 0.0, -3.75]); //0.2

    fourthPuppyLegNode = { "draw": drawPuppyLegs, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(fourthPuppyLegNode.matrix, [-1.75, 0.0, 0.0]); //0.2

    puppyBeakNode = { "draw": drawPuppyBeak, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(puppyBeakNode.matrix, [0.0, 2.25, 5.0]);

    puppyTailNode = { "draw": drawPuppyTail, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(puppyTailNode.matrix, [0.0, 2.5, -2.75]);
    mat4.rotate(puppyTailNode.matrix, puppyTailAngle, [0.0, 0.0, 1.0]);
}