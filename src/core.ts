import { getType, isFunction, isObject } from '@/utils'
import { DATE_TYPE, FUN_TYPE, OBJ_TYPE, REG_TYPE } from '@/const'

export function traverseModel<T>(model: T): T {
  // 0, '', undefined, null
  if (!model) return model

  if (
    typeof model === 'string' ||
    typeof model === 'boolean' ||
    typeof model === 'number'
  )
    return model

  const type = getType(model)

  // regexp, function, date
  if ([REG_TYPE, FUN_TYPE, DATE_TYPE].includes(type)) return model

  // array
  if (Array.isArray(model)) {
    return model.map((item) => traverseModel(item)) as T
  }

  if (!isObject(model)) return model

  const result: Record<any, any> = {}

  // object own properties
  const ownProperties = Object.keys(model)

  // exclude actions
  const stateProperties = ownProperties.filter(
    (_) => !isFunction((model as Record<string, any>)[_])
  )

  // 访问器
  const descriptorProperties = Object.keys(
    Object.getOwnPropertyDescriptors(model)
  ).filter((_) => {
    return !ownProperties.includes(_)
  })

  stateProperties.forEach((prop) => {
    result[prop] = traverseModel((model as Record<string, any>)[prop])
  })

  descriptorProperties.forEach((prop) => {
    result[prop] = traverseModel((model as Record<string, any>)[prop])
  })

  return result
}
