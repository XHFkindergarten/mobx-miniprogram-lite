import '@tests/utils/mock-page'
import path from 'path'
import simulate from 'miniprogram-simulate'

describe('basic components', () => {
  let id: string

  beforeAll(() => {
    id = simulate.load(path.resolve(__dirname, './index'))
    wx.nextTick = (cb) => cb()
  })

  test('state', () => {
    const container = simulate.render(id)

    const parent = document.createElement('parent-wrapper')
    container.attach(parent)

    const snapshot = container.toJSON()

    // test render

    expect(snapshot.children[0].children[0]).toEqual('0')
    expect(snapshot.children[1].children[0]).toEqual('0')

    const addBtn = container.querySelector('.add')

    expect(addBtn).not.toBeFalsy()

    container.instance.addValue()

    const _snapshot = container.toJSON()

    expect(_snapshot.children[0].children[0]).toEqual('1')
    expect(_snapshot.children[1].children[0]).toEqual('2')

    container.detach()
  })
})
