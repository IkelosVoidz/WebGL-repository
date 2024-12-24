import { hexToRgb, rgbToHex } from '../shaderUtils.js';

export class LightController {
  constructor(light) {
    this.light = light;
    this.lightToggle = document.querySelector('#lightToggle');
    this.ambientColor = document.querySelector('#ambientColor');
    this.diffuseColor = document.querySelector('#diffuseColor');
    this.specularColor = document.querySelector('#specularColor');

    this.lightToggle.addEventListener('change', () => this.light.toggle());
    this.ambientColor.addEventListener('input', this.updateLight.bind(this));
    this.diffuseColor.addEventListener('input', this.updateLight.bind(this));
    this.specularColor.addEventListener('input', this.updateLight.bind(this));

    this.updateValues();
  }

  switchLight(light) {
    this.light = light;
    this.updateValues();
  }

  updateValues() {
    const [enabled, la, ld, ls] = this.light.getProperties();
    this.lightToggle.checked = enabled;
    this.ambientColor.value = rgbToHex(la);
    this.diffuseColor.value = rgbToHex(ld);
    this.specularColor.value = rgbToHex(ls);
  }

  updateLight() {
    const la = hexToRgb(this.ambientColor.value);
    const ld = hexToRgb(this.diffuseColor.value);
    const ls = hexToRgb(this.specularColor.value);
    this.light.setProperties(la, ld, ls);
  }
}
