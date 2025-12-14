# Snake Game for Xtron Pro

A classic Snake game built for the Xtron Pro using Microsoft MakeCode Arcade.

## Features

- Classic Snake gameplay
- Score tracking
- Collision detection (walls wrap around)
- Self-collision detection
- Food spawning that avoids snake body

## How to Use

1. Open [MakeCode Arcade](https://arcade.makecode.com/)
2. Click on the "JavaScript" tab at the top
3. Copy the contents of `main.ts` into the editor
4. Click "Download" and select "Xtron Pro" as your hardware
5. Transfer the downloaded file to your Xtron Pro device

## Controls

- **Up Arrow / D-Pad Up**: Move snake up
- **Right Arrow / D-Pad Right**: Move snake right
- **Down Arrow / D-Pad Down**: Move snake down
- **Left Arrow / D-Pad Left**: Move snake left

## Game Rules

- Eat the red food to grow and increase your score
- Avoid colliding with your own body
- The snake wraps around screen edges
- Each food gives you 10 points

## Customization

You can easily customize the game by modifying:

- `GRID_SIZE`: Size of each grid cell (default: 8)
- Game speed: Change `150` in `game.onUpdateInterval(150, ...)` to make it faster (lower number) or slower (higher number)
- Score per food: Change `10` in the score increment line
- Colors: Modify the image literals (`. . 1 1 1 1 . .` for snake, `. . 2 2 2 2 . .` for food)

## Notes

- The game automatically restarts after game over
- The initial snake has 3 segments
- Food spawns randomly but never on the snake's body

