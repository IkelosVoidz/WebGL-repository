import { initWebGL, resizeCanvasToDisplaySize } from './webgl.js';
import {
  createShader,
  createProgram,
  initBuffers,
  loadTexture,
  setShaderNormalMatrix,
  getNormalMatrix,
  setShaderMaterial
} from './shaderUtils.js';
import { LightController } from './modules/lightController.js';
import Camera from './modules/Camera.js';
import Light from './modules/environment/Light.js';
import { Bronze, randomMaterial } from './modules/primitives/materials.js';
import { createWall, createStand, createCustom3DModel } from './modules/environment/environment.js';
import { transform } from './modules/mat-utils.js';
import { RangeController } from './modules/rangeController.js';

//Globals
let gl;
let program;
let camera;
let lights = [
  new Light([10.0, 7.0, 0.0], [1.0, 0.4, 0.4], [0.8, 0.8, 0.8], [0.5, 0.5, 0.5]),
  new Light([-10.0, 7.0, 0.0], [0.4, 1.0, 0.4], [0.7, 0.7, 0.7], [0.6, 0.6, 0.6]),
  new Light([0.0, 7.0, 10.0], [0.4, 0.4, 1.0], [0.6, 0.6, 0.6], [0.7, 0.7, 0.7])
];
const sceneObjects = [];
const lightSelector = document.getElementById('lightSelect');
const controllers = [];

function showError(error) {
  const errorContainer = document.getElementById('errorContainer');
  errorContainer.style.display = 'block';

  errorContainer.innerText = error;
  console.error(error);
}

async function createEnvironment() {
  sceneObjects.push(createWall([0.0, -1.5, 8.5], [20.0, 1.0, 8.0], 'Floor'));
  sceneObjects.push(createWall([12.5, 3.5, 8.5], [1.0, 10.0, 8.0], 'Left_Wall', Math.PI / 2.0, [0.0, 0.0, 1.0]));
  sceneObjects.push(createWall([-12.5, 3.5, 8.5], [1.0, 10.0, 8.0], 'Right_Wall', -Math.PI / 2.0, [0.0, 0.0, 1.0]));
  sceneObjects.push(createWall([0.0, 8.5, 8.5], [20.0, 1.0, 8.0], 'Roof', Math.PI, [1.0, 0.0, 0.0]));
  sceneObjects.push(createWall([0.0, 3.5, 20.0], [20.0, 10.0, 1.0], 'Front_Wall', -Math.PI / 2.0, [1.0, 0.0, 0.0]));
  sceneObjects.push(createWall([0.0, 3.5, -3.0], [20.0, 10.0, 1.0], 'Back_Wall', Math.PI / 2.0, [1.0, 0.0, 0.0]));

  var matStand = { ...Bronze };
  const standPositions = [
    [-7.5, -0.94, 1.0],
    [-2.5, -0.94, 1.0],
    [2.5, -0.94, 1.0],
    [7.5, -0.94, 1.0],
    [-7.5, -0.94, 6.0],
    [-2.5, -0.94, 6.0],
    [2.5, -0.94, 6.0],
    [7.5, -0.94, 6.0],
    [-7.5, -0.94, 11.0],
    [-2.5, -0.94, 11.0],
    [2.5, -0.94, 11.0],
    [7.5, -0.94, 11.0],
    [-7.5, -0.94, 16.0],
    [-2.5, -0.94, 16.0],
    [2.5, -0.94, 16.0],
    [7.5, -0.94, 16.0]
  ];

  standPositions.forEach((position, index) => {
    sceneObjects.push(createStand(position, matStand, `Stand_${index + 1}`));
  });

  const usedPositions = new Set();
  const getRandomPosition = () => {
    let position;
    do {
      position = standPositions[Math.floor(Math.random() * standPositions.length)];
    } while (usedPositions.has(position));
    usedPositions.add(position);
    return [position[0], .3 , position[2]];
  }

  const weapons = [
    { model: axe1, name: 'axe1', position: getRandomPosition(), rotation: [Math.PI, Math.random() * 2 * Math.PI, Math.PI / 4] },
    { model: axe2, name: 'axe2', position: getRandomPosition(), rotation: [Math.PI, Math.random() * 2 * Math.PI, Math.PI / 4] },
    { model: axe3, name: 'axe3', position: getRandomPosition(), rotation: [Math.PI, Math.random() * 2 * Math.PI, Math.PI / 4] },
    { model: bow, name: 'bow', position: getRandomPosition(), rotation: [0, Math.random() * 2 * Math.PI, Math.PI / 4] },
    { model: dagger, name: 'dagger', position: getRandomPosition(), rotation: [Math.PI, Math.random() * 2 * Math.PI, Math.PI / 4] },
    { model: hammer, name: 'hammer', position: getRandomPosition(), rotation: [Math.PI, Math.random() * 2 * Math.PI, Math.PI / 4] },
    { model: mace, name: 'mace', position: getRandomPosition(), rotation: [Math.PI, Math.random() * 2 * Math.PI, Math.PI / 4] },
    { model: spear, name: 'spear', position: getRandomPosition(), rotation: [0, Math.random() * 2 * Math.PI, Math.PI / 4] },
    { model: sword1, name: 'sword1', position: getRandomPosition(), rotation: [Math.PI, Math.random() * 2 * Math.PI, Math.PI / 4] },
    { model: sword2, name: 'sword2', position: getRandomPosition(), rotation: [Math.PI, Math.random() * 2 * Math.PI, Math.PI / 4] },
    { model: sword3, name: 'sword3', position: getRandomPosition(), rotation: [Math.PI, Math.random() * 2 * Math.PI, Math.PI / 4] },
    { model: sword4, name: 'sword4', position: getRandomPosition(), rotation: [Math.PI, Math.random() * 2 * Math.PI, Math.PI / 4] }
  ];

  weapons.forEach((weapon) => {
    const obj = createCustom3DModel(weapon.model, weapon.position, [0.5, 0.5, 0.5], randomMaterial(), weapon.name, weapon.rotation);
    obj.movable = true;
    obj.initialLocation = weapon.position;
    obj.initialRotation = weapon.rotation;
    sceneObjects.push(obj);
  });

  for (const obj of sceneObjects) {
    initBuffers(gl, obj);
    await loadTexture(gl, obj);
  }
}

