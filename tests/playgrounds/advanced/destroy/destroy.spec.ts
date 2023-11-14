import path from 'path'
import simulate from 'miniprogram-simulate'
import { countStore } from './counter'

describe('destroy', () => {
  let id: string

  beforeAll(() => {
    id = simulate.load(path.resolve(__dirname, './index'))
    wx.nextTick = (cb) => cb()
  })

  test('update parent data', () => {
    const container = simulate.render(id)

    const parent = document.createElement('parent-wrapper')
    container.attach(parent)

    let schema = container.toJSON()
    expect(schema.children[0].children[0].children[0]).toEqual('0')
    expect(schema.children[1].children[0].children[0]).toEqual('0')

    container.instance.addValue()
    container.instance.addValue()

    schema = container.toJSON()
    expect(schema.children[0].children[0].children[0]).toEqual('2')
    expect(schema.children[1].children[0].children[0]).toEqual('2')

    container.instance.toggleShowMulti()
    container.instance.addValue()

    schema = container.toJSON()
    expect(schema.children.length).toEqual(3)
    expect(schema.children[0].children[0].children[0]).toEqual('3')
  })
})
