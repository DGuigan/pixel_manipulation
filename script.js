const canvas = document.getElementById('main-canvas');
canvas.width = 800;
canvas.height = 450;

const ctx = canvas.getContext('2d');

const image = new Image();
image.src = './images/hand.jpg';

let pixelDataGrid = [];

let particleCount = 10000;
let particleArray = [];

const speedSlider = document.getElementById('speed');
const freezeBtn = document.getElementById('freeze-btn');

const redSlider = document.getElementById('red');
const greenSlider = document.getElementById('green');
const blueSlider = document.getElementById('blue');
const resetColourBtn = document.getElementById('reset-colour-btn');

const angleSlider = document.getElementById('angle');
const resetAngleBtn = document.getElementById('reset-angle-btn');

const linearBtn = document.getElementById('linear-btn');
const circularBtn = document.getElementById('circular-btn');

const circle = {
    active: false,
    x: Math.floor(canvas.width / 2),
    y: Math.floor(canvas.height / 2),
};

class Particle {
    constructor() {
        this.y = Math.random() * canvas.height;
        this.x = Math.random() * canvas.width;
        this.size = Math.random() * 1.5 + 1;
    }

    update() {
        if (circle.active) {
            [this.x, this.y] = this.circlePath();
        }
        else {
            // have to check for stray particles moved by circle mode
            if (this.isOOB()) {
                this.y = Math.random() * canvas.height;
                this.x = Math.random() * canvas.width;
            }
            
            const speed = (1 - pixelDataGrid[Math.floor(this.y)][Math.floor(this.x)].brt) * speedSlider.value;
            const radianAngle = (angleSlider.value * Math.PI) / 180;

            this.y += speed * -Math.cos(radianAngle);
            this.x += speed * Math.sin(radianAngle);

            if (this.isOOB()) {
                this.y = Math.random() * canvas.height;
                this.x = Math.random() * canvas.width;
            }
        }  
    }

    draw() {
        if (!circle.active || (circle.active && !this.isOOB())){
            ctx.beginPath();
            ctx.fillStyle = this.getColour();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }  
    }

    isOOB() {
        return (this.x < 0 || this.x >= canvas.width) || (this.y < 0 || this.y >= canvas.height);
    }

    getColour() {

        const pixel = pixelDataGrid[Math.floor(this.y)][Math.floor(this.x)];
        
        const rmod = parseInt(redSlider.value) / 100;
        const gmod = parseInt(greenSlider.value) / 100;
        const bmod = parseInt(blueSlider.value) / 100;

        return `rgb(${this.calculateColourValue(pixel.r, rmod)}, ${this.calculateColourValue(pixel.g, gmod)}, ${this.calculateColourValue(pixel.b, bmod)})`;
    }

    calculateColourValue(original, mod, scale=255) {
        return (original + (mod * (mod >= 0 ? scale - original : original)));
    }

    circlePath() {
        const currentAngle = radToDeg(Math.atan2(this.y - circle.y, this.x - circle.x));
        let newAngle;
        try {
            newAngle = degToRad((currentAngle + ((1 - pixelDataGrid[Math.floor(this.y)][Math.floor(this.x)].brt) * speedSlider.value)) % 360);
        }
        catch (error) {
            newAngle = degToRad((currentAngle + (2 * speedSlider.value)) % 360);
        }
        const radius = Math.sqrt((circle.x - this.x)**2  + (circle.y - this.y)**2);
        const newX = (radius * Math.cos(newAngle)) + circle.x;
        const newY = (radius * Math.sin(newAngle)) + circle.y;
        return [newX, newY];
    }
}

degToRad = (deg) => {
    return (deg * Math.PI) / 180;
}

radToDeg = (rad) => {
    return (rad * 180) / Math.PI;
}

loadImage = (callback) => {
    ctx.drawImage(image, 0, 0);
    pixelDataGrid = [];
    const pixelArray = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let y = 0; y < canvas.height; y++) {
        row = [];
        for (let x = 0; x < canvas.width; x++) {
            const red = pixelArray[(y * 4 * canvas.width) + (x * 4)];
            const green = pixelArray[(y * 4 * canvas.width) + (x * 4 + 1)];
            const blue = pixelArray[(y * 4 * canvas.width) + (x * 4 + 2)];
            const alpha = pixelArray[(y * 4 * canvas.width) + (x * 4 + 3)];
            const brightness = (red + green + blue) / 765;

            const cell = {
                r: red, g: green, b: blue, a: alpha, brt: brightness
            };

            row.push(cell);
        }
        pixelDataGrid.push(row);
    }
    callback();
}

createParticles = (callback) => {
    for (let i = 0; i < particleCount; i++) {
        particleArray.push(new Particle());
    }
    callback();
}

animateParticles = () => {
    // repeatedly drawing transparent rectangle gives illusion of trails
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.globalAlpha = 0.2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (particle of particleArray) {
        particle.update();
        particle.draw();
    }
    requestAnimationFrame(animateParticles);
}

freezeBtn.addEventListener('click', (event) => {
    event.preventDefault();
    speedSlider.value = 0;
});

resetColourBtn.addEventListener('click', (event) => {
    event.preventDefault();
    redSlider.value = 0;
    greenSlider.value = 0;
    blueSlider.value = 0;
});

resetAngleBtn.addEventListener('click', (event) => {
    event.preventDefault();
    angleSlider.value = 180;
});

linearBtn.addEventListener('click', (event) => {
    event.preventDefault();
    if (circle.active) {
        circle.active = false;
    }
})

circularBtn.addEventListener('click', (event) => {
    event.preventDefault();
    if (!circle.active) {
        circle.active = true;
    }
})

image.addEventListener('load', () => {
    console.log(`loading image from ${image.src}`);
    loadImage( () => {
        createParticles( () => {
            animateParticles()
        })
    })
});