function initControls() {
  lights.forEach((light, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.text = `Light ${i + 1}`;
    lightSelector.appendChild(opt);
  });
  lightSelector.selectedIndex = 0;

  controllers['light'] = new LightController(lights[0]);

  lightSelector.onchange = () => {
    controllers['light'].switchLight(lights[lightSelector.selectedIndex]);
  };

  controllers['speed'] =  new RangeController('speed', 0.1, 2.0, 0.1, 0.2);

}

function initShaders(vertexShaderSource, fragmentShaderSource) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  program = createProgram(gl, vertexShader, fragmentShader);

  gl.useProgram(program);

  program.vertexPositionAttribute = gl.getAttribLocation(program, 'VertexPosition');
  gl.enableVertexAttribArray(program.vertexPositionAttribute);

  program.modelViewMatrixIndex = gl.getUniformLocation(program, 'modelViewMatrix');
  program.modelMatrixIndex = gl.getUniformLocation(program, 'modelMatrix');
  program.projectionMatrixIndex = gl.getUniformLocation(program, 'projectionMatrix');

  // coordenadas de textura
  program.vertexTexcoordsAttribute = gl.getAttribLocation(program, 'VertexTexcoords');
  gl.enableVertexAttribArray(program.vertexTexcoordsAttribute);
  program.myTextureIndex = gl.getUniformLocation(program, 'myTexture');
  program.repetition = gl.getUniformLocation(program, 'repetition');
  gl.uniform1i(program.myTextureIndex, 3);
  gl.uniform1f(program.repetition, 1.0);

  // normales
  program.vertexNormalAttribute = gl.getAttribLocation(program, 'VertexNormal');
  program.normalMatrixIndex = gl.getUniformLocation(program, 'normalMatrix');
  gl.enableVertexAttribArray(program.vertexNormalAttribute);

  // material
  program.KaIndex = gl.getUniformLocation(program, 'Material.Ka');
  program.KdIndex = gl.getUniformLocation(program, 'Material.Kd');
  program.KsIndex = gl.getUniformLocation(program, 'Material.Ks');
  program.alphaIndex = gl.getUniformLocation(program, 'Material.alpha');

  // uniforms needed for texture flags
  program.allowTextureIndex = gl.getUniformLocation(program, 'allowTexture');
  program.proceduralIndex = gl.getUniformLocation(program, 'proceduralTexture');
  program.useToonShadingIndex = gl.getUniformLocation(program, 'useToonShading');

  program.ScaleIndex = gl.getUniformLocation(program, 'Scale');
  program.ThresholdIndex = gl.getUniformLocation(program, 'Threshold');

  gl.uniform2f(program.ScaleIndex, 9.0, 9.0);
  gl.uniform2f(program.ThresholdIndex, 0.3, 0.3);
  gl.uniform1f(program.allowTextureIndex, 1.0);
  gl.uniform1i(program.proceduralIndex, false);
  gl.uniform1i(program.useToonShadingIndex, false);
}

