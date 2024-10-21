export class Ocean {
    constructor(gl, program) {
      this.gl = gl;
      this.program = program;
      this.positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
      this.resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
      this.colorAttributeLocation = gl.getAttribLocation(program, 'a_color');
  
      this.positionBuffer = gl.createBuffer();
      this.colorBuffer = gl.createBuffer();
  
      //valors modificables
      this.points = 15; 
      this.amplitude = 10;
      this.frequency = 0.3;
      this.offset = 0; 
    }

    updateLineStats(points, amplitude, frequency) {
      this.points = points;
      this.amplitude = amplitude;
      this.frequency = frequency;
    }

    setYOffset(offset) {
      this.offset = offset;
    }
  
    updateVertices(time) {
      const vertices = [];
      const colors = []; 

      //colors del mar
      const topColor = [0.0, 0.4, 0.8, 1.0]; 
      const bottomColor = [0.0, 0.0, 0.5, 1.0];
  
     
      for (let i = 0; i < this.points; i++) {
        const x = (i / (this.points - 1)) * this.gl.canvas.width;
  
        const y = this.gl.canvas.height / 2 - this.offset + //Per calcular la "marea"
                  Math.sin((x * this.frequency + time) * Math.PI * 2) * this.amplitude;
  
        vertices.push(x, y);
        colors.push(...topColor);
  
        vertices.push(x, this.gl.canvas.height);
        colors.push(...bottomColor); 
      }
  
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
  
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
    }
  
    draw(time) {
      this.updateVertices(time);
    
      this.gl.enableVertexAttribArray(this.positionAttributeLocation);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
      this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
  
      this.gl.enableVertexAttribArray(this.colorAttributeLocation);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
      this.gl.vertexAttribPointer(this.colorAttributeLocation, 4, this.gl.FLOAT, false, 0, 0);
    
      this.gl.uniform2f(this.resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height);
      this.gl.uniform4f(this.gl.getUniformLocation(this.program, 'u_color'), 0.0, 0.0, 0.0, 0.0); //Posem aixo a 0 per dirli al fragment shader que volem usar vertex color
    
      //Triangle strip perque volem animar nomes la part superior del poligon
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.points * 2);
    }
    
  }
  