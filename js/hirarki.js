var gl;
var drawType;
var wireframe = false;

var cameraMode = true;

function initGL(canvas) {
    try {
        gl = canvas.getContext("webgl2");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }
    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }
    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }
    gl.shaderSource(shader, str);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}


//adapted from http://learnwebgl.brown37.net/11_advanced_rendering/shadows.html
function createFrameBufferObject(gl, width, height) {
    var frameBuffer, depthBuffer;

    frameBuffer = gl.createFramebuffer();

    depthBuffer = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, depthBuffer);
    for (var i = 0; i < 6; i++) gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    frameBuffer.depthBuffer = depthBuffer;
    frameBuffer.width = width;
    frameBuffer.height = height;

    return frameBuffer;
}

var shaderProgram;
var shadowMapShaderProgram;

function initShaders() {
    var fragmentShader = getShader(gl, "fs");
    var vertexShader = getShader(gl, "vs");
    shaderProgram = gl.createProgram();
    if (!shaderProgram) { alert("gak ok deh kakak"); }
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
    gl.useProgram(shaderProgram);
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
    shaderProgram.vertexTextureAttribute = gl.getAttribLocation(shaderProgram, "vTexCoord");
    gl.enableVertexAttribArray(shaderProgram.vertexTextureAttribute);
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
    shaderProgram.useMaterialUniform = gl.getUniformLocation(shaderProgram, "uUseMaterial");
    shaderProgram.useTextureUniform = gl.getUniformLocation(shaderProgram, "uUseTexture");
    shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
    shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, "uPointLightingLocation");
    shaderProgram.pointLightingSpecularColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingSpecularColor");
    shaderProgram.pointLightingDiffuseColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingDiffuseColor");
    shaderProgram.uMaterialAmbientColorUniform = gl.getUniformLocation(shaderProgram, "uMaterialAmbientColor");
    shaderProgram.uMaterialDiffuseColorUniform = gl.getUniformLocation(shaderProgram, "uMaterialDiffuseColor");
    shaderProgram.uMaterialSpecularColorUniform = gl.getUniformLocation(shaderProgram, "uMaterialSpecularColor");
    shaderProgram.uMaterialShininessUniform = gl.getUniformLocation(shaderProgram, "uMaterialShininess");
    shaderProgram.uFarPlaneUniform = gl.getUniformLocation(shaderProgram, "uFarPlane");
    shaderProgram.shadowMapUniform = gl.getUniformLocation(shaderProgram, "shadowmap");

    var shadowMapFragmentShader = getShader(gl, "fs-shadowmap");
    var shadowMapVertexShader = getShader(gl, "vs-shadowmap");
    shadowMapShaderProgram = gl.createProgram();
    gl.attachShader(shadowMapShaderProgram, shadowMapVertexShader);
    gl.attachShader(shadowMapShaderProgram, shadowMapFragmentShader);
    gl.linkProgram(shadowMapShaderProgram);
    if (!gl.getProgramParameter(shadowMapShaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
    gl.useProgram(shadowMapShaderProgram);
    shadowMapShaderProgram.mvMatrixUniform = gl.getUniformLocation(shadowMapShaderProgram, "uMVMatrix");
    shadowMapShaderProgram.pMatrixUniform = gl.getUniformLocation(shadowMapShaderProgram, "uPMatrix");
    shadowMapShaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shadowMapShaderProgram, "uPointLightingLocation");
    shadowMapShaderProgram.uFarPlaneUniform = gl.getUniformLocation(shadowMapShaderProgram, "uFarPlane");
    shadowMapShaderProgram.vertexPositionAttribute = gl.getAttribLocation(shadowMapShaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shadowMapShaderProgram.vertexPositionAttribute);

    gl.useProgram(shaderProgram);
}

var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

