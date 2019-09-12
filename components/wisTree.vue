<template>
  <div class="comContainer_wisTree">
    <el-dialog :title="titleTxt" custom-class="comContainer_wisTree_wtDialogC" append-to-body
               :visible.sync="deptDialogVisible" top="100px" @closed="onDialogClose">
      <div class="wtMainC">
        <div class="wtTreeC" :class="{hideDisabledCheckbox: hideDisabledCheckbox}">
          <el-input v-if="!hideSearch" v-model="searchValue" class="wtSearchInput"
                    clearable prefix-icon="el-icon-search" :placeholder="searchPlaceholder"></el-input>
          <el-input v-if="showAdvancedSearchFlag" v-model="advancedSearchValue" class="wtSearchInput"
                    clearable prefix-icon="el-icon-search" :placeholder="adSearchPlaceholder"></el-input>
          <el-button-group v-if="showTagListFlag && tagList.length > 1" class="wtUserRoleGroupC">
            <el-button v-for="(el, index) in tagList" :key="index"
                       :type="activeTag === el ? 'primary' : ''" @click="activeTag = el">{{el}}</el-button>
          </el-button-group>
          <template v-if="showElTreeFlag">
            <div v-show="!advancedSearchValue" class="wtElTreeC">
              <el-tree v-if="showType === 'lazy'" ref="wtDeptsTree" class="wtElTree" show-checkbox
                       lazy :load="onDeptLoad" :default-expanded-keys="defaultExpandedKeys"
                       node-key="value" :check-strictly="true" :props="deptProps"
                       :default-checked-keys="defaultCheckedKeys"
                       :expand-on-click-node="false" :check-on-click-node="true"
                       :filter-node-method="onFilterNode"
                       @check-change="onTreeChange">
                <wisTreeCell slot-scope="{ node, data }" :node="node" :data="data" renderMode></wisTreeCell>
              </el-tree>
              <el-tree v-if="showType === 'all'" ref="wtDeptsTree" class="wtElTree" show-checkbox
                       :data="allData" :default-expanded-keys="defaultExpandedKeys"
                       node-key="value" :check-strictly="true" :props="deptProps"
                       :default-checked-keys="defaultCheckedKeys"
                       :expand-on-click-node="false" :check-on-click-node="true"
                       :filter-node-method="onFilterNode"
                       @check-change="onTreeChange">
                <wisTreeCell slot-scope="{ node, data }" :node="node" :data="data" renderMode></wisTreeCell>
              </el-tree>
            </div>
          </template>
          <div v-show="advancedSearchValue" class="advancedSearchListC">
            <div v-for="(el, index) in advancedSearchList" :key="index" class="cell"
                 @click="onTreeChange(el, true)">
              <wisTreeCell :data="el"></wisTreeCell>
            </div>
            <div v-show="isEmpty(advancedSearchList)" class="advancedSearchEmpty">暂无数据</div>
          </div>
          <div v-show="advancedSearchValue && !isEmpty(advancedSearchList) && advancedSearchList.length >= 50"
               class="advancedSearchTip">最多显示前50条结果</div>
        </div>
        <div class="wtResultC">
          <div class="wtSelectedName">{{resultTitleTxt}}</div>
          <div class="wtSelectedC">
            <div v-for="(el, index) in checkedDeptList" :key="index" class="wtSelectedCell">
              <wisTreeCell :data="el" :index="index" showDeptNames :showCloseBtn="!el.disabled" @close="onRemoveDept"></wisTreeCell>
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
import { Button, ButtonGroup, Dialog, Input, Tree } from 'element-ui'
import { debounce, isEmpty } from 'lodash'
import wisTreeCell from './wisTreeCell'

