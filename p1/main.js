import { initWebGL , resizeCanvasToDisplaySize } from './webgl.js';
import { createShader, createProgram } from './shaderUtils.js';
import { Moon } from './modules/Moon.js';
import { RangeController } from './modules/rangeController.js';
import { SineLine } from './modules/SineLine.js';
import { Star } from './modules/stars.js';
import { Ocean } from './modules/Ocean.js';


//Globals 
let gl;
let program;
let moon;
let ocean;
let stars;
let lines = [];



const controllers = [];

function gradientColor(startColor, endColor, value) {
    const r = startColor[0] + (endColor[0] - startColor[0]) * value;
    const g = startColor[1] + (endColor[1] - startColor[1]) * value;
    const b = startColor[2] + (endColor[2] - startColor[2]) * value;
    return [r, g, b];
}

function showError(error) {
  const errorContainer = document.getElementById('errorContainer');
  
  errorContainer.innerText = error;
  console.error(error);
}
function initControls(){
 
  controllers['tide'] = new RangeController('tide', -250, 250, 1,-90);
  controllers['points'] = new RangeController('points', 0, 150 , 64);
  controllers['amplitude'] = new RangeController('amplitude', 0, 100 , 1, 20);
  controllers['frequency'] = new RangeController('frequency', 0, 1 , 0.01, .5);

  controllers['size'] = new RangeController('size', 0, 10 , .1, 2);
  controllers['gradient'] = new RangeController('gradient', 0, 100, .1, 50);

  document.querySelector('#resetButton').addEventListener('click', () => {
    stars.updateVertices();
  });
}
function initGL() {
  const canvas = document.getElementById('glCanvas');
  if(!canvas) throw new Error("Canvas not found - double check that the ID is correct");
  gl = initWebGL(canvas);

  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec4 a_color;  
    uniform float u_pointSize; 

    uniform vec2 u_resolution;
    varying vec4 v_color; 

    void main() {
      vec2 zeroToOne = a_position / u_resolution;
      vec2 zeroToTwo = zeroToOne * 2.0;
      vec2 clipSpace = zeroToTwo - 1.0;
      
      gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
      
      v_color = a_color; 
      gl_PointSize = u_pointSize; 
    }
  `;



  const fragmentShaderSource = `
    precision mediump float;

    varying vec4 v_color;  
    uniform vec4 u_color;  

    void main() {
      if (u_color.a > 0.0) {
         //usem un flat color si el uniform que ens passen esta tot a 0
        gl_FragColor = u_color;
      } else {
       //si no, agafem el vertex color 
        gl_FragColor = v_color;
      }
    }
  `;

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  program = createProgram(gl, vertexShader, fragmentShader);

  moon = new Moon(gl, program);
  ocean = new Ocean(gl , program);
  stars = new Star(gl, program, 200);
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * 880 + 20;
    const y = Math.random() * 100 + 450;
    lines.push(new SineLine(gl, program, x, y, 200));
  }

  //Posem la lluna en el nostre cursor, perque? Doncs no ho se la veritat, aixi queda xulo
  canvas.addEventListener('mousemove', (event) => {
    moon.setPosition(event.clientX, event.clientY);
  });

  gl.useProgram(program);
  requestAnimationFrame(render);
}

function render() {
  resizeCanvasToDisplaySize(gl.canvas);
  const dayColor = [0.7, 0.7, 0.7];
  const nightColor = [0.039, 0.039, 0.157];
  const color = gradientColor(nightColor, dayColor, controllers['gradient'].value / 100)
  gl.clearColor(color[0], color[1], color[2], 1.0);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  const time = performance.now() * 0.001;

  stars.draw(controllers['size'].value);  
  moon.draw();
  ocean.setYOffset(controllers['tide'].value);
  ocean.updateLineStats(controllers['points'].value, controllers['amplitude'].value, controllers['frequency'].value);
  ocean.draw(time);
  

  lines.forEach(line => {
    line.draw(time);
  });

  requestAnimationFrame(render);
}

try {
  initControls();
  initGL();
} catch (error) {
  showError(error);
}