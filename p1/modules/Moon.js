export class Moon {
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

    this.craters = []; 
    this.craterOffsets = []; 
    this.generateCraters(5);
    this.updateVertices();
  }

  generateCraters(count) {
    this.craters = []; 
    this.craterOffsets = []; 
    for (let i = 0; i < count; i++) {
      const craterRadius = Math.random() * 8 + 2; 
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * (this.radius - craterRadius);

      const offsetX = Math.cos(angle) * distance;
      const offsetY = Math.sin(angle) * distance;

      this.craters.push({ radius: craterRadius });
      this.craterOffsets.push({ x: offsetX, y: offsetY }); 
    }
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
    
    this.gl.enableVertexAttribArray(this.positionAttributeLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

    this.gl.uniform2f(this.resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.uniform4f(this.colorUniformLocation, 0.8, 0.8, 0.5, 1);

    this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.segments + 2);

    
    this.craters.forEach((crater, index) => {
      const craterOffset = this.craterOffsets[index];
      this.drawCrater(this.x + craterOffset.x, this.y + craterOffset.y, crater.radius);
    });
  }

  drawCrater(x, y, radius) {
    const craterVertices = [];
    for (let i = 0; i <= this.segments; i++) {
      const angle = (i / this.segments) * Math.PI * 2;
      const craterX = x + Math.cos(angle) * radius;
      const craterY = y + Math.sin(angle) * radius;
      craterVertices.push(craterX, craterY);
    }

    const craterBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, craterBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(craterVertices), this.gl.STATIC_DRAW);
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, craterBuffer);
    this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

   
    this.gl.uniform4f(this.colorUniformLocation, 0.5, 0.5, 0.5, 1);
    this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.segments + 2);
  }
}
