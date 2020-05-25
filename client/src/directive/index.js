export const trim = {
  bind(el, binding, vnode) {
    // const handler = function(e) {
    //   if (e.target.value) e.target.value = e.target.value.trim()
    //   console.log(e.target.value)
    //   // if (e.target.value.length > maxChars) {
    //   // e.target.value = e.target.value.substr(0, maxChars)
    //   // vnode.elm.dispatchEvent(new CustomEvent('input')) // added this
    //   // }
    // }
    // el.addEventListener('input', handler)
    el.addEventListener('blur', (e) => {
      if (e.target.value) {
        e.target.value = e.target.value.trim()
        vnode.componentInstance.$emit('input', e.target.value)
      }
      // console.log(e.target.value)
    }, true)
  },
  update: function(el, binding, vnode) {
  }
}

export const lowercase = {
  bind(el, binding, vnode) {
    // const handler = function(e) {
    //   if (e.target.value) e.target.value = e.target.value.trim()
    //   console.log(e.target.value)
    //   // if (e.target.value.length > maxChars) {
    //   // e.target.value = e.target.value.substr(0, maxChars)
    //   // vnode.elm.dispatchEvent(new CustomEvent('input')) // added this
    //   // }
    // }
    // el.addEventListener('input', handler)
    el.addEventListener('blur', (e) => {
      if (e.target.value) {
        e.target.value = e.target.value.toLowerCase()
        vnode.componentInstance.$emit('input', e.target.value)
      }
      // console.log(e.target.value)
    }, true)
  }
}

export const uppercase = {
  bind(el, binding, vnode) {
    // const handler = function(e) {
    //   if (e.target.value) e.target.value = e.target.value.trim()
    //   console.log(e.target.value)
    //   // if (e.target.value.length > maxChars) {
    //   // e.target.value = e.target.value.substr(0, maxChars)
    //   // vnode.elm.dispatchEvent(new CustomEvent('input')) // added this
    //   // }
    // }
    // el.addEventListener('input', handler)
    el.addEventListener('blur', (e) => {
      if (e.target.value) {
        e.target.value = e.target.value.toUpperCase()
        vnode.componentInstance.$emit('input', e.target.value)
      }
      // console.log(e.target.value)
    }, true)
  }
}

export const uppercaseFirst = {
  bind(el, binding, vnode) {
    // const handler = function(e) {
    //   if (e.target.value) e.target.value = e.target.value.trim()
    //   console.log(e.target.value)
    //   // if (e.target.value.length > maxChars) {
    //   // e.target.value = e.target.value.substr(0, maxChars)
    //   // vnode.elm.dispatchEvent(new CustomEvent('input')) // added this
    //   // }
    // }
    // el.addEventListener('input', handler)
    el.addEventListener('blur', (e) => {
      if (e.target.value) {
        e.target.value = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1)
        vnode.componentInstance.$emit('input', e.target.value)
      }
      // console.log(e.target.value)
    }, true)
  }
}

export const uppercaseSpace = {
  bind(el, binding, vnode) {
    // const handler = function(e) {
    //   if (e.target.value) e.target.value = e.target.value.trim()
    //   console.log(e.target.value)
    //   // if (e.target.value.length > maxChars) {
    //   // e.target.value = e.target.value.substr(0, maxChars)
    //   // vnode.elm.dispatchEvent(new CustomEvent('input')) // added this
    //   // }
    // }
    // el.addEventListener('input', handler)
    el.addEventListener('blur', (e) => {
      if (e.target.value) {
        const arr = e.target.value.trim().split(' ')
        e.target.value = ''
        for (let i = 0; i < arr.length; i++) {
          e.target.value += arr[i].charAt(0).toUpperCase() + arr[i].slice(1)
          if (i < arr.length - 1) e.target.value += ' '
        }
        // arr.forEach(x => {
        //   e.target.value += x.charAt(0).toUpperCase() + x.slice(1) + ' '
        // })
        // e.target.value = e.target.value.trim()
        vnode.componentInstance.$emit('input', e.target.value)
      }
      // console.log(e.target.value)
    }, true)
  }
}
