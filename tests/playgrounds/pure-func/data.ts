import { observable } from 'mobx'

export const circularReferenceData = observable({
  name: 'foo',
  self: null as any
})

circularReferenceData.self = circularReferenceData
