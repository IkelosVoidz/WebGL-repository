import { hexToRgb, rgbToHex } from '../utils.js';

export class LightController {
  constructor(light) {
    this.light = light;
    this.lightToggle = document.querySelector('#lightToggle');
    this.lightToggle.addEventListener('change', () => this.light.toggle());
    this.updateValues();
  }

  switchLight(light) {
    this.light = light;
    this.updateValues();
  }

  updateValues() {
    const enabled = this.light.enabled;
    this.lightToggle.checked = enabled;
  }
}
