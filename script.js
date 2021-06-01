const canvas = document.getElementById('main-canvas');
canvas.width = 800;
canvas.height = 450;

canvas.style.width = canvas.width;
canvas.style.height = canvas.height;

const ctx = canvas.getContext('2d');

const image = new Image();
image.src = './images/hand.jpg';

let pixelDataGrid = [];

let particleCount = 10000;
let particleArray = [];

const speedSlider = document.getElementById('speed');

const redSlider = document.getElementById('red');
const greenSlider = document.getElementById('green');
const blueSlider = document.getElementById('blue');

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = 0;
        this.size = Math.random() * 1.5 + 1;
    }

    update() {
        this.y += (1 - pixelDataGrid[Math.floor(this.y)][Math.floor(this.x)].brt) * speedSlider.value;

        if (this.y >= canvas.height) {
            this.y = 0;
            this.x = Math.random() * canvas.width;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.getColour();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
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

image.addEventListener('load', () => {
    console.log(`loading image from ${image.src}`);
    loadImage( () => {
        createParticles( () => {
            animateParticles()
        })
    })
});