function mvPopMatrix(shadow) {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
    if (shadow) {
        gl.uniformMatrix4fv(shadowMapShaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shadowMapShaderProgram.mvMatrixUniform, false, mvMatrix);
    } else {
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
        var normalMatrix = mat3.create();
        mat4.toInverseMat3(mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
    }
}

function setMatrixUniforms(shadow) {
    if (shadow) {
        gl.uniformMatrix4fv(shadowMapShaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shadowMapShaderProgram.mvMatrixUniform, false, mvMatrix);
    } else {
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
        var normalMatrix = mat3.create();
        mat4.toInverseMat3(mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
    }
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

var cubeVertexPositionBuffer;
var cubeVertexNormalBuffer;
var cubeInsidesVertexNormalBuffer;
var cubeVertexIndexBuffer;
var cubeTextureBuffer;

var cylinderVertexPositionBuffer;
var cylinderVertexNormalBuffer;
var cylinderVertexIndexBuffer;
var cylinderTextureBuffer;

var sphereVertexPositionBuffer;
var sphereVertexNormalBuffer;
var sphereVertexIndexBuffer;
var sphereTextureBuffer;

var shadowFrameBuffer;

var armMaterial;
var cameraMaterial;
var roomMaterial;

function initBuffers() {
    //DEFINING CUBE
    cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    vertices = [
        // Front face
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,
        // Back face
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,
        // Top face
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,
        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,
        // Right face
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,
        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    cubeVertexPositionBuffer.itemSize = 3;
    cubeVertexPositionBuffer.numItems = 24;
    cubeVertexNormalBuffer = gl.createBuffer();
    cubeInsidesVertexNormalBuffer = gl.createBuffer();
    var vertexNormals = [
        // Front face
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        // Back face
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        // Top face
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        // Bottom face
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        // Right face
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        // Left face
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
    ];
    var vertexInsidesNormals = [];
    for (var i = 0; i < vertexNormals.length; i++) {
        vertexInsidesNormals.push(vertexNormals[i] * -1);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
    cubeVertexNormalBuffer.itemSize = 3;
    cubeVertexNormalBuffer.numItems = 24;

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeInsidesVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexInsidesNormals), gl.STATIC_DRAW);
    cubeInsidesVertexNormalBuffer.itemSize = 3;
    cubeInsidesVertexNormalBuffer.numItems = 24;

    cubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    var cubeVertexIndices = [
        0, 1, 2, 0, 2, 3,    // Front face
        4, 5, 6, 4, 6, 7,    // Back face
        8, 9, 10, 8, 10, 11,  // Top face
        12, 13, 14, 12, 14, 15, // Bottom face
        16, 17, 18, 16, 18, 19, // Right face
        20, 21, 22, 20, 22, 23  // Left face
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
    cubeVertexIndexBuffer.itemSize = 1;
    cubeVertexIndexBuffer.numItems = 36;

    var textureCubeCoords = [
        // Front face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        // Back face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,

        // Top face
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,

        // Bottom face
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,

        // Right face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,

        // Left face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
    ];
    cubeTextureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeTextureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCubeCoords), gl.STATIC_DRAW);
    cubeTextureBuffer.itemSize = 2;
    cubeTextureBuffer.numItems = 24;

    //DEFINING CYLINDER
    //try making it with 20 segments
    var segment = 20;
    var deltaTheta = Math.PI * 360 / (180 * segment);
    var x, z;
    var cylinderBotVertices = [0, 0, 0];
    var cylinderTopVertices = [0, 1, 0];
    var cylinderSideVertices = [];
    var cylinderBotNormals = [0.0, -1.0, 0.0];
    var cylinderTopNormals = [0.0, 1.0, 0.0];
    var cylinderSideNormals = [];
    var cylinderBotTopTextureCoordinates = [0.5, 0.5];
    var cylinderSideTextureCoordinates = [];
    for (var i = 0; i <= segment; i++) {
        x = Math.cos(deltaTheta * i);
        z = Math.sin(deltaTheta * i);

        cylinderBotVertices.push(x, 0, z);
        cylinderBotNormals.push(0.0, -1.0, 0.0);
        cylinderBotTopTextureCoordinates.push((x + 1) / 2, (z + 1) / 2);

        cylinderSideVertices.push(x, 0, z);
        cylinderSideNormals.push(x, 0, z);
        cylinderSideTextureCoordinates.push(i / segment, 0.0);
        cylinderSideVertices.push(x, 1, z);
        cylinderSideNormals.push(x, 0, z);
        cylinderSideTextureCoordinates.push(i / segment, 1.0);

        cylinderTopVertices.push(x, 1, z);
        cylinderTopNormals.push(0.0, 1.0, 0.0);
    }
    cylinderVertexPositionBuffer = gl.createBuffer();
    cylinderVertexNormalBuffer = gl.createBuffer();
    cylinderTextureBuffer = gl.createBuffer();
    var cylinderVertices = cylinderBotVertices.concat(cylinderSideVertices).concat(cylinderTopVertices);
    var cylinderNormals = cylinderBotNormals.concat(cylinderSideNormals).concat(cylinderTopNormals);
    var cylinderTextureCoordinates = cylinderBotTopTextureCoordinates.concat(cylinderSideTextureCoordinates).concat(cylinderBotTopTextureCoordinates);
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylinderVertices), gl.STATIC_DRAW);
    cylinderVertexPositionBuffer.itemSize = 3;
    cylinderVertexPositionBuffer.numItems = cylinderVertices.length / 3;

    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylinderNormals), gl.STATIC_DRAW);
    cylinderVertexNormalBuffer.itemSize = 3;
    cylinderVertexNormalBuffer.numItems = cylinderNormals.length / 3;

    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderTextureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylinderTextureCoordinates), gl.STATIC_DRAW);
    cylinderTextureBuffer.itemSize = 2;
    cylinderTextureBuffer.numItems = cylinderTextureCoordinates.length / 2;

    var cylinderIndices = [];
    //bot vertices
    for (var i = 2; i < cylinderBotVertices.length / 3; i++) {
        cylinderIndices.push(0, i - 1, i);
    }
    cylinderIndices.push(0, cylinderBotVertices.length / 3 - 1, 1);
    var offset = cylinderBotVertices.length / 3;
    //side vertices
    for (var i = 2; i < cylinderSideVertices.length / 3; i++) {
        cylinderIndices.push(offset + i - 2, offset + i - 1, offset + i);
    }
    cylinderIndices.push(offset + cylinderSideVertices.length / 3 - 2, offset + cylinderSideVertices.length / 3 - 1, offset);
    cylinderIndices.push(offset + cylinderSideVertices.length / 3 - 1, offset, offset + 1);
    offset += cylinderSideVertices.length / 3;
    for (var i = 2; i < cylinderTopVertices.length / 3; i++) {
        cylinderIndices.push(offset, offset + i - 1, offset + i);
    }
    cylinderIndices.push(offset, offset + cylinderTopVertices.length / 3 - 1, offset + 1);
    //console.log(cylinderVertices.length);
    //console.log(cylinderIndices);

    cylinderVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cylinderVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cylinderIndices), gl.STATIC_DRAW);
    cylinderVertexIndexBuffer.itemSize = 1;
    cylinderVertexIndexBuffer.numItems = cylinderIndices.length;

    //DEFINING SPHERE
    var latitudeBands = 30;
    var longitudeBands = 30;
    var radius = 0.5;
    var vertexPositionData = [];
    var normalData = [];
    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);
        for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);
            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1 - (longNumber / longitudeBands);
            var v = 1 - (latNumber / latitudeBands);
            normalData.push(-x);
            normalData.push(-y);
            normalData.push(-z);
            vertexPositionData.push(radius * x);
            vertexPositionData.push(radius * y);
            vertexPositionData.push(radius * z);
        }
    }
    var indexData = [];
    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;
            indexData.push(first);
            indexData.push(second);
            indexData.push(first + 1);
            indexData.push(second);
            indexData.push(second + 1);
            indexData.push(first + 1);
        }
    }
    sphereVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
    sphereVertexNormalBuffer.itemSize = 3;
    sphereVertexNormalBuffer.numItems = normalData.length / 3;
    sphereVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
    sphereVertexPositionBuffer.itemSize = 3;
    sphereVertexPositionBuffer.numItems = vertexPositionData.length / 3;
    sphereVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STREAM_DRAW);
    sphereVertexIndexBuffer.itemSize = 1;
    sphereVertexIndexBuffer.numItems = indexData.length;

    //don't use textures for spheres. Thus, mark all as 0
    sphereTextureBuffer = gl.createBuffer();
    var sphereTextures = [];
    for (var i = 0; i < normalData.length / 3; i++) {
        sphereTextures.push(0.0, 0.0);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereTextureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereTextures), gl.STATIC_DRAW);
    sphereTextureBuffer.itemSize = 2;
    sphereTextureBuffer.numItems = normalData.length / 3;

    shadowFrameBuffer = createFrameBufferObject(gl, 512, 512);
}

function initializeAtrributes() {
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shadowMapShaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeTextureBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexTextureAttribute, cubeTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
}

function setupToDrawCube(shadow) {
    if (shadow) {
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
        gl.vertexAttribPointer(shadowMapShaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    } else {
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeTextureBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexTextureAttribute, cubeTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    }
}

function setupToDrawCubeInsides(shadow) {
    if (shadow) {
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
        gl.vertexAttribPointer(shadowMapShaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    } else {
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeInsidesVertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cubeInsidesVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeTextureBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexTextureAttribute, cubeTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    }
}

function setupToDrawCylinder(shadow) {
    if (shadow) {
        gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexPositionBuffer);
        gl.vertexAttribPointer(shadowMapShaderProgram.vertexPositionAttribute, cylinderVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cylinderVertexIndexBuffer);
    } else {
        gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cylinderVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cylinderVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, cylinderTextureBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexTextureAttribute, cylinderTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cylinderVertexIndexBuffer);
    }
}