let useToonShading = false;

function toggleToonShading() {
  useToonShading = !useToonShading;
  gl.uniform1i(program.useToonShadingIndex, useToonShading);
}

document.getElementById('toonShadingToggle').addEventListener('click', toggleToonShading);


function initGL() {
  const canvas = document.getElementById('glCanvas');
  if (!canvas) throw new Error('Canvas not found - double check that the ID is correct');

  gl = initWebGL(canvas);
  gl.enable(gl.DEPTH_TEST);

  camera = new Camera(gl, canvas);

  const vertexShaderSource = `#version 300 es
    uniform mat4 projectionMatrix, modelViewMatrix, modelMatrix;
    uniform mat3 normalMatrix;
    
    in vec3 VertexPosition;
    in vec3 VertexNormal;
    in vec2 VertexTexcoords;
    
    out vec3 N, ec1, ec2;
    out vec2 texCoords;

    void main () {
      N = normalize (normalMatrix * VertexNormal);
      vec4 ecPosition = modelMatrix * vec4(VertexPosition, 1.0);
      vec4 ecPosition2 = modelViewMatrix * vec4(VertexPosition, 1.0);
      ec1 = vec3(ecPosition);
      ec2 = vec3(ecPosition2);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(VertexPosition, 1.0);
      
      texCoords = VertexTexcoords;
    }
  `;

  
  const fragmentShaderSource = `#version 300 es
    precision mediump float;
    uniform float allowTexture;
    uniform bool proceduralTexture;
    uniform bool useToonShading;

    struct LightData {
      vec3 Position; // Posición en coordenadas del ojo
      vec3 La;       // Ambiente
      vec3 Ld;       // Difusa
      vec3 Ls;       // Especular
      bool enabled; 
    };
    uniform LightData Lights[3];

    struct MaterialData {
      vec3 Ka;       // Ambiente
      vec3 Kd;       // Difusa
      vec3 Ks;       // Especular
      float alpha;   // Brillo
    };
    uniform MaterialData Material;
    
    vec3 phong (vec3 N, vec3 L, vec3 V, LightData light) {

      vec3  ambient  = Material.Ka * light.La;
      vec3  diffuse  = vec3(0.0);
      vec3  specular = vec3(0.0);

      float NdotL    = dot (N,L);

      if (NdotL > 0.0) {
        vec3  R       = reflect(-L, N);
        float RdotV_n = pow(max(0.0, dot(R,V)), Material.alpha);
        
        diffuse  = NdotL   * (light.Ld * Material.Kd);
        specular = RdotV_n * (light.Ls * Material.Ks);
      }

      return (ambient + diffuse + specular);

    }
    
    vec3 toonShading (vec3 N, vec3 L) {
      float NdotL = max(0.0, dot(N, L));
      float levels = 4.0; // Number of quantization levels
      float quantized = floor(NdotL * levels) / levels;
      return vec3(quantized);
    }
    
    uniform vec2 Scale;
    uniform vec2 Threshold;
    
    uniform sampler2D myTexture;
    uniform float repetition;
    
    in vec3 N, ec1, ec2;
    in vec2 texCoords;
    
    out vec4 fragmentColor;
    
    void main () {
    
      if (proceduralTexture == true) {
        float ss = fract(texCoords.s * Scale.s);
        float tt = fract(texCoords.t * Scale.t);

        if ((ss > Threshold.s) && (tt > Threshold.t))
          discard;
      }

      vec3 color = vec3(0.0);
      vec3 n = normalize(N);
      vec3 V = normalize(-ec1);

      if (useToonShading) {
        vec3 L = normalize(Lights[0].Position - ec1); 
        color = toonShading(n, L);
      } else {
        for (int i = 0; i < 3; i++) {
          if (Lights[i].enabled) {
            vec3 L = normalize(Lights[i].Position - ec1);
            color += phong(n, L, V, Lights[i]);
          }
        }
      }

      if (allowTexture == 1.0) {
        fragmentColor = texture(myTexture, texCoords * repetition) * vec4(color, 1.0) * 0.9;
      } else {
        fragmentColor = vec4(color, 1.0) * 0.9;
      }
    }
 `;

  initShaders(vertexShaderSource, fragmentShaderSource);

  gl.clearColor(0.3, 0.3, 0.3, 1.0);
  gl.lineWidth(1.5);

  // Initialize lights
  lights.forEach((light) => light.initBuffers(gl));

  createEnvironment().then(() => {
    requestAnimationFrame(render);
  });
}

