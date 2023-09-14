import path from 'path'
import simulate from 'miniprogram-simulate'
import { getRandomTitle } from '@tests/utils'
import { extendsStore } from '@tests/stores/extends.store'

describe('extends', () => {
  let id: string

  beforeAll(() => {
    id = simulate.load(path.resolve(__dirname, './index'))
    wx.nextTick = (cb) => cb()
  })

  test('update parent data', () => {
    const container = simulate.render(id)

    const parent = document.createElement('parent-wrapper')
    container.attach(parent)

    const list = container.toJSON().children.map((item) => item.children[0])

    expect(list[0]).toEqual(extendsStore.hyperValue.toString())
    expect(list[1]).toEqual(extendsStore.doubleHyperValue.toString())
    expect(list[2]).toEqual(extendsStore.superValue.toString())
    expect(list[3]).toEqual(extendsStore.doubleSuperValue.toString())
    expect(list[4]).toEqual(extendsStore.decHyperValue.toString())
    expect(list[5]).toEqual(extendsStore.decDoubleHyperValue.toString())
    expect(list[6]).toEqual(extendsStore.value.toString())
    expect(list[7]).toEqual(extendsStore.doubleValue.toString())

    const instance = container.instance

    instance.updateHyperValue()

    const list1 = container.toJSON().children.map((item) => item.children[0])

    expect(list1[0]).toEqual(extendsStore.hyperValue.toString())
    expect(list1[1]).toEqual(extendsStore.doubleHyperValue.toString())
    expect(list1[2]).toEqual(extendsStore.superValue.toString())
    expect(list1[3]).toEqual(extendsStore.doubleSuperValue.toString())
    expect(list1[4]).toEqual(extendsStore.decHyperValue.toString())
    expect(list1[5]).toEqual(extendsStore.decDoubleHyperValue.toString())
    expect(list1[6]).toEqual(extendsStore.value.toString())
    expect(list1[7]).toEqual(extendsStore.doubleValue.toString())

    instance.updateSuperValue()

    const list2 = container.toJSON().children.map((item) => item.children[0])

    expect(list2[0]).toEqual(extendsStore.hyperValue.toString())
    expect(list2[1]).toEqual(extendsStore.doubleHyperValue.toString())
    expect(list2[2]).toEqual(extendsStore.superValue.toString())
    expect(list2[3]).toEqual(extendsStore.doubleSuperValue.toString())
    expect(list2[4]).toEqual(extendsStore.decHyperValue.toString())
    expect(list2[5]).toEqual(extendsStore.decDoubleHyperValue.toString())
    expect(list2[6]).toEqual(extendsStore.value.toString())
    expect(list2[7]).toEqual(extendsStore.doubleValue.toString())

    instance.updateValue()

    const list3 = container.toJSON().children.map((item) => item.children[0])

    expect(list3[0]).toEqual(extendsStore.hyperValue.toString())
    expect(list3[1]).toEqual(extendsStore.doubleHyperValue.toString())
    expect(list3[2]).toEqual(extendsStore.superValue.toString())
    expect(list3[3]).toEqual(extendsStore.doubleSuperValue.toString())
    expect(list3[4]).toEqual(extendsStore.decHyperValue.toString())
    expect(list3[5]).toEqual(extendsStore.decDoubleHyperValue.toString())
    expect(list3[6]).toEqual(extendsStore.value.toString())
    expect(list3[7]).toEqual(extendsStore.doubleValue.toString())

    container.detach()
  })
})
