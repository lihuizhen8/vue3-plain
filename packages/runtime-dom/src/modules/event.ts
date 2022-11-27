function createInvoker(callback) {
  const invoker = (e) => invoker.value(e)
  invoker.value = callback
  return invoker
}

export function patchEvent(el, eventName, nextValue) {
  // 先移出事件，再绑定事件
  let invokers = el.evi || (el.evi = {})
  let exits = invokers[eventName]

  if(exits && nextValue) {
    exits.value = nextValue
  }else {
    let event = eventName.slice(2).toLowerCase() // 截取事件名 onClick ----> click
    if(nextValue) {
      const invoker = invokers[eventName] = createInvoker(nextValue)
      el.addEventListener(event, invoker)
    }else if(exits) { // 如果有老值，需要将老的绑定事件移除掉
      el.removeEventListener(event, exits)
      invokers[eventName] = undefined
    }
  }
}