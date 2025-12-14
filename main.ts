// Snake Game for Xtron Pro
// MakeCode Arcade

// Game variables
let snake: Sprite[] = []
let food: Sprite = null
let greenApple: Sprite = null
let direction = 0 // 0=up, 1=right, 2=down, 3=left
let nextDirection = 0
let score = 0
let gameRunning = false
let wallInvincibleUntil = 0
let isWallInvincible = false
let isRainbowMode = false
let greenAppleSpawnTime = 0
let gameState = "splash" // "splash" or "playing"

// Game settings
const GRID_SIZE = 8
const GRID_WIDTH = Math.floor(scene.screenWidth() / GRID_SIZE)
const GRID_HEIGHT = Math.floor(scene.screenHeight() / GRID_SIZE)

// Show splash screen
function showSplashScreen() {
    gameState = "splash"
    // Set background to loading screen
    scene.setBackgroundImage(assets.image`loadingScreen`)
    // Clear any existing sprites
    sprites.destroyAllSpritesOfKind(SpriteKind.Player)
    sprites.destroyAllSpritesOfKind(SpriteKind.Food)
    // Display "Press A to start" text
    let startText = textsprite.create("Press A to start")
    startText.setPosition(80, 100)
}

// Start the actual game
function startGame() {
    gameState = "playing"
    // Reset background to default (black)
    scene.setBackgroundColor(0)
    // Clear any text sprites from splash screen
    sprites.destroyAllSpritesOfKind(SpriteKind.Text)
    initGame()
}

// Initialize game
function initGame() {
    // Clear previous game state - destroy all existing sprites
    for (let segment of snake) {
        if (segment) {
            segment.destroy()
        }
    }
    if (food) {
        food.destroy()
    }
    if (greenApple) {
        greenApple.destroy()
    }
    
    // Clear all sprites of these kinds (safety measure)
    sprites.allOfKind(SpriteKind.Player).forEach(function(sprite) {
        sprite.destroy()
    })
    sprites.allOfKind(SpriteKind.Food).forEach(function(sprite) {
        sprite.destroy()
    })
    
    // Reset game variables
    snake = []
    direction = 0
    nextDirection = 0
    score = 0
    gameRunning = true
    wallInvincibleUntil = 0
    isWallInvincible = false
    isRainbowMode = false
    greenAppleSpawnTime = game.runtime() + (30000 + Math.random() * 15000) // 30-45 seconds
    
    // Create initial snake (3 segments)
    for (let i = 0; i < 3; i++) {
        let segment = sprites.create(img`
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
            . . 1 1 . . . .
            . . 1 1 . . . .
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
        `, SpriteKind.Player)
        segment.x = scene.screenWidth() / 2
        segment.y = scene.screenHeight() / 2 + (i * GRID_SIZE)
        snake.push(segment)
    }
    
    // Create food
    spawnFood()
    
    // Display score
    info.setScore(0)
    info.setLife(1)
}

