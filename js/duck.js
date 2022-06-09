function drawDuckBase(shadow) {
  mvPushMatrix();
  //item specific modifications
  mat4.scale(mvMatrix, [1, 1, 1.5]);
  //draw
  setupToDrawCube(shadow);
  setMatrixUniforms(shadow);
  chooseTexture(3, shadow);
  setupMaterial(armMaterial, shadow);
  gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  mvPopMatrix(shadow);
}

function drawDuckWing(shadow) {
  mvPushMatrix();
  //item specific modifications
  mat4.scale(mvMatrix, [0.2, 0.8, 1.0]);
  //draw
  setupToDrawCube(shadow);
  setMatrixUniforms(shadow);
  chooseTexture(3, shadow);
  gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  mvPopMatrix(shadow);
}

function drawDuckHead(shadow) {
  mvPushMatrix();
  //item specific modifications
  mat4.scale(mvMatrix, [0.8, 1, 0.5]);
  //draw
  setupToDrawCube(shadow);
  setMatrixUniforms(shadow);
  chooseTexture(3, shadow);
  gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  mvPopMatrix(shadow);
}

function drawDuckLip(shadow) {
  mvPushMatrix();
  //item specific modifications
  mat4.scale(mvMatrix, [0.8, 0.2, 0.2]);
  //draw
  setupToDrawCube(shadow);
  setMatrixUniforms(shadow);
  chooseTexture(0, shadow);
  gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  mvPopMatrix(shadow);
}

function drawDuckLeg(shadow) {
  mvPushMatrix();
  //item specific modifications
  mat4.scale(mvMatrix, [0.2, 1, 0.05]);
  //draw
  setupToDrawCube(shadow);
  setMatrixUniforms(shadow);
  chooseTexture(0, shadow);
  gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  mvPopMatrix(shadow);
}

function drawDuckFoot(shadow) {
  mvPushMatrix();
  //item specific modifications
  mat4.scale(mvMatrix, [0.5, 0.05, 0.2]);
  //draw
  setupToDrawCube(shadow);
  setMatrixUniforms(shadow);
  chooseTexture(0, shadow);
  gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  mvPopMatrix(shadow);
}

function initDuckTree() {
  // DUCK
  duckBaseNode = { draw: drawDuckBase, matrix: mat4.identity(mat4.create()) };
  mat4.translate(duckBaseNode.matrix, [-9.0, -5.0, -4.0]);
  mat4.rotate(duckBaseNode.matrix, duckBaseAngle, [0.0, 1.0, 0.0]);

  duckHeadNode = { draw: drawDuckHead, matrix: mat4.identity(mat4.create()) };
  mat4.translate(duckHeadNode.matrix, [0.0, 1.2, 1.75]);
  mat4.rotate(duckHeadNode.matrix, duckHeadAngle, [0.0, 1.0, 0.0]);

  duckTopLipNode = { draw: drawDuckLip, matrix: mat4.identity(mat4.create()) };
  mat4.translate(duckTopLipNode.matrix, [0.0, -0.35, 0.75]);

  duckBottomLipNode = { draw: drawDuckLip, matrix: mat4.identity(mat4.create()) };
  mat4.translate(duckBottomLipNode.matrix, [0.0, -0.15, 0.75]);

  duckFirstWingNode = { draw: drawDuckWing, matrix: mat4.identity(mat4.create()) };
  mat4.translate(duckFirstWingNode.matrix, [1.2, 0.0, 0.0]);
  mat4.rotate(duckFirstWingNode.matrix, duckWingAngle, [0.0, 0.0, 1.0]);

  duckSecondWingNode = { draw: drawDuckWing, matrix: mat4.identity(mat4.create()) };
  mat4.translate(duckSecondWingNode.matrix, [-1.2, 0.0, 0.0]);
  mat4.rotate(duckSecondWingNode.matrix, -duckWingAngle, [0.0, 0.0, 1.0]);

  duckFirstLegNode = { draw: drawDuckLeg, matrix: mat4.identity(mat4.create()) };
  mat4.translate(duckFirstLegNode.matrix, [-0.5, -1.75, 0.0]);

  duckSecondLegNode = { draw: drawDuckLeg, matrix: mat4.identity(mat4.create()) };
  mat4.translate(duckSecondLegNode.matrix, [0.5, -1.75, 0.0]);

  duckFirstFootNode = { draw: drawDuckFoot, matrix: mat4.identity(mat4.create()) };
  mat4.translate(duckFirstFootNode.matrix, [0.0, -1.0, 0.2]);

  duckSecondFootNode = { draw: drawDuckFoot, matrix: mat4.identity(mat4.create()) };
  mat4.translate(duckSecondFootNode.matrix, [0.0, -1.0, 0.2]);
}
