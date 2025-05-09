// Get the game canvas and set up the rendering context
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Update the Ground class to use the ground image
class Ground {
    constructor() {
        this.x = 0;
        this.y = canvas.height - 20;
        this.width = canvas.width;
        this.height = 20;
    }

    draw(ctx) {
        ctx.drawImage(sprites.ground, this.x, this.y, this.width, this.height);
    }
}

const ground = new Ground();

// Create the player using the Player class from player.js
const player = new Player(100, ground.y - 40, 40, 40);

let platforms = [];
let collectibles = [];

let score = 0;
let gameSpeed = 2;
const scoreDisplay = document.getElementById('score');
document.getElementById('music-toggle').addEventListener('click', toggleMusic);

const keys = { left: false, right: false, up: false };

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === 'ArrowUp') keys.up = true;
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === 'ArrowUp') keys.up = false;
});

function generatePlatform() {
    let lastPlatform = platforms[platforms.length - 1] || { x: 200, y: canvas.height - 100, width: 200 };
    
    let newX = lastPlatform.x + Math.random() * 200 + 100;
    let newY;

    do {
        newY = canvas.height - Math.random() * 300 - 50;
    } while (Math.abs(newY - lastPlatform.y) < 80);

    let newPlatform = {
        x: newX,
        y: newY,
        width: 150,
        height: 20,
        draw(ctx) {
            ctx.drawImage(sprites.platorm, this.x, this.y, this.width, this.height);
        }
    };
    platforms.push(newPlatform);

    if (Math.random() > 0.5) {
        collectibles.push(new Collectible(newX + 50, newY - 30, 20));
    }
}

for (let i = 0; i < 5; i++) {
    generatePlatform();
}

// Object to store all sprite images
const sprites = {
    player: new Image(),
    platorm: new Image(),
    ground: new Image(),
    background: new Image()
}

// Set the source image for each sprite
sprites.player.src = '../assets/player.png';
sprites.platorm.src = '../assets/platform.png';
sprites.ground.src = '../assets/ground.png';
sprites.background.src = '../assets/background.png';

// Variable to track the number of images loaded
let imagesLoaded = 0;
const totalImages = Object.keys(sprites).length;

// Function to handle image loading
function onImageLoad(){
    imagesLoaded++;
    // Start the game loop only when all images are loaded
    if(imagesLoaded === totalImages){
        gameLoop();
    }
}

// Add load event listeners to each image
for(let key in sprites){
    sprites[key].addEventListener('load', onImageLoad);
    sprites[key].addEventListener('error', 
        () => {
            console.error(`Failed to load image: ${sprites[key].src}`);
        }
    );
}

// Update the gameLoop to render the background
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the background image
    ctx.drawImage(sprites.background, 0, 0, canvas.width, canvas.height);

    platforms.forEach(p => p.x -= gameSpeed);
    collectibles.forEach(c => c.x -= gameSpeed);

    platforms = platforms.filter(p => p.x + p.width > 0);
    collectibles = collectibles.filter(c => c.x > 0);

    if (platforms[platforms.length - 1].x < canvas.width - 200) {
        generatePlatform();
    }

    ground.draw(ctx); // Draw the ground using the ground image

    platforms.forEach(p => p.draw(ctx)); // Use the platform's draw method

    collectibles.forEach(c => {
        if (c.checkCollision(player)) {
            score += 10;
        }
        c.draw(ctx);
    });

    player.update(canvas, platforms, keys);
    player.draw(ctx, sprites);

    scoreDisplay.textContent = `Score: ${score}`;

    requestAnimationFrame(gameLoop);
}

gameLoop();