function drawObject(gl, program, model, viewMatrix, projectionMatrix) {
  gl.uniform1i(program.proceduralIndex, model.procedural);

  //Pass the vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, model.idTex);
  gl.vertexAttribPointer(program.vertexTexcoordsAttribute, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, model.idNormals);
  gl.vertexAttribPointer(program.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix4fv(program.projectionMatrixIndex, false, projectionMatrix);
  gl.uniformMatrix4fv(program.modelMatrixIndex, false, model.modelMatrix);
  var result = mat4.create();
  mat4.multiply(result, viewMatrix, model.modelMatrix);
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, result);

  setShaderNormalMatrix(gl, program, getNormalMatrix(model.modelMatrix));

  setShaderMaterial(gl, program, model.material);

  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, model.texture);

  //We draw through indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
}

function animateObject(obj, time) {
  const speed = 0.5; // Speed of the sinusoidal movement
  const amplitude = 0.1; // Amplitude of the sinusoidal movement
  const rotationSpeed = .5; // Speed of the yaw rotation

  const yOffset = amplitude * Math.sin(time * speed);
  const yawRotation = obj.initialRotation[1] + time * rotationSpeed;

  const newLocation = [obj.initialLocation[0], obj.initialLocation[1] + yOffset, obj.initialLocation[2]];
  const newRotation = [obj.initialRotation[0], yawRotation, obj.initialRotation[2]];

  transform(obj, newLocation, newRotation, [0.5, 0.5, 0.5]);
}

function render() {
  resizeCanvasToDisplaySize(gl.canvas);

  gl.clearColor(0.3, 0.3, 0.3, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  const time = performance.now() * 0.001;
  const viewMatrix = camera.getViewMatrix();
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, Math.PI / 4, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 100.0);

  camera.setSpeed(parseFloat(controllers['speed'].value));

  for (const obj of sceneObjects) {
    if(obj.movable){
      animateObject(obj, time);
    }

    drawObject(gl, program, obj, viewMatrix, projectionMatrix);
  }

  lights.forEach((light, id) => {
    light.draw(id, program, viewMatrix, projectionMatrix);
  });

  requestAnimationFrame(render);
}

try {
  initControls();
  initGL();
} catch (error) {
  showError(error);
}
