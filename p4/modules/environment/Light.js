import { exampleSphere } from '../primitives/primitives.js';

export default class Light {
  constructor(position, la, ld, ls, enabled = true) {
    this.position = position;
    this.la = la;
    this.ld = ld;
    this.ls = ls;
    this.enabled = enabled;
    this.gl = null;
  }

  initBuffers(gl) {
    // Initialize buffers
    this.gl = gl;
    this.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(exampleSphere.vertices), this.gl.STATIC_DRAW);

    this.indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(exampleSphere.indices), this.gl.STATIC_DRAW);

    this.vertexCount = exampleSphere.indices.length;
  }

  toggle() {
    this.enabled = !this.enabled;
  }

  setProperties(la, ld, ls) {
    this.la = la;
    this.ld = ld;
    this.ls = ls;
  }

  getProperties() {
    return [this.enabled, this.la, this.ld, this.ls];
  }

  updateLight() {}

  draw(id, program, viewMatrix, projectionMatrix) {
    const gl = this.gl;

    gl.uniform3fv(gl.getUniformLocation(program, `Lights[${id}].Position`), this.position);
    gl.uniform3fv(gl.getUniformLocation(program, `Lights[${id}].La`), this.la);
    gl.uniform3fv(gl.getUniformLocation(program, `Lights[${id}].Ld`), this.ld);
    gl.uniform3fv(gl.getUniformLocation(program, `Lights[${id}].Ls`), this.ls);
    gl.uniform1i(gl.getUniformLocation(program, `Lights[${id}].enabled`), this.enabled);

    if (this.enabled) {
      const modelMatrix = mat4.create();
      mat4.translate(modelMatrix, modelMatrix, this.position);
      mat4.scale(modelMatrix, modelMatrix, [0.5, 0.5, 0.5]); // Scale down the sphere

      const modelViewMatrix = mat4.create();
      mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);

      const normalMatrix = mat3.create();
      mat3.fromMat4(normalMatrix, modelViewMatrix);
      mat3.invert(normalMatrix, normalMatrix);
      mat3.transpose(normalMatrix, normalMatrix);

      gl.uniformMatrix4fv(gl.getUniformLocation(program, 'projectionMatrix'), false, projectionMatrix);
      gl.uniformMatrix4fv(gl.getUniformLocation(program, 'modelViewMatrix'), false, modelViewMatrix);
      gl.uniformMatrix4fv(gl.getUniformLocation(program, 'modelMatrix'), false, modelMatrix);
      gl.uniformMatrix3fv(gl.getUniformLocation(program, 'normalMatrix'), false, normalMatrix);

      // Bind vertex buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      const vertexPositionAttribute = gl.getAttribLocation(program, 'VertexPosition');
      gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(vertexPositionAttribute);

      // Bind index buffer
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

      // Draw the sphere
      gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_SHORT, 0);
    }
  }
}
