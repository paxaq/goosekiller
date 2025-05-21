console.log("Game loaded");

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state variables
let score = 0;
let playerHealth = 3;
let gameOver = false;

const player = {
    x: 50, // Initial x will be set from initialX
    y: canvas.height - 50, // Initial y will be set from initialY
    width: 50,
    height: 50,
    color: 'blue',
    dx: 5, // displacement in x direction
    speed: 5,
    bullets: [],
    bulletSpeed: 7,
    canShoot: true,
    isDefending: false,
    defenseWidth: 70, // Wider than player
    defenseHeight: 10,
    defenseColor: 'green', // Changed from semi-transparent blue to green
    initialX: 50, // Store initial position for reset
    initialY: canvas.height - 50
};
player.x = player.initialX; // Set current position to initial
player.y = player.initialY; // Set current position to initial

function drawPlayer() {
    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw defense umbrella if active
    if (player.isDefending) {
        ctx.fillStyle = player.defenseColor;
        // Position umbrella above the player
        const umbrellaX = player.x + (player.width - player.defenseWidth) / 2;
        const umbrellaY = player.y - player.defenseHeight - 5; // 5px gap
        ctx.fillRect(umbrellaX, umbrellaY, player.defenseWidth, player.defenseHeight);
    }
}

function createBullet() {
    return {
        x: player.x + player.width / 2 - 2.5, // Center of the player
        y: player.y,
        width: 5,
        height: 10,
    color: 'yellow', // Changed from red to yellow
        dy: player.bulletSpeed
    };
}

function shoot() {
    if (player.canShoot) {
        const bullet = createBullet();
        player.bullets.push(bullet);
        playSound_shoot(); // Play shoot sound
        // Optional: add a cooldown for shooting
        // player.canShoot = false;
        // setTimeout(() => { player.canShoot = true; }, 500); // 0.5 second cooldown
    }
}

function updateBullets() {
    for (let i = player.bullets.length - 1; i >= 0; i--) {
        const bullet = player.bullets[i];
        bullet.y -= bullet.dy;

        // Remove bullets that are off-screen
        if (bullet.y + bullet.height < 0) {
            player.bullets.splice(i, 1);
        }
    }
}

function drawBullets() {
    player.bullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}


// Keyboard event listeners
document.addEventListener('keydown', function(event) {
    if (gameOver) {
        if (event.key === 'r' || event.key === 'R') {
            restartGame();
        }
        return; // Block other input if game is over
    }

    if (event.key === 'ArrowLeft') {
        player.x -= player.speed;
    } else if (event.key === 'ArrowRight') {
        player.x += player.speed;
    } else if (event.key === ' ' || event.code === 'Space') { // Space bar for shooting
        shoot();
    } else if (event.key === 'Shift' || event.key === 'Control') { // Shift or Ctrl for defending
        if (!player.isDefending) { // Play sound only when starting to defend
            playSound_defend();
        }
        player.isDefending = true;
    }

    // Keep player within canvas boundaries
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
});

document.addEventListener('keyup', function(event) {
    if (event.key === 'Shift' || event.key === 'Control') {
        player.isDefending = false;
    }
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    drawPlayer();
    updateBullets(); // Update bullet positions
    drawBullets();   // Draw bullets
    requestAnimationFrame(gameLoop);
}

// --- Geese Implementation ---
const geese = [];
const gooseWidth = 30;
const gooseHeight = 30;
const gooseColor = 'gray'; // Standard goose color
const gooseAttackingColor = 'darkred'; // Changed from orange to darkred
const gooseSpeed = 1;
const gooseHorizontalSpeed = 0.5; // Controls how fast geese track player horizontally
let lastGooseSpawnTime = 0;
const gooseSpawnInterval = 3000; // milliseconds (e.g., 3 seconds)

function spawnGoose() {
    const x = Math.random() * (canvas.width - gooseWidth);
    const y = 0; // Start at the top
    geese.push({ x, y, width: gooseWidth, height: gooseHeight, color: gooseColor, speed: gooseSpeed, isAttacking: false });
}

function updateGeese(currentTime) {
    // Spawn new geese periodically
    if (!gameOver && currentTime - lastGooseSpawnTime > gooseSpawnInterval) {
        spawnGoose();
        lastGooseSpawnTime = currentTime;
    }

    // Update positions and remove off-screen geese
    for (let i = geese.length - 1; i >= 0; i--) {
        const goose = geese[i];
        goose.y += goose.speed;

        // Move goose towards player's x position
        const dx = player.x + player.width / 2 - (goose.x + goose.width / 2); // Difference in x
        goose.x += Math.sign(dx) * Math.min(Math.abs(dx) * 0.02, gooseHorizontalSpeed); // Gradual move, capped by gooseHorizontalSpeed


        // Check for "attack" condition
        if (!goose.isAttacking && goose.y + goose.height >= player.y) {
            goose.isAttacking = true;
            goose.color = gooseAttackingColor; // Change color
            console.log("Goose is attacking the player's y-level!");
        }

        if (goose.y > canvas.height) {
            geese.splice(i, 1); // Remove goose if it goes off bottom screen
        }
    }
}

function drawGeese() {
    geese.forEach(goose => {
        ctx.fillStyle = goose.isAttacking ? gooseAttackingColor : goose.color;
        ctx.fillRect(goose.x, goose.y, goose.width, goose.height);
    });
}

// --- UI Drawing Functions ---
function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 25);
}

