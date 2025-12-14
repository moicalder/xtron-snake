// Snake Game for Xtron Pro
// MakeCode Arcade

// Game variables
let snake: Sprite[] = []
let food: Sprite = null
let direction = 0 // 0=up, 1=right, 2=down, 3=left
let nextDirection = 0
let score = 0
let gameRunning = false

// Game settings
const GRID_SIZE = 8
const GRID_WIDTH = Math.floor(scene.screenWidth() / GRID_SIZE)
const GRID_HEIGHT = Math.floor(scene.screenHeight() / GRID_SIZE)

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
    
    // Find a position not occupied by snake
    while (!validPosition && attempts < MAX_ATTEMPTS) {
        attempts++
        // Generate random position aligned to grid
        foodX = Math.floor(Math.random() * GRID_WIDTH) * GRID_SIZE + GRID_SIZE / 2
        foodY = Math.floor(Math.random() * GRID_HEIGHT) * GRID_SIZE + GRID_SIZE / 2
        
        // Ensure position is within screen bounds
        if (foodX < GRID_SIZE / 2) foodX = GRID_SIZE / 2
        if (foodX >= scene.screenWidth() - GRID_SIZE / 2) foodX = scene.screenWidth() - GRID_SIZE / 2
        if (foodY < GRID_SIZE / 2) foodY = GRID_SIZE / 2
        if (foodY >= scene.screenHeight() - GRID_SIZE / 2) foodY = scene.screenHeight() - GRID_SIZE / 2
        
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

// Move snake
function moveSnake() {
    if (!gameRunning) return
    
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
    
    // Check wall collision - game over if hit wall
    if (newX < GRID_SIZE / 2 || newX >= scene.screenWidth() - GRID_SIZE / 2 ||
        newY < GRID_SIZE / 2 || newY >= scene.screenHeight() - GRID_SIZE / 2) {
        gameOver()
        return
    }
    
    // Check collision with self (check before creating new head)
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
    let newHead = sprites.create(img`
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
        . . 1 1 . . . .
        . . 1 1 . . . .
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
    `, SpriteKind.Player)
    newHead.x = newX
    newHead.y = newY
    snake.unshift(newHead)
    
    // Check if food eaten using distance check
    let foodDx = Math.abs(newHead.x - food.x)
    let foodDy = Math.abs(newHead.y - food.y)
    if (foodDx < GRID_SIZE && foodDy < GRID_SIZE) {
        score += 10
        info.setScore(score)
        spawnFood()
        music.playTone(Note.C, 100)
    } else {
        // Remove tail
        let tail = snake.pop()
        tail.destroy()
    }
}

// Game over
function gameOver() {
    gameRunning = false
    game.splash("Game Over!", "Score: " + score)
    pause(1000)
    initGame()
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

// Start game
initGame()

// Game loop - move snake every 150ms
game.onUpdateInterval(150, function () {
    moveSnake()
})