export default {
  components: {
    [Button.name]: Button,
    [ButtonGroup.name]: ButtonGroup,
    [Dialog.name]: Dialog,
    [Input.name]: Input,
    [Tree.name]: Tree,
    wisTreeCell
  },
  props: {
    title: {
      type: String,
      default: '部门/班级'
    },
    customTitle: {
      type: Object,
      // validator: function (value) {
      //   return !isEmpty(value) && value.title && value.resultTitle
      // },
      default () {
        return {}
      }
    },
    showType: {
      type: String,
      default: 'lazy'
    },
    /* 部门过滤性的搜索 */
    hideSearch: {
      type: Boolean,
      default: false
    },
    searchPlaceholder: {
      type: String,
      default: '搜索部门'
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
    deptLoad: Function,
    limit: Number,

    showAdvancedSearchFlag: Boolean,
    adSearchPlaceholder: {
      type: String,
      default: '搜索'
    },
    advancedLoad: Function,
    showTagListFlag: Boolean,
    tagList: {
      type: Array,
      default () {
        return ['教职工', '学生', '家长']
      }
    },
    parentMode: Boolean
  },
  created () {},
  mounted () {
    if (this.showTagListFlag && !isEmpty(this.tagList)) {
      this.activeTag = this.tagList[0]
    }
    if (this.showType === 'all' && !isEmpty(this.allData) && !this.allData[0].isUser) {
      this.defaultExpandedKeys = [this.allData[0].value]
    }
  },
  data () {
    return {
      loadedCounts: 0,
      isEmpty,
      showElTreeFlag: true,
      deptDialogVisible: false,
      searchValue: '',
      activeTag: '',
      defaultCheckedKeys: [],
      checkedDeptList: [],

      advancedSearchValue: '',
      advancedSearchList: [],
      defaultExpandedKeys: []
    }
  },
  computed: {
    titleTxt () {
      return isEmpty(this.customTitle) ? '选择' + this.title : this.customTitle.title
    },
    resultTitleTxt () {
      return isEmpty(this.customTitle) ? '已选择的' + this.title : this.customTitle.resultTitle
    }
  },
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
    },
    advancedSearchValue (v) {
      this.doAdvancedSearch()
    },
    activeTag (v) {
      this.$emit('tagChange', v)
      this.$nextTick(async () => {
        if (this.advancedSearchValue) {
          await this.doAdvancedSearch()
        }
      })
    },
    allData (v) {
      if (this.showType === 'all' && !isEmpty(v)) {
        this.defaultExpandedKeys = [v[0].value]
      }
    }
  },
  filters: {},
  methods: {
    doAdvancedSearch: debounce(async function () {
      if (!this.advancedSearchValue) {
        this.advancedSearchList = []
        return
      }
      let result = await this.advancedLoad(this.advancedSearchValue)
      if (this.parentMode && result) {
        result = result.map(el => {
          if (el.isUser && !/的家长$/.test(el.label)) el.label += '的家长'
          return el
        })
      }
      this.advancedSearchList = result
    }, 500),
    forceRenderTree () {
      this.showElTreeFlag = false
      this.$nextTick(() => {
        this.showElTreeFlag = true
      })
    },
    onDialogClose () {
    },
    onFilterNode (value, data) {
      if (!value) return true
      return (data.label && data.label.indexOf(value) !== -1) || (data.pinyinName && data.pinyinName.indexOf(value) !== -1)
    },
    async onDeptLoad (node, resolve) {
      await this.deptLoad(node, (result) => {
        if (this.parentMode && result) {
          result = result.map(el => {
            if (el.isUser && !/的家长$/.test(el.label)) el.label += '的家长'
            return el
          })
        }
        if (this.checkedDeptList && result) {
          let disabledList = (this.checkedDeptList || []).filter(el => el.value && el.disabled).map(el => el.value)
          result = (result || []).map(el => {
            if (disabledList.indexOf(el.value) > -1) el.disabled = true
            return el
          })
        }
        resolve(result)
      })
      this.loadedCounts++
      if (this.$refs.wtDeptsTree) {
        let halfCheckedKeys = this.$refs.wtDeptsTree.getHalfCheckedKeys()
        halfCheckedKeys.forEach(el => {
          this.$refs.wtDeptsTree.setChecked(el, false)
        })
      }
      if (this.loadedCounts < 2) {
        this.$nextTick(() => {
          let firstNode = this.$refs.wtDeptsTree.root.childNodes[0]
          if (firstNode && !firstNode.data.isUser) {
            this.defaultExpandedKeys = [this.$refs.wtDeptsTree.root.childNodes[0].data.value]
          }
        })
      }
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
            if (this.$wisToast) {
              this.$wisToast(`限制选择数量为${this.limit}`, 'warning')
            }
            return
          } else if (this.limit > 0) {
            if (this.limit === 1) {
              if (this.$refs.wtDeptsTree) {
                this.checkedDeptList.forEach(el => {
                  this.$refs.wtDeptsTree.setChecked(el.value, false)
                })
                this.$refs.wtDeptsTree.setChecked(data.value, true)
              }
              this.checkedDeptList = [data]
            } else if (this.limit > this.checkedDeptList.length) {
              this.checkedDeptList.push(data)
            } else {
              if (this.$refs.wtDeptsTree) this.$refs.wtDeptsTree.setChecked(data.value, false)
              if (this.$wisToast) {
                this.$wisToast(`最多选择${this.limit}个`, 'warning')
              }
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
            if (this.$refs.wtDeptsTree) this.$refs.wtDeptsTree.setChecked(data.value, true)
          }
        }
      }
    },
    onRemoveDept ({ data, index }) {
      this.checkedDeptList.splice(index, 1)
      this.$nextTick(() => {
        if (this.$refs.wtDeptsTree) this.$refs.wtDeptsTree.setChecked(data.value, false)
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
  .comContainer_wisTree_ellipsis {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .comContainer_wisTree_wtDialogC {
    width: 650px;
    .el-dialog__body {
      padding: 10px 20px !important;
    }
    .el-dialog__footer {
      padding: 10px 20px !important;
      border-top: 1px solid #f1f1f1;
      background-color: #f9f9f9;
    }
    .wtMainC {
      background-color: #fff;
      display: flex;
      align-items: stretch;
      height: 373px;
      .wtTreeC {
        width: 310px;
        padding-right: 15px;
        border-right: 1px solid #f1f1f1;
        display: flex;
        flex-direction: column;
        &.hideDisabledCheckbox {
          .el-checkbox.is-disabled {
            display: none;
          }
        }
        .wtSearchInput {
          margin-bottom: 10px;
        }
        .wtElTreeC {
          flex: 1;
          overflow: auto;
          .wtElTree {
            height: 100%;
            overflow: auto;
          }
        }
      }
      .wtResultC {
        width: 300px;
        padding-left: 15px;
        display: flex;
        flex-direction: column;
        .wtSelectedName {
          height: 32px;
          line-height: 32px;
          font-size: 16px;
          margin-bottom: 10px;
        }
        .wtSelectedC {
          flex: 1;
          overflow: auto;
        }
      }
    }
    .advancedSearchListC {
      flex: 1;
      overflow: auto;
      .cell {
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        cursor: pointer;
        &:hover {
          background-color: #f5f7fa;
        }
      }
      .advancedSearchEmpty {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #6f7180;
        font-size: 14px;
      }
    }
    .advancedSearchTip {
      text-align: center;
      height: 30px;
      line-height: 40px;
      color: #6f7180;
    }
    .wtSelectedCell {
      min-height: 26px;
      display: flex;
      align-items: flex-start;
      &:hover {
        background-color: #f5f7fa;
      }
    }
    .el-tree-node__expand-icon {
      padding: 4px !important;
      font-size: 16px !important;
    }
    .el-tree-node__expand-icon, .el-tree-node__children.collapse-transition {
      transition-duration: 0.15s, 0.15s !important;
    }
    .el-tree-node__content {
      height: initial !important;
    }
    .wtUserRoleGroupC {
      display: flex !important;
      margin-bottom: 10px;
      & > button {
        flex: 1 !important;
      }
    }
  }
</style>
