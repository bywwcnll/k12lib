export const downloadFile = async ({action = '', params = {}, method = 'GET'}) => {
  let form = window.document.createElement('form')
  form.id = 'downloadFileForm'
  form.name = 'downloadFileForm'
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

export const deepCopyObj = (data) => JSON.parse(JSON.stringify(data))

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
