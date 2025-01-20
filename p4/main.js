import { LightController } from './modules/lightController.js';
import { RangeController } from './modules/rangeController.js';

import { Screen, Scene } from './modules/environment/scene.js'; //This will form the scene 
import  Camera  from './modules/Camera.js';
import { resizeCanvasToDisplaySize } from './utils.js';
import { updateRaytracing } from './raytracing.js';

//Globals

let camera;
let initialized = false;

const lightSelector = document.getElementById('lightSelect');

const poiSelector = document.getElementById('poiSelect');
const goToPoiBtn = document.getElementById('goToPoiBtn');
const savePoiBtn = document.getElementById('savePoiBtn');

const posInfo = document.getElementById('cameraPosition');
const centerInfo = document.getElementById('cameraCenter');

const startButton = document.getElementById('startBtn');

const controllers = [];



function showError(error) {
  const errorContainer = document.getElementById('errorContainer');
  errorContainer.style.display = 'block';

  errorContainer.innerText = error;
  console.error(error);
}
function initControls() {
  Scene.Lights.forEach((light, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.text = `Light ${i + 1}`;
    lightSelector.appendChild(opt);
  });
  lightSelector.selectedIndex = 0;

  Scene.POIs.forEach((poi, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.text = `POI ${i + 1}`;
    poiSelector.appendChild(opt);
  });

  goToPoiBtn.onclick = () => {
    const selectedPOI = Scene.POIs[poiSelector.selectedIndex];
    camera.teleport(selectedPOI.position , selectedPOI.centre);
  };

  savePoiBtn.onclick = () => {

    const { position , centre } = camera.getCameraValues();
    Scene.POIs.push({
      position, centre
    });
    const i = Scene.POIs.length - 1;

    const opt = document.createElement('option');
    opt.value = i;
    opt.text = `POI ${i + 1}`;
    poiSelector.appendChild(opt);
  };

  controllers['light'] = new LightController(Scene.Lights[0]);

  lightSelector.onchange = () => {
    controllers['light'].switchLight(Scene.Lights[lightSelector.selectedIndex]);
  };
  
  controllers['reflections'] = new RangeController('reflections', 0, 4, 1, 2);

  controllers['reflections'].onch

  startButton.onclick = () => {
    Scene.Bounces = controllers['reflections'].value;
   if(!initialized) initScene();
   else{
     updateRaytracing(Scene, Screen, camera);
   } 
  };
}

// Inicialitzem el RayTracing

function initScene() {
  
  Screen.canvas = document.getElementById('glcanvas');
  if (Screen.canvas == null) {
    alert('Invalid element');
    return;
  }
  Screen.context = Screen.canvas.getContext('2d');
  if (Screen.context == null) {
    alert('Could not get context');
    return;
  }

  resizeCanvasToDisplaySize(Screen.canvas);

  Screen.width = Screen.canvas.width;
  Screen.height = Screen.canvas.height;
  Screen.buffer = Screen.context.createImageData(Screen.width, Screen.height);

  camera = new Camera(Screen.canvas , Scene.Camera);

  const updateCamInfo = () => {
    const {position , centre} = camera.getCameraValues();
    posInfo.innerText = `[${position[0].toFixed(2)},${position[1].toFixed(2)}, ${position[2].toFixed(2)}]`;
    centerInfo.innerText = `[${centre[0].toFixed(2)},${centre[1].toFixed(2)}, ${centre[2].toFixed(2)}]`;
  };

  updateCamInfo();

  camera.onCameraMoved(() => updateCamInfo());
    
  initialized = true;
  updateRaytracing(Scene  , Screen ,  camera );
}

try {
  initControls();
} catch (error) {
  showError(error);
}
