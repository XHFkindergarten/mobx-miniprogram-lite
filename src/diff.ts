import { FUN_TYPE, OBJ_TYPE, ARR_TYPE } from './const'

export function diffData(current: any, previous: any) {
  const result = {}
  syncKeys(current, previous)
  _diff(current, previous, '', result)
  return result
}

function syncKeys(current: any, previous: any) {
  if (current === previous) return
  const rootCurrentType = getType(current)
  const rootPreType = getType(previous)
  if (rootCurrentType == OBJ_TYPE && rootPreType == OBJ_TYPE) {
    for (let key in previous) {
      const currentValue = current[key]
      if (currentValue === undefined) {
        current[key] = null
      } else {
        syncKeys(currentValue, previous[key])
      }
    }
  } else if (rootCurrentType == ARR_TYPE && rootPreType == ARR_TYPE) {
    if (current.length >= previous.length) {
      previous.forEach((item: any, index: number) => {
        syncKeys(current[index], item)
      })
    }
  }
}

function _diff(current: any, previous: any, path: string, result: any) {
  if (current === previous) return
  const rootCurrentType = getType(current)
  const rootPreType = getType(previous)
  if (rootCurrentType == OBJ_TYPE) {
    if (
      rootPreType != OBJ_TYPE ||
      (Object.keys(current).length < Object.keys(previous).length &&
        path !== '')
    ) {
      setResult(result, path, current)
    } else {
      for (let key in current) {
        const currentValue = current[key]
        const preValue = previous[key]
        const currentType = getType(currentValue)
        const preType = getType(preValue)
        if (currentType != ARR_TYPE && currentType != OBJ_TYPE) {
          if (currentValue !== previous[key]) {
            setResult(result, concatPathAndKey(path, key), currentValue)
          }
        } else if (currentType == ARR_TYPE) {
          if (preType != ARR_TYPE) {
            setResult(result, concatPathAndKey(path, key), currentValue)
          } else {
            if (currentValue.length < preValue.length) {
              setResult(result, concatPathAndKey(path, key), currentValue)
            } else {
              currentValue.forEach((item: any, index: number) => {
                _diff(
                  item,
                  preValue[index],
                  concatPathAndKey(path, key) + '[' + index + ']',
                  result
                )
              })
            }
          }
        } else if (currentType == OBJ_TYPE) {
          if (
            preType != OBJ_TYPE ||
            Object.keys(currentValue).length < Object.keys(preValue).length
          ) {
            setResult(result, concatPathAndKey(path, key), currentValue)
          } else {
            for (let subKey in currentValue) {
              const realPath =
                concatPathAndKey(path, key) +
                (subKey.includes('.') ? `["${subKey}"]` : `.${subKey}`)
              _diff(currentValue[subKey], preValue[subKey], realPath, result)
            }
          }
        }
      }
    }
  } else if (rootCurrentType == ARR_TYPE) {
    if (rootPreType != ARR_TYPE) {
      setResult(result, path, current)
    } else {
      if (current.length < previous.length) {
        setResult(result, path, current)
      } else {
        current.forEach((item: any, index: number) => {
          _diff(item, previous[index], path + '[' + index + ']', result)
        })
      }
    }
  } else {
    setResult(result, path, current)
  }
}

function concatPathAndKey(path: string, key: string) {
  return key.includes('.')
    ? path + `["${key}"]`
    : (path == '' ? '' : path + '.') + key
}

function setResult(result: any, k: string, v: any) {
  if (getType(v) != FUN_TYPE) {
    result[k] = v
  }
}

function getType(obj: object) {
  return Object.prototype.toString.call(obj)
}
