import { isObject } from '../../shared/src/index';
import { mutableHandler, ReactiveFlag } from './baseHandler'

// 将数据转换为响应式的数据, 只能做对象的代理

// WeakMap弱引用 key值只能是对象
// 实现同一个对象 代理多次，返回同一个代理
const reactiveMap = new WeakMap()

// 判断是否为proxy对象
export function isReactive(value) {
  return !!(value && value[ReactiveFlag.IS_REACTIVE])
}
                  
export function reactive(target) {
   if(!isObject(target)) return

   // 代理对象再次代理，可以直接返回
   if(target[ReactiveFlag.IS_REACTIVE]) { // 如果target是一个代理对象，那么一定就代理过了，会走get
     return target
   }

   let existingProxy = reactiveMap.get(target)
   if(existingProxy) {
     return existingProxy
   }

   const proxy = new Proxy(target, mutableHandler)
 
   reactiveMap.set(target, proxy)
   return proxy 
}