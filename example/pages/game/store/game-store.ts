import { makeAutoObservable } from '@tencent/mobx-miniprogram-lite'
import { Game } from '../models/snake-game/game'
import { Snake } from '../models/snake-game/snake'

class GameStore {
  game: Game
  snake: Snake
  constructor() {
    this.game = new Game({
      onTick: () => {
        // 同步【模型数据】到【view data】
        for (let i = 0; i < this.game.size; i++) {
          for (let j = 0; j < this.game.size; j++) {
            this.data.map[i][j] = this.game.map[i][j]
          }
        }
      }
    })
    this.snake = this.game.snake

    this.data = {
      map: this.game.map,
      paused: false,
      highSpeed: false
    }
    makeAutoObservable(this)
  }

  data

  start() {
    this.game.start()
  }

  stop() {
    this.game.stop()
  }

  turnUp() {
    this.snake.turnUp()
  }

  turnRight() {
    this.snake.turnRight()
  }

  turnDown() {
    this.snake.turnDown()
  }

  turnLeft() {
    this.snake.turnLeft()
  }

  pauseOrPlay = () => {
    if (this.game.paused) {
      this.game.play()
      this.data.paused = false
    } else {
      this.game.pause()
      this.data.paused = true
    }
  }

  reset() {
    this.game.reset()
  }

  toggleSpeed() {
    this.game.toggleSpeed()
    this.data.highSpeed = !this.data.highSpeed
  }
}

export const gameStore = new GameStore()
