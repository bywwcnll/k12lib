const elDraggableDialog = {
  bind: function (el, _, vnode) {
    let dragDom = el.querySelector('.el-dialog')
    let dialogHeaderEl = el.querySelector('.el-dialog__header')
    dragDom.style.cssText += ';top:0px;'
    dialogHeaderEl.style.cssText += ';cursor:move;'
    dialogHeaderEl.onmousedown = function (e) {
      let disX = e.clientX - dialogHeaderEl.offsetLeft
      let disY = e.clientY - dialogHeaderEl.offsetTop
      let dragDomWidth = dragDom.offsetWidth
      let dragDomHeight = dragDom.offsetHeight
      let screenWidth = document.body.clientWidth
      let screenHeight = document.body.clientHeight
      let minDragDomLeft = dragDom.offsetLeft
      let maxDragDomLeft = screenWidth - dragDom.offsetLeft - dragDomWidth
      let minDragDomTop = dragDom.offsetTop
      let maxDragDomTop = screenHeight - dragDom.offsetTop - dragDomHeight
      let styleLeftStr = getComputedStyle(dragDom)['left']
      let styleTopStr = getComputedStyle(dragDom)['top']
      if (!styleLeftStr || !styleTopStr)
        return
      let styleLeft
      let styleTop
      
      if (styleLeftStr.includes('%')) {
        styleLeft = +document.body.clientWidth * (+styleLeftStr.replace(/%/g, '') / 100)
        styleTop = +document.body.clientHeight * (+styleTopStr.replace(/%/g, '') / 100)
      } else {
        styleLeft = +styleLeftStr.replace(/px/g, '')
        styleTop = +styleTopStr.replace(/px/g, '')
      }
      document.onmousemove = function (e) {
        let left = e.clientX - disX
        let top = e.clientY - disY
        
        if (-(left) > minDragDomLeft) {
          left = -minDragDomLeft
        } else if (left > maxDragDomLeft) {
          left = maxDragDomLeft
        }
        if (-(top) > minDragDomTop) {
          top = -minDragDomTop
        } else if (top > maxDragDomTop) {
          top = maxDragDomTop
        }
        
        dragDom.style.cssText += ";left:" + (left + styleLeft) + "px;top:" + (top + styleTop) + "px;"
        // Emit onDialogDrag event
        // See https://stackoverflow.com/questions/49264426/vuejs-custom-directive-emit-event
        if (vnode.componentInstance) {
          vnode.componentInstance.$emit('onDialogDrag')
        } else if (vnode.elm) {
          vnode.elm.dispatchEvent(new CustomEvent('onDialogDrag'))
        }
      }
      document.onmouseup = function () {
        document.onmousemove = null
        document.onmouseup = null
      }
    }
  }
}

export default elDraggableDialog
