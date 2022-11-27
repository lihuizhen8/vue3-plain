// h的用法 h('div)
// h('div',{style: {color: 'red'}})
// h('div',{style: {color: 'red'}}, 'hello')
// h('div', 'hello')
// h('div',null, 'hello','world')
// h('div',null, h('span'))
// h('div',null,[ h('span')])

import { createVnode, isVnode } from './vnode';
import { isArray, isObject } from '@vue/shared';

export function h(type, propsChildren, children) { // 3个之外的参数都是children
  const l = arguments.length

  // h('div',{style: {color: 'red'}})
  // h('div', 'hello')
  // h('div', [ h('span'), h('span')])
  if(l === 2) {

    if(isObject(propsChildren) && !isArray(propsChildren)) {
      if(isVnode(propsChildren)) { // 虚拟节点就包装成数组
        return createVnode(type, null, [propsChildren])
      }
      return createVnode(type, propsChildren) // 属性
    }else {
      return createVnode(type, null, propsChildren)
    }

  }else {
    if(l > 3) {
      children = Array.from(arguments).slice(2)
    }else if(l === 3 && isVnode(children)){
      children = [children]
    }

    return createVnode(type, propsChildren, children) //children的情况有两种 文本/数组
  }
}