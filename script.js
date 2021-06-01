const canvas = document.getElementById('main-canvas');
canvas.width = 800;
canvas.height = 450;

canvas.style.width = canvas.width;
canvas.style.height = canvas.height;

const ctx = canvas.getContext('2d');

const image = new Image();
image.src = './images/bag.jpg';

image.addEventListener('load', () => {
    console.log(`loading image from ${image.src}`);
    loadImage();
});

loadImage = () => {
    ctx.drawImage(image, 0, 0);
}