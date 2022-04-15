# Conway`s Game of Life in React

This project is a representation of Conway's the Game of Life. You can check the project running at https://3nvy.github.io/gameoflife/

## Game Rules
Any live cell with fewer than two live neighbours dies, as if by underpopulation.

Any live cell with two or three live neighbours lives on to the next generation.

Any live cell with more than three live neighbours dies, as if by overpopulation.

Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

## Infinite Canvas

By making use of an infinite canvas, you can create complex patterns and let them run indefinitely w/t being bound to a finite space.

## Controls

`Mouse Right-Click` - Adds/Removes cells
`Mouse Left-Click-Drag` - Moves around the canvas offset
`Zoom Slider` - Controls the canvas zoom level
`Speed Slider` - Controls the speed at which the game is played
`Start/Stop button` - Controls the game active status
`Load Patter` - Loads a pre-defined pattern into the board (WIP) 

## Tech Stack

React

Redux-toolkit