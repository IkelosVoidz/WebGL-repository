export class Circle {
  constructor(gl, program) {
    this.gl = gl;
    this.program = program;
    this.positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    this.resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
    this.colorUniformLocation = gl.getUniformLocation(program, 'u_color');

    this.positionBuffer = gl.createBuffer();
    this.x = 100;
    this.y = 100;
    this.radius = 50;
    this.segments = 32;

    this.updateVertices();
  }

  updateVertices() {
    const vertices = [];
    for (let i = 0; i <= this.segments; i++) {
      const angle = (i / this.segments) * Math.PI * 2;
      const x = this.x + Math.cos(angle) * this.radius;
      const y = this.y + Math.sin(angle) * this.radius;
      vertices.push(x, y);
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.updateVertices();
  }

  draw() {
    this.gl.useProgram(this.program);

    this.gl.enableVertexAttribArray(this.positionAttributeLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

    this.gl.uniform2f(this.resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.uniform4f(this.colorUniformLocation, 1, 0, 0, 1);

    this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.segments + 2);
  }
}