

class Camera {
  constructor(canvas, camValues) {
    this.canvas = canvas;
    this.position = camValues.position; 
    this.centre = camValues.centre; 
    this.up = camValues.up; 
    this.fov = camValues.fov;

    this.X = camValues.X;
    this.Y = camValues.Y;
    this.Z = camValues.Z;

    this.speed = 0.25;
    this.mouseSensitivity = 0.005;
    this.isMouseDown = false;

    this.theta = Math.PI;
    this.phi = -Math.PI / 2.0;
 
    this.lastTheta = 0.0;
    this.lastPhi = 0.0;

    this.initEventListeners();
    this.listeners = []; // To hold the event listeners

  }

  onCameraMoved(callback) {
    this.listeners.push(callback);
  }

  dispatchOnMovedEvent() {
    for (let listener of this.listeners) {
      listener(); 
    }
  }
  initEventListeners() {
    document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
    this.canvas.addEventListener('mouseup', () => this.onMouseUp(), false);
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
  }

  calculateNewCentre() {
    const centre = vec3.fromValues(this.centre[0], this.centre[1], this.centre[2]);
    const pos = this.position;
    const radius = vec3.length(vec3.subtract(centre, pos));
    const x = radius * Math.sin(this.phi) * Math.sin(this.theta);
    const y = radius * Math.cos(this.phi);
    const z = radius * Math.sin(this.phi) * Math.cos(this.theta);

    this.centre = [this.position[0] + x, this.position[1] + y, this.position[2] + z];
  }

  onKeyDown(event) {
    
    let update = false;
    switch (event.key.toLowerCase()) {
      case 'w': // Move forward
        this.position[2] -= this.speed;
        this.centre[2] -= this.speed;
        update = true;
        break;
  
      case 's': // Move backward
        this.position[2] += this.speed;
        this.centre[2] += this.speed;
        update = true;
        break;
  
      case 'a': // Move left
        this.position[0] -= this.speed;
        this.centre[0] -= this.speed;
        update = true;
        break;
  
      case 'd': // Move right
        this.position[0] += this.speed;
        this.centre[0] += this.speed;
        update = true;
        break;
  
      case 'arrowup': // Move up
        this.position[1] += this.speed;
        this.centre[1] += this.speed;
        update = true;
        break;
  
      case 'arrowdown': // Move down
        this.position[1] -= this.speed;
        this.centre[1] -= this.speed;
        update = true;
        break;
    }

    event.preventDefault();
    if(update) this.dispatchOnMovedEvent();
  }
  

  onMouseDown(event) {
    this.isMouseDown = true;
    this.lastTheta = event.clientX;
    this.lastPhi = event.clientY;
    event.preventDefault();
  }

  onMouseUp() {
    this.isMouseDown = false;
  }

  onMouseMove(event) {
    if (!this.isMouseDown) return;

    const deltaX = event.clientX - this.lastTheta;
    const deltaY = event.clientY - this.lastPhi;

    this.theta += deltaX * this.mouseSensitivity;
    this.phi -= deltaY * this.mouseSensitivity;

    // Clamp `phi` to avoid flipping over
    const margin = Math.PI / 4;
    this.phi = Math.min(Math.max(this.phi, margin), Math.PI - margin);

    if (this.theta < 0) this.theta += Math.PI * 2;
    if (this.phi < 0) this.phi += Math.PI * 2;

    this.lastPhi = event.clientY;
    this.lastTheta = event.clientX;

    this.calculateNewCentre();
    event.preventDefault();
    this.dispatchOnMovedEvent();
  }

  calculateAxis(){
    this.Z = vec3.normalize(vec3.subtract(this.position, this.centre)); // |O - C|
    this.X = vec3.normalize(vec3.cross(this.up, this.Z)); // |up x Z|
    this.Y = vec3.cross(this.Z, this.X); // Z x X
  }

  getCameraValues() {
    return {
      position: this.position,
      centre: this.centre,
      up: this.up,
      fov: this.fov,
      X: this.X,
      Y: this.Y,
      Z: this.Z
    };
  }

  teleport(position , centre){  
    this.position = position;
    this.centre = centre;

    this.dispatchOnMovedEvent();
  }
}

export default Camera;
