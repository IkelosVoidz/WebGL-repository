export function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const compileError =  gl.getShaderInfoLog(shader);
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