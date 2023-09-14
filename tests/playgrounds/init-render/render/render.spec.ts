import path from 'path'
import simulate from 'miniprogram-simulate'

describe('basic', () => {
  let id: string

  beforeAll(() => {
    id = simulate.load(path.resolve(__dirname, './index'))
  })

  test('state', () => {
    const container = simulate.render(id)

    const parent = document.createElement('parent-wrapper')
    container.attach(parent)

    const snapshot = container.toJSON()
    expect(snapshot.children[0]?.children[0]).toEqual('hello')
    container.detach()
  })
})
