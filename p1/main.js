import { initWebGL , resizeCanvasToDisplaySize } from './webgl.js';
import { createShader, createProgram } from './shaderUtils.js';
import { Circle } from './circle.js';
import { RangeController } from './rangeController.js';

//Globals 
let gl;
let program;
let circle;

function showError(error) {
  const errorContainer = document.getElementById('errorContainer');
  
  errorContainer.innerText = error;
  console.error(error);
}
function initControls(){
  const speedRangeController = new RangeController('speed', 0, 10);
  const scaleRangeController = new RangeController('scale', 0.1, 10 , 0.1);
  const redRangeController = new RangeController('red', 0, 255);
  const greenRangeController = new RangeController('green', 0, 255);
  const blueRangeController = new RangeController('blue', 0, 255);
}
function initGL() {
  const canvas = document.getElementById('glCanvas');
  if(!canvas) throw new Error("Canvas not found - double check that the ID is correct");
  gl = initWebGL(canvas);

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
  resizeCanvasToDisplaySize(gl.canvas);
  gl.clearColor(0.2, 0.2, 0.2, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  circle.draw();

  requestAnimationFrame(render);
}

try {
  initControls();
  initGL();
} catch (error) {
  showError(error);
}