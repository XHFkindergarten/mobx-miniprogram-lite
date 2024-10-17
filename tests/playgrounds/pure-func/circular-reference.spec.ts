import { traverseModel } from '@/traverse'
import { circularReferenceData } from './data'

describe('circular-reference data', () => {
  test('self reference', async () => {
    const data = circularReferenceData

    const task = Promise.race([
      traverseModel(data),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 300)
      )
    ])

    await expect(task).resolves.not.toThrow()

    const res: any = await task

    expect(res).toEqual(res.self)

    expect(res.name).toEqual(res.name)
  })
})
