export class Star {
  constructor(gl, program, starCount = 100) {
    this.gl = gl;
    this.program = program;
    this.starCount = starCount;

    this.positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    this.resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
    this.colorUniformLocation = gl.getUniformLocation(program, 'u_color');
    
    this.pointSizeUniformLocation = gl.getUniformLocation(program, 'u_pointSize'); 

    this.positionBuffer = gl.createBuffer();
    this.updateVertices();
  }

  updateVertices() {
    const vertices = [];
    for (let i = 0; i < this.starCount; i++) {
      const x = Math.random() * this.gl.canvas.width;
      const y = Math.random() * this.gl.canvas.height;
      vertices.push(x, y);
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
  }

  draw(pointSize = 2.0) {
    this.gl.enableVertexAttribArray(this.positionAttributeLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

    this.gl.uniform2f(this.resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.uniform4f(this.colorUniformLocation, 1, 1, 1, 1);

    this.gl.uniform1f(this.pointSizeUniformLocation, pointSize); 
    this.gl.drawArrays(this.gl.POINTS, 0, this.starCount);
  }
}