function setupToDrawSphere(shadow) {
    if (shadow) {
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
        gl.vertexAttribPointer(shadowMapShaderProgram.vertexPositionAttribute, sphereVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
    } else {
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphereVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, sphereVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereTextureBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexTextureAttribute, sphereTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
    }
}

function setupMaterialBrass() {
    gl.uniform3f(shaderProgram.uMaterialAmbientColorUniform, 0.329412, 0.223529, 0.027451);
    gl.uniform3f(shaderProgram.uMaterialDiffuseColorUniform, 0.780392, 0.568627, 0.113725);
    gl.uniform3f(shaderProgram.uMaterialSpecularColorUniform, 0.992157, 0.941176, 0.807843);
    gl.uniform1f(shaderProgram.uMaterialShininessUniform, 27.8974);
}

function setupMaterialBronze() {
    gl.uniform3f(shaderProgram.uMaterialAmbientColorUniform, 0.2125, 0.1275, 0.054);
    gl.uniform3f(shaderProgram.uMaterialDiffuseColorUniform, 0.714, 0.4284, 0.18144);
    gl.uniform3f(shaderProgram.uMaterialSpecularColorUniform, 0.393548, 0.271906, 0.166721);
    gl.uniform1f(shaderProgram.uMaterialShininessUniform, 25.6);
}

function setupMaterialChrome() {
    gl.uniform3f(shaderProgram.uMaterialAmbientColorUniform, 0.25, 0.25, 0.25);
    gl.uniform3f(shaderProgram.uMaterialDiffuseColorUniform, 0.4, 0.4, 0.4774597);
    gl.uniform3f(shaderProgram.uMaterialSpecularColorUniform, 0.774597, 0.271906, 0.774597);
    gl.uniform1f(shaderProgram.uMaterialShininessUniform, 76.8);
}

function setupMaterial(material, shadow) {
    if (!shadow) {
        gl.uniform1i(shaderProgram.useMaterialUniform, true);
        if (material == "brass") {
            setupMaterialBrass();
        } else if (material == "bronze") {
            setupMaterialBronze();
        } else if (material == "chrome") {
            setupMaterialChrome();
        } else if (material == "none") {
            setupMaterialChrome();
            gl.uniform1i(shaderProgram.useMaterialUniform, false);
        }
    }
}

function chooseTexture(i, shadow) {
    if (!shadow) gl.uniform1i(gl.getUniformLocation(shaderProgram, "thetexture"), i);
}


var animating = 1;

var lightSourceNode;
var roomNode;

var duckBaseNode; var duckBaseAngle = 0;
var duckFirstWingNode; var duckWingAngle = 0;
var duckSecondWingNode; var duckWingDirection = 1;
var duckHeadNode; var duckHeadAngle = 0; var duckHeadDirection = 1;
var duckBottomLip; var e; var firstFingerBaseAngle = 0; var firstFingerBaseDirection = 1;
var duckTopLipNode; var firstFingerTopAngle = 0; var firstFingerTopDirection = 1;
var duckFirstLegNode; var secondFingerBaseAngle = 0; var secondFingerBaseDirection = 1;
var duckSecondLegNode; var secondFingerTopAngle = 0; var secondFingerTopDirection = 1;
var duckFirstFootNode; var thirdFingerBaseAngle = 0; var thirdFingerBaseDirection = 1;
var duckSecondFootNode; var thirdFingerTopAngle = 0; var thirdFingerTopDirection = 1;

var basePuppyNode; var basePuppyAngle = 0;
var firstPuppyEarNode; var firstCameraLegAngle = 0; var firstCameraLegDirection = 1;
var secondPuppyEarNode; var secondCameraLegAngle = 0; var secondCameraLegDirection = 1;
var thirdCameraLegNode; var thirdCameraLegAngle = 0; var thirdCameraLegDirection = 1;
var puppyBodyNode;
var firstPuppyLegNode; var secondCameraBodyTranslation = 0; var secondCameraBodyDirection = 1;
var secondPuppyLegNode; var thirdCameraBodyTranslation = 0; var thirdCameraBodyDirection = 1;
var thirdPuppyLegNode; var fourthCameraBodyTranslation = 0; var fourthCameraBodyDirection = 1;
var fourthPuppyLegNode; var lensCameraTranslation = 0; var lensCameraDirection = 1;
var puppyTailNode; var shutterCameraTranslation = 0.45; var shutterCameraDirection = 1; var puppyTailAngle = 0; var puppyTailDirection = 1;
var puppyBeakNode;

var baseCatNode; var baseCatAngle = 0;
var firstCatEarNode; var firstCameraLegAngle2 = 0; var firstCameraLegDirection2 = 1;
var secondCatEarNode; var secondCameraLegAngle2 = 0; var secondCameraLegDirection2 = 1;
var thirdCameraLegNode; var thirdCameraLegAngle2 = 0; var thirdCameraLegDirection2 = 1;
var catBodyNode;
var firstCatLegNode; var secondCameraBodyTranslation2 = 0; var secondCameraBodyDirection2 = 1;
var secondCatLegNode; var thirdCameraBodyTranslation2 = 0; var thirdCameraBodyDirection2 = 1;
var thirdCatLegNode; var fourthCameraBodyTranslation2 = 0; var fourthCameraBodyDirection2 = 1;
var fourthCatLegNode; var lensCameraTranslation2 = 0; var lensCameraDirection2 = 1;
var catTailNode; var shutterCameraTranslation2 = 0.45; var shutterCameraDirection2 = 1; var catTailAngle = 0; var catTailDirection = 1;
var catBeakNode;

function drawLightSource(shadow) {
    mvPushMatrix();
    //item specific modifications
    //draw
    setupToDrawSphere(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(1, shadow);
    setupMaterial("bronze", shadow);
    gl.drawElements(gl.TRIANGLES, sphereVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

function drawRoom(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [15.0, 8.0, 30.0]);
    //draw
    setupToDrawCubeInsides(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(1, shadow);
    setupMaterial(roomMaterial, shadow);
    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

function initObjectTree() {
    if (!wireframe) {
        drawType = gl.TRIANGLES;
    } else {
        drawType = gl.LINES;
    }

    lightSourceNode = { "draw": drawLightSource, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(lightSourceNode.matrix, [document.getElementById("lightPositionX").value / 10.0, document.getElementById("lightPositionY").value / 10.0, document.getElementById("lightPositionZ").value / 10.0]);

    roomNode = { "draw": drawRoom, "matrix": mat4.identity(mat4.create()) };

    initDuckTree()

    initPuppyTree()

    initCatTree()

    duckBaseNode.child = duckHeadNode;
    duckHeadNode.sibling = duckSecondWingNode;
    duckSecondWingNode.sibling = duckFirstWingNode;
    duckHeadNode.child = duckBottomLipNode;
    duckBottomLipNode.sibling = duckTopLipNode;
    duckFirstWingNode.sibling = duckFirstLegNode;
    duckFirstLegNode.sibling = duckSecondLegNode;
    duckFirstLegNode.child = duckFirstFootNode;
    duckSecondLegNode.child = duckSecondFootNode;

    duckBaseNode.sibling = basePuppyNode;
    basePuppyNode.child = firstPuppyEarNode;
    firstPuppyEarNode.sibling = secondPuppyEarNode;
    secondPuppyEarNode.sibling = puppyBodyNode;
    puppyBodyNode.child = firstPuppyLegNode;
    firstPuppyLegNode.child = secondPuppyLegNode;
    secondPuppyLegNode.child = thirdPuppyLegNode;
    thirdPuppyLegNode.child = fourthPuppyLegNode;
    firstPuppyLegNode.sibling = puppyTailNode;
    puppyTailNode.sibling = puppyBeakNode;

    basePuppyNode.sibling = baseCatNode;
    baseCatNode.child = firstCatEarNode;
    firstCatEarNode.sibling = secondCatEarNode;
    secondCatEarNode.sibling = catBodyNode;
    catBodyNode.child = firstCatLegNode;
    firstCatLegNode.child = secondCatLegNode;
    secondCatLegNode.child = thirdCatLegNode;
    thirdCatLegNode.child = fourthCatLegNode;
    firstCatLegNode.sibling = catTailNode;
    catTailNode.sibling = catBeakNode;
}

function traverse(node, shadow) {
    mvPushMatrix();
    //modifications
    mat4.multiply(mvMatrix, node.matrix);
    //draw
    node.draw(shadow);
    if ("child" in node) traverse(node.child, shadow);
    mvPopMatrix(shadow);
    if ("sibling" in node) traverse(node.sibling, shadow);
}

var shadowMapLookAtMatrix = mat4.create();
var shadowMapPerspectiveMatrix = mat4.create();
var shadowMapTransform = mat4.create();

// a representation of vector 3
// taken from http://learnwebgl.brown37.net/lib/learn_webgl_vector3.js
var Vector3 = function () {

    var self = this;

    /** ---------------------------------------------------------------------
    * Create a new 3-component vector.
    * @param dx Number The change in x of the vector.
    * @param dy Number The change in y of the vector.
    * @param dz Number The change in z of the vector.
    * @return Float32Array A new 3-component vector
    */
    self.create = function (dx, dy, dz) {
        var v = new Float32Array(3);
        v[0] = 0;
        v[1] = 0;
        v[2] = 0;
        if (arguments.length >= 1) { v[0] = dx; }
        if (arguments.length >= 2) { v[1] = dy; }
        if (arguments.length >= 3) { v[2] = dz; }
        return v;
    };

    /** ---------------------------------------------------------------------
    * Create a new 3-component vector and set its components equal to an existing vector.
    * @param from Float32Array An existing vector.
    * @return Float32Array A new 3-component vector with the same values as "from"
    */
    self.createFrom = function (from) {
        var v = new Float32Array(3);
        v[0] = from[0];
        v[1] = from[1];
        v[2] = from[2];
        return v;
    };

    /** ---------------------------------------------------------------------
    * Create a vector using two existing points.
    * @param tail Float32Array A 3-component point.
    * @param head Float32Array A 3-component point.
    * @return Float32Array A new 3-component vector defined by 2 points
    */
    self.createFrom2Points = function (tail, head) {
        var v = new Float32Array(3);
        self.subtract(v, head, tail);
        return v;
    };

    /** ---------------------------------------------------------------------
    * Copy a 3-component vector into another 3-component vector
    * @param to Float32Array A 3-component vector that you want changed.
    * @param from Float32Array A 3-component vector that is the source of data
    * @returns Float32Array The "to" 3-component vector
    */
    self.copy = function (to, from) {
        to[0] = from[0];
        to[1] = from[1];
        to[2] = from[2];
        return to;
    };

    /** ---------------------------------------------------------------------
    * Set the components of a 3-component vector.
    * @param v Float32Array The vector to change.
    * @param dx Number The change in x of the vector.
    * @param dy Number The change in y of the vector.
    * @param dz Number The change in z of the vector.
    */
    self.set = function (v, dx, dy, dz) {
        v[0] = dx;
        v[1] = dy;
        v[2] = dz;
    };

    /** ---------------------------------------------------------------------
    * Calculate the length of a vector.
    * @param v Float32Array A 3-component vector.
    * @return Number The length of a vector
    */
    self.length = function (v) {
        return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    };

    /** ---------------------------------------------------------------------
    * Make a vector have a length of 1.
    * @param v Float32Array A 3-component vector.
    * @return Float32Array The input vector normalized to unit length. Or null if the vector is zero length.
    */
    self.normalize = function (v) {
        var length, percent;

        length = self.length(v);
        if (Math.abs(length) < 0.0000001) {
            return null; // Invalid vector
        }

        percent = 1.0 / length;
        v[0] = v[0] * percent;
        v[1] = v[1] * percent;
        v[2] = v[2] * percent;
        return v;
    };

    /** ---------------------------------------------------------------------
    * Add two vectors:  result = V0 + v1
    * @param result Float32Array A 3-component vector.
    * @param v0 Float32Array A 3-component vector.
    * @param v1 Float32Array A 3-component vector.
    */
    self.add = function (result, v0, v1) {
        result[0] = v0[0] + v1[0];
        result[1] = v0[1] + v1[1];
        result[2] = v0[2] + v1[2];
    };

    /** ---------------------------------------------------------------------
    * Subtract two vectors:  result = v0 - v1
    * @param result Float32Array A 3-component vector.
    * @param v0 Float32Array A 3-component vector.
    * @param v1 Float32Array A 3-component vector.
    */
    self.subtract = function (result, v0, v1) {
        result[0] = v0[0] - v1[0];
        result[1] = v0[1] - v1[1];
        result[2] = v0[2] - v1[2];
    };

    /** ---------------------------------------------------------------------
    * Scale a vector:  result = s * v0
    * @param result Float32Array A 3-component vector.
    * @param v0 Float32Array A 3-component vector.
    * @param s Number A scale factor.
    */
    self.scale = function (result, v0, s) {
        result[0] = v0[0] * s;
        result[1] = v0[1] * s;
        result[2] = v0[2] * s;
    };

    /** ---------------------------------------------------------------------
    * Calculate the cross product of 2 vectors: result = v0 x v1 (order matters)
    * @param result Float32Array A 3-component vector.
    * @param v0 Float32Array A 3-component vector.
    * @param v1 Float32Array A 3-component vector.
    */
    self.crossProduct = function (result, v0, v1) {
        result[0] = v0[1] * v1[2] - v0[2] * v1[1];
        result[1] = v0[2] * v1[0] - v0[0] * v1[2];
        result[2] = v0[0] * v1[1] - v0[1] * v1[0];
    };

    /** ---------------------------------------------------------------------
    * Calculate the dot product of 2 vectors
    * @param v0 Float32Array A 3-component vector.
    * @param v1 Float32Array A 3-component vector.
    * @return Number Float32Array The dot product of v0 and v1
    */
    self.dotProduct = function (v0, v1) {
        return v0[0] * v1[0] + v0[1] * v1[1] + v0[2] * v1[2];
    };

    /** ---------------------------------------------------------------------
    * Print a vector on the console.
    * @param name String A description of the vector to be printed.
    * @param v Float32Array A 3-component vector.
    */
    self.print = function (name, v) {
        var maximum, order, digits;

        maximum = Math.max(v[0], v[1], v[2]);
        order = Math.floor(Math.log(maximum) / Math.LN10 + 0.000000001);
        digits = (order <= 0) ? 5 : (order > 5) ? 0 : (5 - order);

        console.log("Vector3: " + name + ": " + v[0].toFixed(digits) + " "
            + v[1].toFixed(digits) + " "
            + v[2].toFixed(digits));
    };
};

var V = new Vector3();
var center = V.create();
var eye = V.create();
var up = V.create();
var u = V.create();
var v = V.create();
var n = V.create();

// a method to generate lookat matrix
// taken from http://learnwebgl.brown37.net/lib/learn_webgl_matrix.js because mat4.lookat seems buggy
lookAt = function (M, eye_x, eye_y, eye_z, center_x, center_y, center_z, up_dx, up_dy, up_dz) {

    // Local coordinate system for the camera:
    //   u maps to the x-axis
    //   v maps to the y-axis
    //   n maps to the z-axis

    V.set(center, center_x, center_y, center_z);
    V.set(eye, eye_x, eye_y, eye_z);
    V.set(up, up_dx, up_dy, up_dz);

    V.subtract(n, eye, center);  // n = eye - center
    V.normalize(n);

    V.crossProduct(u, up, n);
    V.normalize(u);

    V.crossProduct(v, n, u);
    V.normalize(v);

    var tx = - V.dotProduct(u, eye);
    var ty = - V.dotProduct(v, eye);
    var tz = - V.dotProduct(n, eye);

    // Set the camera matrix
    M[0] = u[0]; M[4] = u[1]; M[8] = u[2]; M[12] = tx;
    M[1] = v[0]; M[5] = v[1]; M[9] = v[2]; M[13] = ty;
    M[2] = n[0]; M[6] = n[1]; M[10] = n[2]; M[14] = tz;
    M[3] = 0; M[7] = 0; M[11] = 0; M[15] = 1;
};

//draws shadowmap for the side of the texture
//0: positive x, ..., 5: negative z
function drawShadowMap(side) {
    var centers = [
        1.0, 0.0, 0.0, //positive x
        -1.0, 0.0, 0.0, //negative x
        0.0, 1.0, 0.0, //positive y
        0.0, -1.0, 0.0, //negative y
        0.0, 0.0, 1.0, //positive z
        0.0, 0.0, -1.0, //negative z
    ];

    var upVectors = [
        0.0, -1.0, 0.0, //positive x
        0.0, -1.0, 0.0, //negative x
        0.0, 0.0, 1.0, //positive y
        0.0, 0.0, -1.0, //negative y
        0.0, -1.0, 0.0, //positive z
        0.0, -1.0, 0.0, //negative z
    ];
    gl.useProgram(shadowMapShaderProgram);
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFrameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + side, shadowFrameBuffer.depthBuffer, 0);

    gl.viewport(0, 0, shadowFrameBuffer.width, shadowFrameBuffer.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    shadowMapLookAtMatrix = mat4.create();
    lookAt(shadowMapLookAtMatrix,
        parseFloat($("#lightPositionX").val() / 10.0),
        parseFloat($("#lightPositionY").val() / 10.0),
        parseFloat($("#lightPositionZ").val() / 10.0),
        parseFloat($("#lightPositionX").val() / 10.0) + centers[side * 3],
        parseFloat($("#lightPositionY").val() / 10.0) + centers[side * 3 + 1],
        parseFloat($("#lightPositionZ").val() / 10.0) + centers[side * 3 + 2],
        upVectors[side * 3],
        upVectors[side * 3 + 1],
        upVectors[side * 3 + 2]);
    mat4.perspective(90, shadowFrameBuffer.width / shadowFrameBuffer.height, 0.1, 100.0, shadowMapTransform);
    mat4.multiply(shadowMapTransform, shadowMapLookAtMatrix);
    mat4.set(shadowMapTransform, pMatrix);

    gl.uniform3f(
        shadowMapShaderProgram.pointLightingLocationUniform,
        parseFloat($("#lightPositionX").val() / 10.0),
        parseFloat($("#lightPositionY").val() / 10.0),
        parseFloat($("#lightPositionZ").val() / 10.0)
    );
    gl.uniform1f(shadowMapShaderProgram.uFarPlaneUniform, 100.0);

    mat4.identity(mvMatrix);
    traverse(roomNode, true);
    mat4.translate(mvMatrix, [0, 0, -20]);
    traverse(duckBaseNode, true);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

var lookAtMatrix;
function drawScene() {
    lookAtMatrix = mat4.create();
    gl.useProgram(shaderProgram);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    pMatrix = mat4.create();
    if (cameraMode) {
        lookAt(lookAtMatrix,
            parseFloat($("#eyePosition1").val() / 10.0),
            parseFloat($("#eyePosition2").val() / 10.0),
            parseFloat($("#eyePosition3").val() / 10.0),
            parseFloat($("#centerPosition1").val() / 10.0),
            parseFloat($("#centerPosition2").val() / 10.0),
            parseFloat($("#centerPosition3").val() / 10.0),
            parseFloat($("#upPosition1").val() / 10.0),
            parseFloat($("#upPosition2").val() / 10.0),
            parseFloat($("#upPosition3").val() / 10.0));
        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
        mat4.multiply(pMatrix, lookAtMatrix);
    } else {
        lookAt(lookAtMatrix,
            0.0, 0.0, 5.0,
            0.0, 0.0, 6.0,
            0, 1, 0.0);
        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
        var newMat = mat4.identity(mat4.create())
        basePuppyNode.location[2] -= 20
        mat4.translate(newMat, basePuppyNode.location);
        mat4.rotate(newMat, basePuppyNode.rotation, [0.0, 1.0, 0.0]);
        mat4.multiply(pMatrix, lookAtMatrix);
        mat4.multiply(pMatrix, mat4.inverse(newMat, mat4.create()));
    }

    gl.uniform1i(shaderProgram.useLightingUniform, $("#lighting").prop("checked"));
    gl.uniform1i(shaderProgram.useTextureUniform, $("#texture").prop("checked"));

    gl.uniform3f(
        shaderProgram.ambientColorUniform,
        parseFloat($("#ambientR").val()),
        parseFloat($("#ambientG").val()),
        parseFloat($("#ambientB").val())
    );
    gl.uniform3f(
        shaderProgram.pointLightingLocationUniform,
        parseFloat($("#lightPositionX").val() / 10.0),
        parseFloat($("#lightPositionY").val() / 10.0),
        parseFloat($("#lightPositionZ").val() / 10.0)
    );
    gl.uniform3f(
        shaderProgram.pointLightingDiffuseColorUniform,
        parseFloat($("#pointR").val()),
        parseFloat($("#pointG").val()),
        parseFloat($("#pointB").val())
    );
    gl.uniform3f(
        shaderProgram.pointLightingSpecularColorUniform,
        parseFloat($("#pointR").val()),
        parseFloat($("#pointG").val()),
        parseFloat($("#pointB").val())
    );

    gl.activeTexture(gl.TEXTURE31);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadowFrameBuffer.depthBuffer);
    gl.uniform1i(shaderProgram.shadowMapUniform, 31);

    gl.uniform1f(shaderProgram.uFarPlaneUniform, 100.0);

    mat4.identity(mvMatrix);
    traverse(lightSourceNode, false);
    traverse(roomNode, false);

    mat4.translate(mvMatrix, [0, 0, -20]);
    traverse(duckBaseNode, false);

}

function animate() {
    if (animating) {
        //var update = (0.05 * Math.PI * (timeNow - lastTime)/ 180); //use elapsed time, which is faulty on changing tabs
        var update = (0.5 * Math.PI * 10 / 180);

        //ARM
        duckBaseAngle = (duckBaseAngle + update) % (2 * Math.PI);
        $("#duckBaseAngle").val(duckBaseAngle * 180 / (Math.PI))

        duckHeadAngle += update * duckHeadDirection;
        if (duckHeadAngle < -Math.PI / 4 && duckHeadDirection == -1) duckHeadDirection *= -1;
        if (duckHeadAngle > Math.PI / 4 && duckHeadDirection == 1) duckHeadDirection *= -1;
        $("#duckHeadAngle").val(duckHeadAngle * 180 / (Math.PI));

        duckWingAngle += update * duckWingDirection;
        if (duckWingAngle < 0 && duckWingDirection == -1) duckWingDirection *= -1;
        if (duckWingAngle > Math.PI / 4 && duckWingDirection == 1) duckWingDirection *= -1;
        $("#duckWingAngle").val(duckWingAngle * 180 / (Math.PI));

        firstFingerBaseAngle += update * firstFingerBaseDirection;
        if (firstFingerBaseAngle < -Math.PI / 4 && firstFingerBaseDirection == -1) firstFingerBaseDirection *= -1;
        if (firstFingerBaseAngle > Math.PI / 8 && firstFingerBaseDirection == 1) firstFingerBaseDirection *= -1;
        document.getElementById("firstFingerBaseRotationSlider").value = firstFingerBaseAngle * 180 / (Math.PI);

        firstFingerTopAngle += update * firstFingerTopDirection;
        if (firstFingerTopAngle < 0 && firstFingerTopDirection == -1) firstFingerTopDirection *= -1;
        if (firstFingerTopAngle > Math.PI / 8 && firstFingerTopDirection == 1) firstFingerTopDirection *= -1;
        document.getElementById("firstFingerTopRotationSlider").value = firstFingerTopAngle * 180 / (Math.PI);

        secondFingerBaseAngle += update * secondFingerBaseDirection;
        if (secondFingerBaseAngle < -Math.PI / 4 && secondFingerBaseDirection == -1) secondFingerBaseDirection *= -1;
        if (secondFingerBaseAngle > Math.PI / 8 && secondFingerBaseDirection == 1) secondFingerBaseDirection *= -1;
        document.getElementById("secondFingerBaseRotationSlider").value = secondFingerBaseAngle * 180 / (Math.PI);

        secondFingerTopAngle += update * secondFingerTopDirection;
        if (secondFingerTopAngle < 0 && secondFingerTopDirection == -1) secondFingerTopDirection *= -1;
        if (secondFingerTopAngle > Math.PI / 8 && secondFingerTopDirection == 1) secondFingerTopDirection *= -1;
        document.getElementById("secondFingerTopRotationSlider").value = secondFingerTopAngle * 180 / (Math.PI);

        thirdFingerBaseAngle += update * thirdFingerBaseDirection;
        if (thirdFingerBaseAngle < -Math.PI / 4 && thirdFingerBaseDirection == -1) thirdFingerBaseDirection *= -1;
        if (thirdFingerBaseAngle > Math.PI / 8 && thirdFingerBaseDirection == 1) thirdFingerBaseDirection *= -1;
        document.getElementById("thirdFingerBaseRotationSlider").value = thirdFingerBaseAngle * 180 / (Math.PI);

        thirdFingerTopAngle += update * thirdFingerTopDirection;
        if (thirdFingerTopAngle < 0 && thirdFingerTopDirection == -1) thirdFingerTopDirection *= -1;
        if (thirdFingerTopAngle > Math.PI / 8 && thirdFingerTopDirection == 1) thirdFingerTopDirection *= -1;
        document.getElementById("thirdFingerTopRotationSlider").value = thirdFingerTopAngle * 180 / (Math.PI);

        //PUPPY
        basePuppyAngle = (basePuppyAngle + update) % (2 * Math.PI);
        document.getElementById("baseCameraRotationSlider").value = basePuppyAngle * 180 / (Math.PI);

        firstCameraLegAngle += update * firstCameraLegDirection;
        if (firstCameraLegAngle < 0 && firstCameraLegDirection == -1) firstCameraLegDirection *= -1;
        if (firstCameraLegAngle > Math.PI / 4 && firstCameraLegDirection == 1) firstCameraLegDirection *= -1;
        document.getElementById("firstCameraLegRotationSlider").value = firstCameraLegAngle * 180 / (Math.PI);

        secondCameraLegAngle += update * secondCameraLegDirection;
        if (secondCameraLegAngle < 0 && secondCameraLegDirection == -1) secondCameraLegDirection *= -1;
        if (secondCameraLegAngle > Math.PI / 4 && secondCameraLegDirection == 1) secondCameraLegDirection *= -1;
        document.getElementById("secondCameraLegRotationSlider").value = secondCameraLegAngle * 180 / (Math.PI);

        thirdCameraLegAngle += update * thirdCameraLegDirection;
        if (thirdCameraLegAngle < 0 && thirdCameraLegDirection == -1) thirdCameraLegDirection *= -1;
        if (thirdCameraLegAngle > Math.PI / 4 && thirdCameraLegDirection == 1) thirdCameraLegDirection *= -1;
        document.getElementById("thirdCameraLegRotationSlider").value = thirdCameraLegAngle * 180 / (Math.PI);

        secondCameraBodyTranslation += 0.5 * update * secondCameraBodyDirection;
        if (secondCameraBodyTranslation < 0.05 && secondCameraBodyDirection == -1) secondCameraBodyDirection *= -1;
        if (secondCameraBodyTranslation > 0.3 && secondCameraBodyDirection == 1) secondCameraBodyDirection *= -1;
        document.getElementById("secondCameraBodyTranslationSlider").value = secondCameraBodyTranslation * 100;

        thirdCameraBodyTranslation += 0.5 * update * thirdCameraBodyDirection;
        if (thirdCameraBodyTranslation < 0.05 && thirdCameraBodyDirection == -1) thirdCameraBodyDirection *= -1;
        if (thirdCameraBodyTranslation > 0.2 && thirdCameraBodyDirection == 1) thirdCameraBodyDirection *= -1;
        document.getElementById("thirdCameraBodyTranslationSlider").value = thirdCameraBodyTranslation * 100;

        fourthCameraBodyTranslation += 0.5 * update * fourthCameraBodyDirection;
        if (fourthCameraBodyTranslation < 0.05 && fourthCameraBodyDirection == -1) fourthCameraBodyDirection *= -1;
        if (fourthCameraBodyTranslation > 0.2 && fourthCameraBodyDirection == 1) fourthCameraBodyDirection *= -1;
        document.getElementById("fourthCameraBodyTranslationSlider").value = fourthCameraBodyTranslation * 100;

        lensCameraTranslation += 0.5 * update * lensCameraDirection;
        if (lensCameraTranslation < 3 && lensCameraDirection == -1) lensCameraDirection *= -1;
        if (lensCameraTranslation > 3.25 && lensCameraDirection == 1) lensCameraDirection *= -1;
        document.getElementById("lensCameraTranslationSlider").value = lensCameraTranslation * 100;

        shutterCameraTranslation += 0.5 * update * shutterCameraDirection;
        if (shutterCameraTranslation < 0.45 && shutterCameraDirection == -1) shutterCameraDirection *= -1;
        if (shutterCameraTranslation > 0.55 && shutterCameraDirection == 1) shutterCameraDirection *= -1;
        document.getElementById("shutterCameraTranslationSlider").value = shutterCameraTranslation * 100;

        puppyTailAngle += update * puppyTailDirection;
        if (puppyTailAngle < -0.75 && puppyTailDirection == -1) puppyTailDirection *= -1;
        if (puppyTailAngle > 0.75 && puppyTailDirection == 1) puppyTailDirection *= -1;
        document.getElementById("secondArmRotationSlider").value = puppyTailAngle * 180 / (Math.PI);

        // CAT

        baseCatAngle = (baseCatAngle + update) % (2 * Math.PI);
        document.getElementById("baseCameraRotationSlider").value = baseCatAngle * 180 / (Math.PI);

        firstCameraLegAngle2 += update * firstCameraLegDirection2;
        if (firstCameraLegAngle2 < 0 && firstCameraLegDirection2 == -1) firstCameraLegDirection2 *= -1;
        if (firstCameraLegAngle2 > Math.PI / 4 && firstCameraLegDirection2 == 1) firstCameraLegDirection2 *= -1;
        document.getElementById("firstCameraLegRotationSlider").value = firstCameraLegAngle2 * 180 / (Math.PI);

        secondCameraLegAngle2 += update * secondCameraLegDirection2;
        if (secondCameraLegAngle2 < 0 && secondCameraLegDirection2 == -1) secondCameraLegDirection2 *= -1;
        if (secondCameraLegAngle2 > Math.PI / 4 && secondCameraLegDirection2 == 1) secondCameraLegDirection2 *= -1;
        document.getElementById("secondCameraLegRotationSlider").value = secondCameraLegAngle2 * 180 / (Math.PI);

        thirdCameraLegAngle2 += update * thirdCameraLegDirection2;
        if (thirdCameraLegAngle2 < 0 && thirdCameraLegDirection2 == -1) thirdCameraLegDirection2 *= -1;
        if (thirdCameraLegAngle2 > Math.PI / 4 && thirdCameraLegDirection2 == 1) thirdCameraLegDirection2 *= -1;
        document.getElementById("thirdCameraLegRotationSlider").value = thirdCameraLegAngle2 * 180 / (Math.PI);

        secondCameraBodyTranslation2 += 0.5 * update * secondCameraBodyDirection2;
        if (secondCameraBodyTranslation2 < 0.05 && secondCameraBodyDirection2 == -1) secondCameraBodyDirection2 *= -1;
        if (secondCameraBodyTranslation2 > 0.3 && secondCameraBodyDirection2 == 1) secondCameraBodyDirection2 *= -1;
        document.getElementById("secondCameraBodyTranslationSlider").value = secondCameraBodyTranslation2 * 100;

        thirdCameraBodyTranslation2 += 0.5 * update * thirdCameraBodyDirection2;
        if (thirdCameraBodyTranslation2 < 0.05 && thirdCameraBodyDirection2 == -1) thirdCameraBodyDirection2 *= -1;
        if (thirdCameraBodyTranslation2 > 0.2 && thirdCameraBodyDirection2 == 1) thirdCameraBodyDirection2 *= -1;
        document.getElementById("thirdCameraBodyTranslationSlider").value = thirdCameraBodyTranslation2 * 100;

        fourthCameraBodyTranslation2 += 0.5 * update * fourthCameraBodyDirection2;
        if (fourthCameraBodyTranslation2 < 0.05 && fourthCameraBodyDirection2 == -1) fourthCameraBodyDirection2 *= -1;
        if (fourthCameraBodyTranslation2 > 0.2 && fourthCameraBodyDirection2 == 1) fourthCameraBodyDirection2 *= -1;
        document.getElementById("fourthCameraBodyTranslationSlider").value = fourthCameraBodyTranslation2 * 100;

        lensCameraTranslation2 += 0.5 * update * lensCameraDirection2;
        if (lensCameraTranslation2 < 3 && lensCameraDirection2 == -1) lensCameraDirection2 *= -1;
        if (lensCameraTranslation2 > 3.25 && lensCameraDirection2 == 1) lensCameraDirection2 *= -1;
        document.getElementById("lensCameraTranslationSlider").value = lensCameraTranslation2 * 100;

        shutterCameraTranslation2 += 0.5 * update * shutterCameraDirection2;
        if (shutterCameraTranslation2 < 0.45 && shutterCameraDirection2 == -1) shutterCameraDirection2 *= -1;
        if (shutterCameraTranslation2 > 0.55 && shutterCameraDirection2 == 1) shutterCameraDirection2 *= -1;
        document.getElementById("shutterCameraTranslationSlider").value = shutterCameraTranslation2 * 100;

        catTailAngle += update * catTailDirection;
        if (catTailAngle < -0.75 && catTailDirection == -1) catTailDirection *= -1;
        if (catTailAngle > 0.75 && catTailDirection == 1) catTailDirection *= -1;
        document.getElementById("secondArmRotationSlider").value = catTailAngle * 180 / (Math.PI);

    }
    initObjectTree();
}

function tick() {
    requestAnimationFrame(tick);
    for (var i = 0; i < 6; i++) {
        drawShadowMap(i);
    }
    drawScene();
    animate();
}

function initInputs() {
    $("#animation").checked = true;
    $("#lighting").checked = true;
    $("#texture").checked = true;
    $("#animation").change(function () {
        animating ^= 1;
        if (animating) {
            document.getElementById("baseArmRotationSlider").disabled = true;
            document.getElementById("secondArmRotationSlider").disabled = true;
            document.getElementById("palmRotationSlider").disabled = true;
            document.getElementById("firstFingerBaseRotationSlider").disabled = true;
            document.getElementById("firstFingerToheRdDuckationSlider").disabled = true;
            document.getElementById("secondFingerBaseRotationSlider").disabled = true;
            document.getElementById("secondFingerTopRotationSlider").disabled = true;
            document.getElementById("thirdFingerBaseRotationSlider").disabled = true;
            document.getElementById("thirdFingerTopRotationSlider").disabled = true;
            document.getElementById("baseCameraRotationSlider").disabled = true;
            document.getElementById("firstCameraLegRotationSlider").disabled = true;
            document.getElementById("secondCameraLegRotationSlider").disabled = true;
            document.getElementById("thirdCameraLegRotationSlider").disabled = true;
            document.getElementById("secondCameraBodyTranslationSlider").disabled = true;
            document.getElementById("thirdCameraBodyTranslationSlider").disabled = true;
            document.getElementById("fourthCameraBodyTranslationSlider").dDuckbled = true;
            document.getElementById("lensCameraTranslationSlider").disabled = true;
            document.getElementById("shutterCameraTranslationSlider").disabled = true;
        } else {
            document.getElementById("baseArmRotationSlider").disabled = false;
            document.getElementById("secondArmRotationSlider").disabled = false;
            document.getElementById("palmRotationSlider").disabled = false;
            document.getElementById("firstFingerBaseRotationSlider").disabled = false;
            document.getElementById("firstFingerTopRotationSlider").disabled = false;
            document.getElementById("secondFingerBaseRotationSlider").disabled = false;
            document.getElementById("secondFingerTopRotationSlider").disabled = false;
            document.getElementById("thirdFingerBaseRotationSlider").disabled = false;
            document.getElementById("thirdFingerTopRotationSlider").disabled = false;
            document.getElementById("baseCameraRotationSlider").disabled = false;
            document.getElementById("firstCameraLegRotationSlider").disabled = false;
            document.getElementById("secondCameraLegRotationSlider").disabled = false;
            document.getElementById("thirdCameraLegRotationSlider").disabled = false;
            document.getElementById("secondCameraBodyTranslationSlider").disabled = false;
            document.getElementById("thirdCameraBodyTranslationSlider").disabled = false;
            document.getElementById("fourthCameraBodyTranslationSlider").disabled = false;
            document.getElementById("lensCameraTranslationSlider").disabled = false;
            document.getElementById("shutterCameraTranslationSlider").disabled = false;
        }
    });
    $("#wireframe").change(() => wireframe = !wireframe)

    $("#duckBaseAngle").change((e) => duckBaseAngle = parseFloat(e.target.value) * Math.PI / 180)
    $("#duckHeadAngle").change((e) => duckHeadAngle = parseFloat(e.target.value) * Math.PI / 180)
    $("#duckWingAngle").change((e) => duckWingAngle = parseFloat(e.target.value) * Math.PI / 180)

    document.getElementById("baseArmRotationSlider").oninput = function () {
        duckBaseAngle = document.getElementById("baseArmRotationSlider").value * Math.PI / 180;
    }
    document.getElementById("secondArmRotationSlider").oninput = function () {
        secondArmAngle = document.getElementById("secondArmRotationSlider").value * Math.PI / 180;
    }
    document.getElementById("palmRotationSlider").oninput = function () {
        duckHeadAngle = document.getElementById("palmRotationSlider").value * Math.PI / 180;
    }
    document.getElementById("firstFingerBaseRotationSlider").oninput = function () {
        firstFingerBaseAngle = document.getElementById("firstFingerBaseRotationSlider").value * Math.PI / 180;
    }
    document.getElementById("firstFingerTopRotationSlider").oninput = function () {
        firstFingerTopAngle = document.getElementById("firstFingerTopRotationSlider").value * Math.PI / 180;
    }
    document.getElementById("secondFingerBaseRotationSlider").oninput = function () {
        secondFingerBaseAngle = document.getElementById("secondFingerBaseRotationSlider").value * Math.PI / 180;
    }
    document.getElementById("secondFingerTopRotationSlider").oninput = function () {
        secondFingerTopAngle = document.getElementById("secondFingerTopRotationSlider").value * Math.PI / 180;
    }
    document.getElementById("thirdFingerBaseRotationSlider").oninput = function () {
        thirdFingerBaseAngle = document.getElementById("thirdFingerBaseRotationSlider").value * Math.PI / 180;
    }
    document.getElementById("thirdFingerTopRotationSlider").oninput = function () {
        thirdFingerTopAngle = document.getElementById("thirdFingerTopRotationSlider").value * Math.PI / 180;
    }
    document.getElementById("baseCameraRotationSlider").oninput = function () {
        basePuppyAngle = document.getElementById("baseCameraRotationSlider").value * Math.PI / 180;
    }
    document.getElementById("firstCameraLegRotationSlider").oninput = function () {
        firstCameraLegAngle = document.getElementById("firstCameraLegRotationSlider").value * Math.PI / 180;
    }
    document.getElementById("secondCameraLegRotationSlider").oninput = function () {
        secondCameraLegAngle = document.getElementById("secondCameraLegRotationSlider").value * Math.PI / 180;
    }
    document.getElementById("thirdCameraLegRotationSlider").oninput = function () {
        thirdCameraLegAngle = document.getElementById("thirdCameraLegRotationSlider").value * Math.PI / 180;
    }
    document.getElementById("secondCameraBodyTranslationSlider").oninput = function () {
        thirdCameraLegAngle = document.getElementById("thirdCameraLegRotationSlider").value * Math.PI / 180;
    }
    document.getElementById("secondCameraBodyTranslationSlider").oninput = function () {
        secondCameraBodyTranslation = document.getElementById("secondCameraBodyTranslationSlider").value / 100;
    }
    document.getElementById("thirdCameraBodyTranslationSlider").oninput = function () {
        thirdCameraBodyTranslation = document.getElementById("thirdCameraBodyTranslationSlider").value / 100;
    }
    document.getElementById("fourthCameraBodyTranslationSlider").oninput = function () {
        fourthCameraBodyTranslation = document.getElementById("fourthCameraBodyTranslationSlider").value / 100;
    }
    document.getElementById("lensCameraTranslationSlider").oninput = function () {
        lensCameraTranslation = document.getElementById("lensCameraTranslationSlider").value / 100;
    }
    document.getElementById("shutterCameraTranslationSlider").oninput = function () {
        shutterCameraTranslation = document.getElementById("shutterCameraTranslationSlider").value / 100;
    }

    document.getElementById('camera-select').onchange = function () {
        camera_mode = document.getElementById('camera-select').value;
        if (camera_mode == 'default') {
            document.getElementById('cameraContent').style.display = 'block';
            cameraMode = true;
        }
        else {
            cameraMode = false;
            document.getElementById('cameraContent').style.display = 'none';
        }
    }
}

function configureTexture(image, textureno) {
    var texture = gl.createTexture();
    gl.activeTexture(textureno);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
        gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

}

function initTexture() {
    var image0 = new Image();
    image0.onload = function () {
        configureTexture(image0, gl.TEXTURE0);
    }
    image0.src = "img/dogfur.jpg"

    var image1 = new Image();
    image1.onload = function () {
        configureTexture(image1, gl.TEXTURE1);
    }
    image1.src = "img/grass.jpg"

    var image2 = new Image();
    image2.onload = function () {
        configureTexture(image2, gl.TEXTURE2);
    }
    image2.src = "img/cat.jpg"

    var image3 = new Image();
    image3.onload = function () {
        configureTexture(image3, gl.TEXTURE3);
    }
    image3.src = "img/bulu.jpg"

    var image6 = new Image();
    image6.onload = function () {
        configureTexture(image6, gl.TEXTURE6);
    }
    image6.src = "img/black.jpg"

    var image7 = new Image();
    image7.onload = function () {
        configureTexture(image7, gl.TEXTURE7);
    }
    image7.src = "img/red.jpg"

    var image8 = new Image();
    image8.onload = function () {
        configureTexture(image8, gl.TEXTURE8);
    }
    image8.src = "img/glass.jpg"
}

function webGLStart() {
    var canvas = document.getElementById("canvas");
    armMaterial = document.getElementById("arm-material").value;
    cameraMaterial = document.getElementById("camera-material").value;
    roomMaterial = document.getElementById("room-material").value;
    initGL(canvas);
    initShaders();
    initBuffers();
    initObjectTree();
    initInputs();
    initTexture();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    initializeAtrributes()
    tick();

    $(".tab").click(function () {
        $(".tab").removeClass("tab-active")
        const tab = $(this)
        const tabFor = tab.attr('for')
        tab.addClass("tab-active")
        $("#tab-general, #tab-duck, #tab-dog").addClass("hidden")
        if (tabFor == 'general') $("#tab-general").removeClass("hidden")
        else if (tabFor == 'duck') $("#tab-duck").removeClass("hidden")
        else if (tabFor == 'dog') $("#tab-dog").removeClass("hidden")
    })
}