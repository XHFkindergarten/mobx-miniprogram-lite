Page({
  gotoGamePage() {
    wx.navigateTo({
      url: '/pages/game/game',
    });
  },

  gotoTodoPage() {
    wx.navigateTo({
      url: '/pages/todo/todo',
    });
  },
});
