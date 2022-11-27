import { isString, ShapeFlags, isArray } from '@vue/shared';

export const Text = Symbol('Text')

export function isVnode(value) {
  return !!(value && value.__v_isVnode)
}

// 判断两个虚拟节点是否是相同节点 1.标签名相同 2.key是一样的
export function isSameVnode(n1, n2) {
  return (n1.type === n2.type) && (n1.key === n2.key)
}

export function createVnode(type, props, children=null) {

   let shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0
   // 虚拟dom就是一个对象，diff算法。真实dom的属性比较多
   const vnode = {
    type,
    props,
    children,
    el: null,
    key: props?.['key'],
    __v_isVnode: true,
    shapeFlag
   }

   if(children) {
     let type = 0
     if(isArray(children)) {
       type = ShapeFlags.ARRAY_CHILDREN
     }else {
       children = String(children)
       type = ShapeFlags.TEXT_CHILDREN
     }
     vnode.shapeFlag |= type
   }

   return vnode
 }