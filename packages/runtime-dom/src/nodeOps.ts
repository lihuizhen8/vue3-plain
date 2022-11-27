export const nodeOps = {
  // 增删改查
  insert(child, parent, anchor = null) {
    parent.insertBefore(child, anchor) // insertBefore等价于appendChild
  },
  remove(child) {
    const parentNode = child.parentNode
    if(parentNode) {
      parentNode.removeChild(child)
    }
  },
  setElementText(el, text) {
    el.textContent = text
  },
  // 设置文本节点
  setText(node, text) {
    node.nodeValue = text
  },
  // 获取当前元素
  querySelector(selector) {
    return document.querySelector(selector)
  },
  // 获取父节点
  parentNode(node) {
    return node.parentNode
  },
  // 获取兄弟
  nextSlibing(node) {
    return node.nextSibling
  },
  createElement(tagName) {
    return document.createElement(tagName)
  },
  createText(text) {
    return document.createTextNode(text)
  }
}