export class RangeController {
    constructor(id, min, max, step = 1, initialValue) {
        this.range = document.querySelector(`#${id}Range`);
        this.display = document.querySelector(`#${id}Label`);
        this.range.min = min;
        this.range.max = max;
        this.range.step = step;

        if(!initialValue) this.range.value = (min+max)/2
        else this.range.value = initialValue
        this.display.innerText = this.range.value;
        

        this.range.addEventListener('input', ({target}) => {
            this.display.innerText = target.value;
        });

    }

    get value(){
        return this.range.value;
    }
}