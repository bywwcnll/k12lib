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
