import { connectPage } from "mobx-miniprogram-lite";
import { gameStore } from "./store/game-store";

connectPage({
  store: {
    game: gameStore
  },
  onLoad() {
    gameStore.start();
  },
  onHide() {
    gameStore.stop();
  },
  onUnload() {
    gameStore.stop();
  },
  turnUp() {
    gameStore.turnUp();
  },
  turnDown() {
    gameStore.turnDown();
  },
  turnLeft() {
    gameStore.turnLeft();
  },
  turnRight() {
    gameStore.turnRight();
  },
  toggleSpeed() {
    gameStore.toggleSpeed();
  },
  reset() {
    gameStore.reset();
  },
  pauseOrPlay() {
    gameStore.pauseOrPlay();
  },
  back() {
    wx.navigateBack()
  }
});
