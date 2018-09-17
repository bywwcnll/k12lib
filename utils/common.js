export const downloadFile = async ({action = '', params = {}, method = 'GET'}) => {
  if (action.indexOf('?') > -1) {
    let queryStr = action.slice(action.indexOf('?') + 1) || ''
    if (queryStr.length > 0) {
      let queryParamsArray = queryStr.split('&')
      queryParamsArray.forEach(el => {
        let kw = el.split('=')
        if (kw.length === 2) {
          let tmp = {}
          tmp[kw[0]] = kw[1]
          params = {...tmp, ...params}
        }
      })
    }
  }
  let form = window.document.createElement('form')
  form.id = form.name = 'downloadFileForm'
  form.action = action
  form.method = method
  window.document.body.appendChild(form)
  Object.keys(params).forEach(el => {
    let input = document.createElement('input')
    input.tpye = 'hidden'
    input.name = el
    input.value = params[el]
    form.appendChild(input)
  })
  form.submit()
  window.document.body.removeChild(form)
}

export const deepClone = (data) => {
  let result = Array.isArray(data) ? [] : {}
  if (data && typeof data === 'object') {
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        if (data[key] && typeof data[key] === 'object') {
          result[key] = deepClone(data[key])
        } else {
          result[key] = data[key]
        }
      }
    }
  }
  return result
}

export const mapDeptData = (data = [], disabled = false) => {
  return data.map(el => {
    let result = {
      label: el.deptName,
      value: el.deptId,
      subDeptNum: el.subDeptNum,
      pinyinName: el.pinyinName,
      disabled
    }
    if (el.children && el.children.length > 0) {
      result.children = mapDeptData(el.children)
    }
    return result
  })
}
