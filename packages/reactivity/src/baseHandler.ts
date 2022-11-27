import { track, trigger } from './effect'
import { isObject } from '../../shared/src/index';
import { reactive } from './reactive';

// 第一次普通对象代理，我们会new proxy代理一次
// 下一次你传递的是proxy 我们可以看一下他有没有代理过，如果访问这个proxy 有get方法说明就是访问过了
export const enum ReactiveFlag {
  IS_REACTIVE = '__v_isReactive'
}

export const mutableHandler = {
  get(target, key, receiver) { // receiver代表的是当前的代理对象
    if(key === ReactiveFlag.IS_REACTIVE) {
      return true
    }
    track(target, 'get', key)

    // ！！refect取值的时候会把target里面的this指向代理对象
    let res = Reflect.get(target, key, receiver)

    if(isObject(res)) {
      return reactive(res) // 深度代理实现 性能好 取值就可以进行代理
    }

    return res
    // return target[key]
  }, 
  set(target, key, value, receiver) {
    const oldValue = target[key]
    const result = Reflect.set(target, key, value, receiver)

    if(oldValue !== value) {
      trigger(target, 'set', key, value, oldValue)
    }
    return result
    // target[key] = value
    // return true 
  }
}