import { isFunction } from '../../shared/src/index';
import { ReactiveEffect, effect, trackEffects, triggerEffects } from './effect';

class ComputedRefImpl { 
  public effect
  public dirty = true
  public __v_isReadonly = false
  public __v_isRef = false
  public _value
  public dep

  constructor(getter, public setter) { 
    this.effect = new ReactiveEffect(getter, () => {
      // 稍后依赖得属性变化会执行此调度函数
      if(!this.dirty) {
        this.dirty = true
        triggerEffects(this.dep) // 实现一个触发更新
      }
    })
  }

  get value() {
    trackEffects(this.dep || (this.dep = new Set()))
    if(this.dirty) {
      this.dirty = false
      this._value = this.effect.run()
    }
    return this._value
  }

  set value(newValue) {
    this.setter(newValue)
  }
}

export const computed = (getterOptions) => {
  let onlyGetter = isFunction(getterOptions)
  let getter
  let setter

  if(onlyGetter) {
     getter = getterOptions
     setter = () => {console.warn('no setter')}
  }else {
    getter = getterOptions.get
    setter = getterOptions.set
  }

  return new ComputedRefImpl(getter, setter)
}