// Spawn food at random location
function spawnFood() {
    if (food) {
        food.destroy()
        food = null
    }
    
    let foodX: number = 0
    let foodY: number = 0
    let validPosition = false
    let attempts = 0
    const MAX_ATTEMPTS = 100
    
    // Find a position not occupied by snake, biased toward center
    while (!validPosition && attempts < MAX_ATTEMPTS) {
        attempts++
        // Generate random position aligned to grid, biased toward center (60% of screen width/height)
        const centerX = scene.screenWidth() / 2
        const centerY = scene.screenHeight() / 2
        const spawnWidth = scene.screenWidth() * 0.6
        const spawnHeight = scene.screenHeight() * 0.6
        
        foodX = centerX + (Math.random() - 0.5) * spawnWidth
        foodY = centerY + (Math.random() - 0.5) * spawnHeight
        
        // Align to grid
        foodX = Math.floor(foodX / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2
        foodY = Math.floor(foodY / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2
        
        // Ensure position is within screen bounds
        const SPRITE_HALF_SIZE = 4
        if (foodX < SPRITE_HALF_SIZE) foodX = SPRITE_HALF_SIZE
        if (foodX >= scene.screenWidth() - SPRITE_HALF_SIZE) foodX = scene.screenWidth() - SPRITE_HALF_SIZE
        if (foodY < SPRITE_HALF_SIZE) foodY = SPRITE_HALF_SIZE
        if (foodY >= scene.screenHeight() - SPRITE_HALF_SIZE) foodY = scene.screenHeight() - SPRITE_HALF_SIZE
        
        validPosition = true
        
        // Check if position overlaps with snake using distance check
        for (let segment of snake) {
            let dx = Math.abs(segment.x - foodX)
            let dy = Math.abs(segment.y - foodY)
            // Check if too close (within GRID_SIZE distance)
            if (dx < GRID_SIZE && dy < GRID_SIZE) {
                validPosition = false
                break
            }
        }
    }
    
    // Create food sprite
    food = sprites.create(img`
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
        . . 2 2 . . . .
        . . 2 2 . . . .
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
    `, SpriteKind.Food)
    food.x = foodX
    food.y = foodY
}

// Spawn green apple at random location
function spawnGreenApple() {
    if (greenApple) {
        greenApple.destroy()
        greenApple = null
    }
    
    let appleX: number = 0
    let appleY: number = 0
    let validPosition = false
    let attempts = 0
    const MAX_ATTEMPTS = 100
    
    // Find a position not occupied by snake or regular food, biased toward center
    while (!validPosition && attempts < MAX_ATTEMPTS) {
        attempts++
        // Generate random position aligned to grid, biased toward center (60% of screen width/height)
        const centerX = scene.screenWidth() / 2
        const centerY = scene.screenHeight() / 2
        const spawnWidth = scene.screenWidth() * 0.6
        const spawnHeight = scene.screenHeight() * 0.6
        
        appleX = centerX + (Math.random() - 0.5) * spawnWidth
        appleY = centerY + (Math.random() - 0.5) * spawnHeight
        
        // Align to grid
        appleX = Math.floor(appleX / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2
        appleY = Math.floor(appleY / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2
        
        // Ensure position is within screen bounds
        const SPRITE_HALF_SIZE = 4
        if (appleX < SPRITE_HALF_SIZE) appleX = SPRITE_HALF_SIZE
        if (appleX >= scene.screenWidth() - SPRITE_HALF_SIZE) appleX = scene.screenWidth() - SPRITE_HALF_SIZE
        if (appleY < SPRITE_HALF_SIZE) appleY = SPRITE_HALF_SIZE
        if (appleY >= scene.screenHeight() - SPRITE_HALF_SIZE) appleY = scene.screenHeight() - SPRITE_HALF_SIZE
        
        validPosition = true
        
        // Check if position overlaps with snake
        for (let segment of snake) {
            let dx = Math.abs(segment.x - appleX)
            let dy = Math.abs(segment.y - appleY)
            if (dx < GRID_SIZE && dy < GRID_SIZE) {
                validPosition = false
                break
            }
        }
        
        // Check if position overlaps with regular food
        if (food && Math.abs(food.x - appleX) < GRID_SIZE && Math.abs(food.y - appleY) < GRID_SIZE) {
            validPosition = false
        }
    }
    
    // Create green apple sprite
    greenApple = sprites.create(img`
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
        . . 7 7 . . . .
        . . 7 7 . . . .
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
    `, SpriteKind.Food)
    greenApple.x = appleX
    greenApple.y = appleY
}

// Update snake to rainbow colors
function updateSnakeRainbow() {
    if (!isRainbowMode) return
    
    let colorIndex = 0
    const rainbowColors = [2, 3, 4, 5, 6, 7, 8, 9] // Red, Orange, Yellow, Green, Blue, Indigo, Violet, Pink
    
    for (let segment of snake) {
        let color = rainbowColors[colorIndex % rainbowColors.length]
        // Create rainbow-colored sprite
        let rainbowImg = image.create(8, 8)
        rainbowImg.fill(color)
        rainbowImg.replace(color, 0)
        rainbowImg.drawRect(2, 3, 2, 2, color)
        segment.setImage(rainbowImg)
        colorIndex++
    }
}

// Move snake
function moveSnake() {
    if (!gameRunning || gameState !== "playing") return
    
    // Update direction (can't reverse)
    if (nextDirection == 0 && direction != 2) direction = 0
    else if (nextDirection == 1 && direction != 3) direction = 1
    else if (nextDirection == 2 && direction != 0) direction = 2
    else if (nextDirection == 3 && direction != 1) direction = 3
    
    // Calculate new head position
    let head = snake[0]
    let newX = head.x
    let newY = head.y
    
    if (direction == 0) newY -= GRID_SIZE // Up
    else if (direction == 1) newX += GRID_SIZE // Right
    else if (direction == 2) newY += GRID_SIZE // Down
    else if (direction == 3) newX -= GRID_SIZE // Left
    
    // Check wall collision - game over if hit wall (unless invincible)
    // Sprite is 8x8, so it extends 4 pixels from center. Allow it to reach the very edge.
    const SPRITE_HALF_SIZE = 4
    
    // Check for wall collision
    const outOfBounds = newX < SPRITE_HALF_SIZE || newX >= scene.screenWidth() - SPRITE_HALF_SIZE ||
                        newY < SPRITE_HALF_SIZE || newY >= scene.screenHeight() - SPRITE_HALF_SIZE

    if (outOfBounds) {
        if (isWallInvincible) {
            // Wrap around if invincible to walls - place just inside the boundary
            if (newX < SPRITE_HALF_SIZE) newX = scene.screenWidth() - SPRITE_HALF_SIZE - 1
            if (newX >= scene.screenWidth() - SPRITE_HALF_SIZE) newX = SPRITE_HALF_SIZE + 1
            if (newY < SPRITE_HALF_SIZE) newY = scene.screenHeight() - SPRITE_HALF_SIZE - 1
            if (newY >= scene.screenHeight() - SPRITE_HALF_SIZE) newY = SPRITE_HALF_SIZE + 1
        } else {
            // Die if not invincible
            gameOver()
            return
        }
    }
    
    // Check collision with self (always check - no invincibility)
    for (let segment of snake) {
        // Calculate distance to check overlap
        let dx = Math.abs(segment.x - newX)
        let dy = Math.abs(segment.y - newY)
        if (dx < GRID_SIZE && dy < GRID_SIZE) {
            gameOver()
            return
        }
    }
    
    // Create new head
    let headImage = null
    if (isRainbowMode) {
        // Create rainbow head
        headImage = image.create(8, 8)
        headImage.fill(0)
        headImage.drawRect(2, 3, 2, 2, 2) // Red for head
    } else {
        headImage = img`
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
            . . 1 1 . . . .
            . . 1 1 . . . .
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
        `
    }
    
    let newHead = sprites.create(headImage, SpriteKind.Player)
    newHead.x = newX
    newHead.y = newY
    snake.unshift(newHead)
    
    // Check if regular food eaten using distance check
    let foodDx = Math.abs(newHead.x - food.x)
    let foodDy = Math.abs(newHead.y - food.y)
    let foodEaten = false
    
    if (foodDx < GRID_SIZE && foodDy < GRID_SIZE) {
        score += 10
        info.setScore(score)
        spawnFood()
        music.playTone(Note.C, 100)
        foodEaten = true
    }
    
    // Check if green apple eaten
    let greenAppleEaten = false
    if (greenApple && !foodEaten) {
        let appleDx = Math.abs(newHead.x - greenApple.x)
        let appleDy = Math.abs(newHead.y - greenApple.y)
            if (appleDx < GRID_SIZE && appleDy < GRID_SIZE) {
                // Activate rainbow mode and wall invincibility (doesn't make snake grow)
                isRainbowMode = true
                isWallInvincible = true
                // Set invincibility to 10 seconds
                wallInvincibleUntil = game.runtime() + 10000 // 10 seconds
                greenApple.destroy()
                greenApple = null
                greenAppleSpawnTime = game.runtime() + (30000 + Math.random() * 15000) // Schedule next spawn
                music.playTone(Note.E, 200)
                updateSnakeRainbow()
                greenAppleEaten = true
            }
    }
    
    // Remove tail only if regular food wasn't eaten (green apples don't make snake grow)
    if (!foodEaten) {
        let tail = snake.pop()
        tail.destroy()
    }
    
    // Update rainbow colors if in rainbow mode
    if (isRainbowMode) {
        updateSnakeRainbow()
    }
}

// Game over
function gameOver() {
    gameRunning = false
    game.splash("Game Over!", "Score: " + score)
    pause(1000)
    showSplashScreen()
}

// Input handling
controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    nextDirection = 0
})

controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    nextDirection = 1
})

controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    nextDirection = 2
})

controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    nextDirection = 3
})

// A button handler for splash screen
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (gameState === "splash") {
        startGame()
    }
})

// Start with splash screen
showSplashScreen()

// Game loop - move snake every 150ms
game.onUpdateInterval(150, function () {
    if (gameState === "playing") {
        moveSnake()
    }
})

// Check for green apple spawn timer
game.onUpdateInterval(1000, function () {
    if (!gameRunning || gameState !== "playing") return
    
    // Check if it's time to spawn green apple
    if (game.runtime() >= greenAppleSpawnTime && !greenApple) {
        spawnGreenApple()
        greenAppleSpawnTime = game.runtime() + (30000 + Math.random() * 15000) // Schedule next spawn
    }
    
    // Check if wall invincibility expired
    const currentTime = game.runtime()
    if (isWallInvincible && currentTime >= wallInvincibleUntil && wallInvincibleUntil > 0) {
        isWallInvincible = false
        isRainbowMode = false
        wallInvincibleUntil = 0
        // Revert snake to normal colors
        for (let segment of snake) {
            segment.setImage(img`
                . . . . . . . .
                . . . . . . . .
                . . . . . . . .
                . . 1 1 . . . .
                . . 1 1 . . . .
                . . . . . . . .
                . . . . . . . .
                . . . . . . . .
            `)
        }
    }
})

