export default class Light {
  constructor({ position, color, enabled = true}) {
    this._position = position;
    this._color = color;
    this._enabled = enabled;
  }

  toggle() {
    this._enabled = !this._enabled;
  }

  get position() {
    return this._position;
  }

  get color() {
    return this._color;
  }

  get enabled() {
    return this._enabled;
  }

  set position(value) {
    this._position = value;
  }

  set color(value) {
    this._color = value;
  }

  set enabled(value) {
    this._enabled = value;
  }
}