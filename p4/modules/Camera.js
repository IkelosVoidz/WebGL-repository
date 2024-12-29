class Camera {
  constructor(gl, canvas) {
    this.gl = gl;
    this.canvas = canvas;
    this.position = [0, 0, 6];
    this.speed = 0.1;
    this.mouseSensitivity = 0.002;
    this.pitch = 0;
    this.yaw = -Math.PI / 2;
    this.mouseActive = false;

    this.initEventListeners();
  }

  initEventListeners() {
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
    this.canvas.addEventListener('mousedown', () => this.onMouseDown());
    this.canvas.addEventListener('mouseup', () => this.onMouseUp());
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => this.onMouseLeave());
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  onKeyDown(event) {
    const front = [
      Math.cos(this.pitch) * Math.cos(this.yaw),
      Math.sin(this.pitch),
      Math.cos(this.pitch) * Math.sin(this.yaw)
    ];
    const right = [-Math.sin(this.yaw), 0, Math.cos(this.yaw)];

    switch (event.key) {
      case 'w':
        this.position[0] += front[0] * this.speed;
        this.position[1] += front[1] * this.speed;
        this.position[2] += front[2] * this.speed;
        break;
      case 's':
        this.position[0] -= front[0] * this.speed;
        this.position[1] -= front[1] * this.speed;
        this.position[2] -= front[2] * this.speed;
        break;
      case 'a':
        this.position[0] -= right[0] * this.speed;
        this.position[1] -= right[1] * this.speed;
        this.position[2] -= right[2] * this.speed;
        break;
      case 'd':
        this.position[0] += right[0] * this.speed;
        this.position[1] += right[1] * this.speed;
        this.position[2] += right[2] * this.speed;
        break;
      case 'ArrowUp':
        this.position[1] += this.speed;
        break;
      case 'ArrowDown':
        this.position[1] -= this.speed;
        break;
    }
  }

  onKeyUp(event) {}

  onMouseDown() {
    this.mouseActive = true;
  }

  onMouseUp() {
    this.mouseActive = false;
  }

  onMouseLeave() {
    this.mouseActive = false;
  }

  onMouseMove(event) {
    if (!this.mouseActive) return;

    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    this.yaw += movementX * this.mouseSensitivity;
    this.pitch -= movementY * this.mouseSensitivity;

    // Limit pitch to prevent flipping
    this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
  }

  getViewMatrix() {
    const viewMatrix = mat4.create();
    const front = [
      Math.cos(this.pitch) * Math.cos(this.yaw),
      Math.sin(this.pitch),
      Math.cos(this.pitch) * Math.sin(this.yaw)
    ];

    const center = [this.position[0] + front[0], this.position[1] + front[1], this.position[2] + front[2]];

    mat4.lookAt(viewMatrix, this.position, center, [0, 1, 0]);

    return viewMatrix;
  }

  getViewTransform() {
    return {
      position: [...this.position],
      rotation: [this.pitch, this.yaw]
    };
  }

  teleport({ position, rotation }) {
    this.position = [...position];
    this.yaw = rotation[1];
    this.pitch = rotation[0];
  }
}

export default Camera;
