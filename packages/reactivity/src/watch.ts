import { ReactiveEffect } from './effect'
import { isReactive } from './reactive';
import { isObject, isFunction } from '../../shared/src/index';

function traversal(value, set = new Set()) { // 考虑如果对象中有循环引用问题
  if(!isObject(value)) return value
  if(set.has(value)) {
    return value
  }

  set.add(value)

  for(let key in value) {
    traversal(value[key], set)
  }

  return value
}

// souce用户传入的对象，cb用户的回调
export function watch(source, cb) {
  let getter
  if(isReactive(source)) {
    getter = () => traversal(source)
  }else if(isFunction(source)) {
    getter = source
  }else {
    return
  }
  
  let cleanup
  const onCleanup = (fn) => {
    cleanup = fn // 保存用户的函数
  }

  let oldValue
  const job = () => {
    if(cleanup) cleanup()
    const newValue = effect.run()
    cb(newValue, oldValue, onCleanup)
    oldValue = newValue
  }

  const effect = new ReactiveEffect(getter, job)

  oldValue = effect.run()
}