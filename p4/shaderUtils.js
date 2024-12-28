export function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const compileError = gl.getShaderInfoLog(shader);
    const typeString = type === gl.VERTEX_SHADER ? 'vertex' : 'fragment';
    gl.deleteShader(shader);
    throw new Error(`Failed to COMPILE ${typeString} shader: ${compileError}`);
  }

  return shader;
}

export function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`ERROR Unable to initialize the shader program: ${gl.getProgramInfoLog(program)}`);
  }

  return program;
}

export function initBuffers(gl, model) {
  model.idBufferVertices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);

  if (model.VertexNormals !== undefined) {
    model.idNormals = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, model.idNormals);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.VertexNormals), gl.STATIC_DRAW);
  }

  if (model.TexCoords != undefined) {
    model.idTex = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, model.idTex);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.TexCoords), gl.STATIC_DRAW);
  }
  model.texture = gl.createTexture();

  model.idBufferIndices = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);
}

//Function to load textures through URL
export async function loadTexture(gl, model) {
  const setTexture = (gl, image, model) => {
    gl.bindTexture(gl.TEXTURE_2D, model.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.generateMipmap(gl.TEXTURE_2D);
  };

  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = src;
      image.onload = () => resolve(image);
      image.onerror = (err) => reject(new Error('Error loading image ' + src));
    });
  };

  try {
    const image = await loadImage(model.file);
    setTexture(gl, image, model);
  } catch (error) {
    console.error(error);
  }
}

export function setShaderNormalMatrix(gl, program, normalMatrix) {
  gl.uniformMatrix3fv(program.normalMatrixIndex, false, normalMatrix);
}

export function getNormalMatrix(modelViewMatrix) {
  const normalMatrix = mat3.create();
  mat3.normalFromMat4(normalMatrix, modelViewMatrix);
  return normalMatrix;
}

export function setShaderMaterial(gl, program, material) {
  gl.uniform3fv(program.KaIndex, material.mat_ambient);
  gl.uniform3fv(program.KdIndex, material.mat_diffuse);
  gl.uniform3fv(program.KsIndex, material.mat_specular);
  gl.uniform1f(program.alphaIndex, material.alpha);
}

export function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return [((bigint >> 16) & 255) / 255, ((bigint >> 8) & 255) / 255, (bigint & 255) / 255];
}

export function rgbToHex(rgb) {
  const r = Math.round(rgb[0] * 255);
  const g = Math.round(rgb[1] * 255);
  const b = Math.round(rgb[2] * 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}
