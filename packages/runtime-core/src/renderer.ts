import { ShapeFlags, isString } from '@vue/shared';
import { Text, createVnode, isSameVnode } from './vnode';

export function createRenderer(renderOptions) {

  let {
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
    setText: hostSetText,
    parentNode: hostParentNode,
    nextSlibing: hostNextSlibing,
    createElement: hostCreateElement,
    createText: hostCreateText,
    patchProp: hostPatchProp
  } = renderOptions

  const normalize = (child) => {
    if(isString(child)) {
      return createVnode(Text, null, child)
    }
    return child
  }

  const mountChildren = (children, container) => {
    for(let i = 0; i < children.length; i++) {
      let child = normalize(children[i])
      patch(null, child, container)
    }
  }

  const mountElement = (vnode, container) => {
    let { type, props, children, shapeFlag } = vnode
    let el = vnode.el = hostCreateElement(type) // 将真实元素挂载到这个虚拟节点上，后续用于复用节点和更新
    if(props) {
      for(let key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN) { // 文本
      hostSetElementText(el, children)
    }else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) { // 数组
      mountChildren(children, el)
    }

    hostInsert(el, container)
  }

  const processText = (n1, n2, container) => {
    if(n1 === null) {
      hostInsert((n2.el = hostCreateText(n2.children)), container)
    }else {
      // 文本比对替换
      const el = n2.el = n1.el
      if(n1.children != n2.children) {
        hostSetText(el, n2.children)
      }
    }
  }

  const patchProps = (oldProps, newProps, el) => {
    for(let key in newProps) { // 新的里面有，直接用新的盖掉
      hostPatchProp(el, key, oldProps[key], newProps[key])
    }

    for(let key in oldProps) { // 如果老的里面有 新的没有 则是删除
      if(newProps[key] == null) {
        hostPatchProp(el, key, oldProps[key], null)
      }
    }
  }

  const unmountChildren = (children) => {
    for(let i = 0; i < children.length; i++) {
      unmounted(children[i])
    }
  }

  const patchChildren = (n1, n2, el) => {
    // 比较两个虚拟节点的儿子的差异，el就是当前的父节点
    const c1 = n1.children
    const c2 = n2.children
    const prevShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag

    // 比较差异
    // 新   旧
    // 文本 数组 （删除老儿子，设置文本内容）
    // 文本 文本 （更新文本即可）
    // 数组 数组 （diff算法）
    // 数组 文本 （清空文本，进行挂载）
    // 空   数组 （删除所有儿子）
    // 空   文本 （清空文本）
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 文本的情况下
      if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 删除所有子节点
        unmountChildren(c1) // 文本 数组 （删除老儿子，设置文本内容）
      }
      if(c1 !== c2) { 
        hostSetElementText(el, c2) // 文本 文本 （更新文本即可）文本  空
      }
    }else {
      // 新节点 数组或为空的情况下
      if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) { // 数组 数组 （diff算法）
          // diff算法
        }else {
          // 现在不是数组（文本和空）
          unmountChildren(c1) // 空   数组 （删除所有儿子）
        }
      }else {

      }
    }
  }

  const patchElement = (n1, n2, container) => {
    let el = n2.el = n1.el

    let oldProps = n1.props || {}
    let newProps = n2.props || {}

    patchProps(oldProps, newProps, el) // 比较属性
    patchChildren(n1, n2, el) // 比较children
  }

  const processElement = (n1, n2, container) => {
    if(n1 === null) {
      mountElement(n2, container)
    }else {
      // 元素比对替换
      patchElement(n1, n2, container)
    }
  }

  const patch = (n1, n2, container) => {
    if(n1 === n2) return

    if(n1 && !isSameVnode(n1, n2)) { // 判断两个元素是否相同，不相同卸载了再添加
      unmounted(n1)
      n1 = null
    }

    const { type, shapeFlag } = n2

    switch(type) {
      case Text:
        processText(n1, n2, container)
        break
      default:
        if(shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container)
        }
    }
  }

  const unmounted = (vnode) => {
    hostRemove(vnode.el)
  }

  // 将虚拟dom（vnode）渲染到container
  // vnode是虚拟节点
  const render = (vnode, container) => {
    
    if(vnode == null) {
      // 卸载逻辑
      if(container._vnode) { //之前渲染过才能卸载dom
        unmounted(container._vnode)
      }
    }else {
      // 初始化逻辑与更新逻辑
      patch(container._vnode || null, vnode, container)
    }
    container._vnode = vnode

  }

  return {
    render
  }
}

// 1)更新的逻辑思考
// - 如果前后完全没关系，删除老的，添加新的
// - 老的和新的一样，复用。属性可能不一样，再比对属性，更新属性
// - 比children