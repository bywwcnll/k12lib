<template>
  <div class="comContainer_wisSimpleTree">
    <el-tree v-if="showType === 'lazy'" ref="wtDeptsTree" class="wtElTree" show-checkbox
      lazy :load="onDeptLoad" :key="elTreeKey"
      node-key="value" :check-strictly="true" :props="deptProps"
      :default-checked-keys="defaultCheckedKeys"
      :expand-on-click-node="false" :check-on-click-node="true"
      :filter-node-method="onFilterNode"
      :render-content="renderContent"
      :default-expanded-keys="defaultExpandedKeys"
      @check-change="onTreeChange"></el-tree>
    <el-tree v-if="showType === 'all'" ref="wtDeptsTree" class="wtElTree" show-checkbox
      :data="allData" :key="elTreeKey"
      node-key="value" :check-strictly="true" :props="deptProps"
      :default-checked-keys="defaultCheckedKeys"
      :expand-on-click-node="false" :check-on-click-node="true"
      :filter-node-method="onFilterNode"
      :render-content="renderContent"
      :default-expanded-keys="defaultExpandedKeys"
      @check-change="onTreeChange"></el-tree>
  </div>
</template>

<script>
import { Input, Tree } from 'element-ui'
export default {
  components: {
    [Input.name]: Input,
    [Tree.name]: Tree
  },
  props: {
    showType: {
      type: String,
      default: 'lazy'
    },
    allData: {
      type: Array,
      default: () => []
    },
    deptIdsList: {
      type: Array,
      default: () => []
    },
    deptProps: {
      default: () => {
        return {
          label: 'label',
          isLeaf: (data, node) => {
            return data.subDeptNum <= 0
          }
        }
      }
    },
    deptLoad: {},
    limit: Number
  },
  created () {},
  mounted () {
    this.setDefaultChecked()
  },
  data () {
    return {
      elTreeKey: 'elTreeKey',
      searchValue: '',
      defaultCheckedKeys: [],
      checkedDeptList: [],
      defaultExpandedKeys: []
    }
  },
  computed: {},
  watch: {
    deptIdsList (v) {
      this.setDefaultChecked()
    },
    allData (v) {
      this.defaultExpandedKeys = v.map(el => el.value)
      this.elTreeKey = new Date().getTime()
    },
    checkedDeptList (v, ov) {
      this.$emit('update:deptIdsList', this.checkedDeptList)
    }
  },
  filters: {},
  methods: {
    setDefaultChecked () {
      this.checkedDeptList = this.deptIdsList
      this.defaultCheckedKeys = this.checkedDeptList.map(el => el.value)

      this.$nextTick(() => {
        this.defaultCheckedKeys.forEach(el => {
          this.$refs.wtDeptsTree.setChecked(el, true)
        })
        let currentCheckedKeys = this.$refs.wtDeptsTree.getCheckedKeys() || []
        let willUnCheckedList = currentCheckedKeys.filter(el => this.defaultCheckedKeys.indexOf(el) === -1)
        willUnCheckedList.forEach(el => {
          this.$refs.wtDeptsTree.setChecked(el, false)
        })
      })
    },
    renderContent (h, { node, data, store }) {
      if (data.isUser) {
        /* 人员项 */
        return (
          <span class="el-tree-node__label wtPersonC">
            <svg class="wtDeptIcon" viewBox="0 0 1024 1024">
              <path d="M690.338 661.474c-41.498-18.374-103.937-65.868-195.163-82.197 23.332-24.985 40.564-63.996 58.672-110.231 10.528-26.786 8.425-49.62 8.425-82.185 0-24.002 4.507-62.528-1.502-83.71-20.073-71.577-71.002-91.29-130.507-91.29-59.583 0-110.473 19.828-130.557 91.452-5.848 21.24-1.355 59.627-1.355 83.548 0 32.623-1.764 55.56 8.787 82.359 18.247 46.477 35.683 85.444 58.865 110.347-90.428 16.525-148.928 63.73-190.16 82.047-85.32 38.11-83.219 79.828-83.219 79.828v70.698l685.644-0.128v-70.57c0-0.001-2.262-41.88-87.93-79.968zM659.56 227.805h271.187v59.352H659.56v-59.352zM659.56 357.765h165.782v60.375H659.56v-60.375z"/>
              <path d="M659.56 487.725h237.417V548.1H659.56v-60.375z"/>
            </svg>
            <span>{node.label}</span>
          </span>
        )
      } else {
        return (
          <span class="el-tree-node__label">{node.label}</span>
        )
      }
    },
    onFilterNode (value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1 || data.pinyinName.indexOf(value) !== -1
    },
    async onDeptLoad (node, resolve) {
      await this.deptLoad(node, resolve)
      let halfCheckedKeys = this.$refs.wtDeptsTree.getHalfCheckedKeys()
      halfCheckedKeys.forEach(el => {
        this.$refs.wtDeptsTree.setChecked(el, false)
      })
    },
    onTreeChange (data, checked) {
      if ((!data.value && data.value !== 0) || data.disabled) {
        return
      }
      let deptIndex = this.checkedDeptList.map(el => el.value).indexOf(data.value)
      if (checked) {
        if (deptIndex === -1) {
          if (this.limit === 0) {
            this.checkedDeptList.forEach(el => {
              this.$refs.wtDeptsTree.setChecked(el.value, false)
            })
            this.$refs.wtDeptsTree.setChecked(data.value, false)
            this.$wisToast(`限制选择数量为${this.limit}`, 'warning')
            return
          } else if (this.limit > 0) {
            if (this.limit === 1) {
              this.checkedDeptList.forEach(el => {
                this.$refs.wtDeptsTree.setChecked(el.value, false)
              })
              this.$refs.wtDeptsTree.setChecked(data.value, true)
              this.checkedDeptList = [data]
            } else if (this.limit > this.checkedDeptList.length) {
              this.checkedDeptList.push(data)
            } else {
              this.$refs.wtDeptsTree.setChecked(data.value, false)
              this.$wisToast(`最多选择${this.limit}个`, 'warning')
            }
          } else {
            this.checkedDeptList.push(data)
          }
        }
      } else {
        if (deptIndex > -1) {
          if (this.limit !== 1) {
            this.checkedDeptList.splice(deptIndex, 1)
          } else {
            this.$refs.wtDeptsTree.setChecked(data.value, true)
          }
        }
      }
    }
  }
}
</script>

<style lang="scss">
  .comContainer_wisSimpleTree {
    width: 100%;
    overflow: auto;
    & .el-tree-node__children {
      overflow: initial !important;
    }
    & .el-tree-node__expand-icon {
      padding: 4px !important;
      font-size: 16px !important;
    }
    & .el-tree-node__expand-icon, & .el-tree-node__children.collapse-transition {
      transition-duration: 0.15s, 0.15s !important;
    }
    & .wtPersonC {
      display: flex;
      align-items: center;
    }
    & .wtDeptIcon {
      fill: #6aace2;
      width: 26px;
      height: 26px;
      padding: 4px;
    }
  }
</style>
