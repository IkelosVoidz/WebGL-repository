export class RangeController {
    constructor(id, min, max, step = 1) {
        this.range = document.querySelector(`#${id}Range`);
        this.display = document.querySelector(`#${id}Label`);
        this.range.min = min;
        this.range.max = max;
        this.range.step = step;
        this.range.value = (min+max)/2
        this.display.innerText = this.range.value;
        

        this.range.addEventListener('input', ({target}) => {
            this.display.innerText = target.value;
        });
    }
}