function drawHealth() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Health: ' + playerHealth, canvas.width - 100, 25);
}

function drawGameOverScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'; // Semi-transparent black background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);

    ctx.font = '24px Arial';
    ctx.fillText('Final Score: ' + score, canvas.width / 2, canvas.height / 2);

    ctx.font = '20px Arial';
    ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 50);
    ctx.textAlign = 'left'; // Reset alignment
}

// --- Modify Game Loop ---
function gameLoop(currentTime) { // Pass currentTime for spawn logic
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameOver) {
        drawGameOverScreen();
    } else {
        drawPlayer();
        updateBullets();
        drawBullets();

        updateGeese(currentTime); // Pass currentTime
        drawGeese();

        checkCollisions();

        drawScore();
        drawHealth();

        // Check for game over condition (moved here from checkCollisions for clarity)
        if (playerHealth <= 0) {
            gameOver = true;
            console.log("Game Over! Final Score: " + score);
        }
    }
    requestAnimationFrame(gameLoop);
}

// --- Collision Detection ---
function rectsOverlap(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function checkCollisions() {
    // Player bullets vs. Geese
    for (let i = player.bullets.length - 1; i >= 0; i--) {
        if (!player.bullets[i]) continue; // Bullet might have been removed
        for (let j = geese.length - 1; j >= 0; j--) {
            if (!geese[j]) continue; // Goose might have been removed

            const bullet = player.bullets[i];
            const goose = geese[j];

            if (rectsOverlap(bullet, goose)) {
                player.bullets.splice(i, 1);
                geese.splice(j, 1);
                score += 10; // Increment score
                playSound_gooseHit(); // Play goose hit sound
                // console.log("Goose hit by bullet! Score: " + score);
                break; // Bullet hits only one goose
            }
        }
    }

    // Geese vs. Player - only if game is not over
    if (gameOver) return;

    for (let i = geese.length - 1; i >= 0; i--) {
        if (!geese[i]) continue; // Goose might have been removed
        const goose = geese[i];

        if (rectsOverlap(goose, player)) {
            if (player.isDefending) {
                const umbrellaRect = {
                    x: player.x + (player.width - player.defenseWidth) / 2,
                    y: player.y - player.defenseHeight - 5,
                    width: player.defenseWidth,
                    height: player.defenseHeight
                };
                if (rectsOverlap(goose, umbrellaRect)) {
                    geese.splice(i, 1);
                    // playSound_defend(); // Or a specific "deflected" sound
                    console.log("Goose deflected by umbrella!");
                } else { // Hit player body while defending (e.g. from side)
                    playerHealth--;
                    geese.splice(i, 1);
                    playSound_playerHit(); // Play player hit sound
                    console.log("Player hit by goose (body collision while defending)! Health: " + playerHealth);
                }
            } else { // Not defending
                playerHealth--;
                geese.splice(i, 1);
                playSound_playerHit(); // Play player hit sound
                console.log("Player hit by goose! Health: " + playerHealth);
            }
            // Game over check is now in gameLoop, so no need to set gameOver flag here
        }
    }
}


// Start the game loop
gameLoop(0); // Initialize with currentTime = 0


// --- Sound Placeholder Functions ---
function playSound_shoot() {
    console.log("Sound: shoot");
}

function playSound_defend() {
    console.log("Sound: defend");
}

function playSound_gooseHit() {
    console.log("Sound: gooseHit");
}

function playSound_playerHit() {
    console.log("Sound: playerHit");
}
