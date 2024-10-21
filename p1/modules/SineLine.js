export class SineLine {
  constructor(gl, program , x = 50 , y = 50, width = 20) {
    this.gl = gl;
    this.program = program;
    this.positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    this.resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
    this.colorUniformLocation = gl.getUniformLocation(program, 'u_color');

    this.positionBuffer = gl.createBuffer();
    this.points = 8;
    this.amplitude = 3;
    this.frequency = .8;
    this.x = x;
    this.y = y;
    this.width = width;
    this.updateVertices(0);
  }

  updateLineStats(points, amplitude, frequency) {
    this.points = points;
    this.amplitude = amplitude;
    this.frequency = frequency;
  }

  setPosition(x, y, width) {
    this.x = x;
    this.y = y;
    this.width = width;
  }

  updateVertices(time) {
    const vertices = [];
    for (let i = 0; i < this.points; i++) {
      const x = this.x + (i / (this.points - 1)) * this.width;
      const y = this.y + 
                Math.sin((x * this.frequency + time) * Math.PI * 2) * this.amplitude;
      vertices.push(x, y);
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
  }

  draw(time) {
    this.updateVertices(time);

    this.gl.enableVertexAttribArray(this.positionAttributeLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

    this.gl.uniform2f(this.resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.uniform4f(this.colorUniformLocation, 1, 1, 1, 1); 

    //Line strip , perque nomes volem una linea
    this.gl.drawArrays(this.gl.LINE_STRIP, 0, this.points);
  }
}