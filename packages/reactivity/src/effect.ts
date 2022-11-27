
export let activeEffect = undefined

function cleanupEffect(effect) {
  const { deps } = effect
  for(let i = 0; i < deps.length; i++) {
    deps[i].delete(effect)
  }

  effect.deps.length = 0
}

export class ReactiveEffect {
  // 表示在实例上新增了active属性
  public active = true // 这个effect默认是激活状态

  public parent = null
  public deps = []
  constructor(public fn, public scheduler) {} // 用户传递的参数也会到this上 this.fn = fn
  
  run() {
    // 如果是非激活的情况，只需要执行函数，不用进行依赖收集
     if(!this.active) {return this.fn()}

     // 依赖收集 核心就是将当前的effect和稍后渲染的属性关联在一起
     try{
        this.parent = activeEffect
        activeEffect = this

        // 这里需要执行用户函数之前将之前收集的内容清空
        cleanupEffect(this)

        // 调用fn时会触发该函数里面变量的取值（get/set）操作
        return this.fn()
     }finally {
        activeEffect = this.parent
     }
  }

  stop() {
    if(this.active) {
      this.active = false
      cleanupEffect(this)
    }
  }
}

export function effect(fn, options:any={}) {
  // fn可以根据状态变化重新执行，effect可以嵌套执行
  const _effect = new ReactiveEffect(fn, options.scheduler)
  
  _effect.run() // 默认先执行一次
  
  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

// 一个effect对应多个属性，一个属性对应多个effect
// 多对多
const targetMap = new WeakMap()
export function track(target, type, key) {
  debugger
  // 只有effect里面用到的属性才会跟踪收集
  if(!activeEffect) return

  // 对象 某个属性 --->会有多个effect
  // WeakMap = {对象：Map{name: Set}} 一个对象对应一个Map
  let depsMap = targetMap.get(target)
  if(!depsMap) {
    targetMap.set(target, (depsMap = new Map())) // (depsMap = new Map())既赋值 又把值作为结果
  }

  let dep = depsMap.get(key)
  if(!dep) {
    depsMap.set(key, (dep = new Set()))
  }

  trackEffects(dep)
}

export function trackEffects(dep) {
  if(activeEffect) {
    let shouldTrack = !dep.has(activeEffect)
    if(shouldTrack) {
      dep.add(activeEffect)
      // 存放属性对应的set
      activeEffect.deps.push(dep) // 让effect纪录对应的dep,稍后清理的时候会用到
    }
  }
}
   
export function trigger(target, type, key, value, oldValue) {
  const depsMap = targetMap.get(target)
  if(!depsMap) return
 
  let effects = depsMap.get(key)

  if(effects) {
    triggerEffects(effects)
  }
}

export function triggerEffects(effects) {
  effects = new Set(effects) // 拷贝一份 避免删除的时候死循环
  effects.forEach(effect => {
    if(effect !== activeEffect) {
      if(effect.scheduler) {
        effect.scheduler() // 如果用户传了调度函数，则用用户的
      }else {
        effect.run() // 否则默认刷新视图
      }
    }
  });
}

// 执行过程类似于一个树形结构 
// effect(() => { // parent = null activeEffect = e1
//   state.name   // name -> e1
//   effect(() => {  // parent = e1 activeEffect = e2
//     state.age // age -> e2
//   })
//   state.address // age -> e1 activeEffect = this.parent
// })