import { patchClass } from './modules/class';
import { patchStyle } from './modules/style';
import { patchEvent } from './modules/event';
import { patchAttr } from './modules/attr';


// null, 值
// 值  值
// 值 null
export function patchProp(el, key, prevValue, nextValue) {
  if(key === 'class') {
    patchClass(el, nextValue)
  }else if(key === 'style') {
    patchStyle(el, prevValue, nextValue)
  }else if(/^on[^a-z]/.test(key)) {
    patchEvent(el, key, nextValue)
  }else { // 普通属性
    patchAttr(el, key, nextValue)
  }
}