<template>
  <div class="comContainer_wisTree">
    <el-dialog :title="`选择${title}`" custom-class="comContainer_wisTree_wtDialogC" append-to-body
      :visible.sync="deptDialogVisible" top="100px" @closed="onDialogClose">
      <div class="wtMainC">
        <div class="wtTreeC" :class="{hideDisabledCheckbox: hideDisabledCheckbox}">
          <el-input v-if="!hideSearch" v-model="searchValue" class="wtSearchInput" clearable prefix-icon="el-icon-search" placeholder="搜索部门"></el-input>
          <el-tree v-if="showType === 'lazy'" ref="wtDeptsTree" class="wtElTree" show-checkbox
            lazy :load="onDeptLoad"
            node-key="value" :check-strictly="true" :props="deptProps"
            :default-checked-keys="defaultCheckedKeys"
            :expand-on-click-node="false" :check-on-click-node="true"
            :filter-node-method="onFilterNode"
            :render-content="renderContent"
            @check-change="onTreeChange"></el-tree>
          <el-tree v-if="showType === 'all'" ref="wtDeptsTree" class="wtElTree" show-checkbox
            :data="allData"
            node-key="value" :check-strictly="true" :props="deptProps"
            :default-checked-keys="defaultCheckedKeys"
            :expand-on-click-node="false" :check-on-click-node="true"
            :filter-node-method="onFilterNode"
            :render-content="renderContent"
            @check-change="onTreeChange"></el-tree>
        </div>
        <div class="wtResultC">
          <div class="wtSelectedName">已选择的{{title}}</div>
          <div class="wtSelectedC">
            <div v-for="(el, index) in checkedDeptList" :key="index" class="wtSelectedCell">
              <svg v-if="!el.isUser" class="wtDeptIcon" viewBox="0 0 1024 1024">
                <path d="M741 291.8h-56v-55c0-9.4-7.6-17-17-17H441v-56h227c40.3 0 73 32.7 73 73v55z"/>
                <path d="M917 920.2H107c-40.3 0-73-32.7-73-73v-671c0-40.3 32.7-73 73-73h292.6l127.1 161H917c40.3 0 73 32.7 73 73v510c0 40.3-32.7 73-73 73z m-810-761c-9.4 0-17 7.6-17 17v671c0 9.4 7.6 17 17 17h810c9.4 0 17-7.6 17-17v-510c0-9.4-7.6-17-17-17H499.6l-127.1-161H107z"/>
                <path d="M129.3 739.8H384v56H129.3z"/>
              </svg>
              <svg v-else class="wtDeptIcon" viewBox="0 0 1024 1024">
                <path d="M690.338 661.474c-41.498-18.374-103.937-65.868-195.163-82.197 23.332-24.985 40.564-63.996 58.672-110.231 10.528-26.786 8.425-49.62 8.425-82.185 0-24.002 4.507-62.528-1.502-83.71-20.073-71.577-71.002-91.29-130.507-91.29-59.583 0-110.473 19.828-130.557 91.452-5.848 21.24-1.355 59.627-1.355 83.548 0 32.623-1.764 55.56 8.787 82.359 18.247 46.477 35.683 85.444 58.865 110.347-90.428 16.525-148.928 63.73-190.16 82.047-85.32 38.11-83.219 79.828-83.219 79.828v70.698l685.644-0.128v-70.57c0-0.001-2.262-41.88-87.93-79.968zM659.56 227.805h271.187v59.352H659.56v-59.352zM659.56 357.765h165.782v60.375H659.56v-60.375z"/>
                <path d="M659.56 487.725h237.417V548.1H659.56v-60.375z"/>
              </svg>
              <div class="wtSCName">{{el.label}}</div>
              <div class="wtSCClose" @click="onRemoveDept(el, index)">
                <i class="el-icon-close"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deptDialogVisible = false">取 消</el-button>
        <el-button @click="onConfirm" type="primary">确 定</el-button>
      </div>
    </el-dialog>
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
    title: {
      type: String,
      default: '部门/班级'
    },
    showType: {
      type: String,
      default: 'lazy'
    },
    hideSearch: {
      type: Boolean,
      default: false
    },
    hideDisabledCheckbox: {
      type: Boolean,
      default: true
    },
    allData: {
      type: Array,
      default: () => []
    },
    dialogVisible: {
      type: Boolean,
      default: false
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
  mounted () {},
  data () {
    return {
      deptDialogVisible: false,
      searchValue: '',
      defaultCheckedKeys: [],
      checkedDeptList: []
    }
  },
  computed: {},
  watch: {
    dialogVisible (v) {
      this.deptDialogVisible = v
      if (v) {
        this.deptDialogVisible = this.dialogVisible
        this.searchValue = ''
        this.checkedDeptList = [...this.deptIdsList]
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
      }
    },
    deptDialogVisible (v) {
      this.$emit('update:dialogVisible', v)
    },
    searchValue (v) {
      // console.log(Object.keys(this.$refs.wtDeptsTree.store.nodesMap))
      this.$refs.wtDeptsTree.filter(v)
    }
  },
  filters: {},
  methods: {
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
    onDialogClose () {
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
    },
    onRemoveDept (data, deptIndex) {
      this.checkedDeptList.splice(deptIndex, 1)
      this.$nextTick(() => {
        this.$refs.wtDeptsTree.setChecked(data.value, false)
      })
    },
    onConfirm () {
      this.$emit('update:deptIdsList', [...this.checkedDeptList])
      this.$emit('confirm', this.checkedDeptList)
      this.deptDialogVisible = false
    }
  }
}
</script>

<style lang="scss">
  .comContainer_wisTree_wtDialogC {
    width: 540px;
    & .el-dialog__body {
      padding: 10px 20px !important;
    }
    & .el-dialog__footer {
      padding: 10px 20px !important;
      border-top: 1px solid #f1f1f1;
      background-color: #f9f9f9;
    }
    & .wtMainC {
      background-color: #fff;
      display: flex;
      align-items: stretch;
      height: 330px;
      & .wtTreeC {
        width: 260px;
        padding-right: 15px;
        border-right: 1px solid #f1f1f1;
        display: flex;
        flex-direction: column;
        &.hideDisabledCheckbox {
          & .el-checkbox.is-disabled {
            display: none;
          }
        }
        & .wtSearchInput {
          margin-bottom: 10px;
        }
        & .wtElTree {
          flex: 1;
          overflow: auto;
        }
      }
      & .wtResultC {
        width: 240px;
        padding-left: 15px;
        display: flex;
        flex-direction: column;
        & .wtSelectedName {
          height: 32px;
          line-height: 32px;
          font-size: 16px;
          margin-bottom: 10px;
        }
        & .wtSelectedC {
          flex: 1;
          overflow: auto;
        }
      }
    }
    & .wtSelectedCell {
      height: 26px;
      display: flex;
      align-items: center;
      &:hover {
        background-color: #f5f7fa;
      }
      & .wtSCName {
        flex: 1;
        margin-left: 10px;
      }
      & .wtSCClose {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 26px;
        cursor: pointer;
      }
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
