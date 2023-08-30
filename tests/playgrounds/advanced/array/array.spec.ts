import path from 'path'
import simulate from 'miniprogram-simulate'
import { arrayStore } from '@tests/playgrounds/basic/stores/array.store'
import { getRandomTitle } from '@tests/utils'

describe('array', () => {
  let id: string

  beforeAll(() => {
    id = simulate.load(path.resolve(__dirname, './index'))
    wx.nextTick = (cb) => cb()
  })

  test('array render', () => {
    const container = simulate.render(id)

    const parent = document.createElement('parent-wrapper')
    container.attach(parent)

    const snapshot = container.toJSON()

    const list = snapshot.children[0]

    expect(list.children.length).toEqual(arrayStore.todos.length)

    // not done
    expect(list.children[0].children.length).toEqual(1)
    // done
    expect(list.children[1].children.length).toEqual(2)

    container.detach()
  })

  test('array add item', () => {
    const container = simulate.render(id)

    const parent = document.createElement('parent-wrapper')
    container.attach(parent)

    const instance = container.instance

    const title = getRandomTitle()

    instance.addTodo({
      title,
      done: false
    })

    const snapshot = container.toJSON()

    const list = snapshot.children[0]

    expect(list.children.length).toEqual(3)

    expect(list.children[2].children.length).toEqual(1)

    instance.markFinish(title)

    const _snapshot = container.toJSON()

    expect(_snapshot.children[0].children[2].children.length).toEqual(2)

    container.detach()
  })

  test('multi describer', () => {
    const container = simulate.render(id)

    const parent = document.createElement('parent-wrapper')
    container.attach(parent)

    const snapshot = container.toJSON()

    const extra = snapshot.children[1]

    expect(extra.children[1].children[0]).toEqual('3')

    const instance = container.instance

    instance.addTodo({
      title: getRandomTitle(),
      done: false
    })

    const _snapshot = container.toJSON()

    expect(_snapshot.children[1].children[1].children[0]).toEqual('4')

    container.detach()
  })

  test('async update', async () => {
    const container = simulate.render(id)

    const parent = document.createElement('parent-wrapper')
    container.attach(parent)

    const instance = container.instance

    await instance.addTodoAsync({
      title: getRandomTitle(),
      done: false
    })

    const snapshot = container.toJSON()

    expect(snapshot.children[0].children.length).toEqual(5)

    container.detach()
  })
})
