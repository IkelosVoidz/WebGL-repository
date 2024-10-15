import { initWebGL } from './webgl.js';
import { createShader, createProgram } from './shaderUtils.js';
import { Circle } from './circle.js';

let gl;
let program;
let circle;

function init() {
  const canvas = document.getElementById('glCanvas');
  gl = initWebGL(canvas);

  if (!gl) {
    console.error('Unable to initialize WebGL. Your browser may not support it.');
    return;
  }

  const vertexShaderSource = `
    attribute vec2 a_position;
    uniform vec2 u_resolution;

    void main() {
      vec2 zeroToOne = a_position / u_resolution;
      vec2 zeroToTwo = zeroToOne * 2.0;
      vec2 clipSpace = zeroToTwo - 1.0;
      gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    }
  `;

  const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 u_color;

    void main() {
      gl_FragColor = u_color;
    }
  `;

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  program = createProgram(gl, vertexShader, fragmentShader);

  circle = new Circle(gl, program);

  canvas.addEventListener('mousemove', (event) => {
    circle.setPosition(event.clientX, event.clientY);
  });

  requestAnimationFrame(render);
}

function render() {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  circle.draw();

  requestAnimationFrame(render);
}

init();