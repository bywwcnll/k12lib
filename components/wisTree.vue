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
                :render-content="renderContent"
                @check-change="onTreeChange"></el-tree>
              <el-tree v-if="showType === 'all'" ref="wtDeptsTree" class="wtElTree" show-checkbox
                :data="allData" :default-expanded-keys="defaultExpandedKeys"
                node-key="value" :check-strictly="true" :props="deptProps"
                :default-checked-keys="defaultCheckedKeys"
                :expand-on-click-node="false" :check-on-click-node="true"
                :filter-node-method="onFilterNode"
                :render-content="renderContent"
                @check-change="onTreeChange"></el-tree>
            </div>
          </template>
          <div v-show="advancedSearchValue" class="advancedSearchListC">
            <div v-for="(el, index) in advancedSearchList" :key="index" class="cell"
              @click="onTreeChange(el, true)">
              <svg class="wtDeptIcon" viewBox="0 0 1024 1024">
                <path d="M690.338 661.474c-41.498-18.374-103.937-65.868-195.163-82.197 23.332-24.985 40.564-63.996 58.672-110.231 10.528-26.786 8.425-49.62 8.425-82.185 0-24.002 4.507-62.528-1.502-83.71-20.073-71.577-71.002-91.29-130.507-91.29-59.583 0-110.473 19.828-130.557 91.452-5.848 21.24-1.355 59.627-1.355 83.548 0 32.623-1.764 55.56 8.787 82.359 18.247 46.477 35.683 85.444 58.865 110.347-90.428 16.525-148.928 63.73-190.16 82.047-85.32 38.11-83.219 79.828-83.219 79.828v70.698l685.644-0.128v-70.57c0-0.001-2.262-41.88-87.93-79.968zM659.56 227.805h271.187v59.352H659.56v-59.352zM659.56 357.765h165.782v60.375H659.56v-60.375z"/>
                <path d="M659.56 487.725h237.417V548.1H659.56v-60.375z"/>
              </svg>
              <div class="wtPersonDetail">
                <div class="wtPersonND">
                  <span class="wtPersonName" :title="el.label">{{el.label}}</span>
                  <span class="wtPersonDept" :title="el.deptNames">{{el.deptNames}}</span>
                </div>
                <div v-if="el.corpName" class="wtPersonCorpName" :title="el.corpName">@{{el.corpName}}</div>
              </div>
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
              <svg v-if="!el.isUser" class="wtDeptIcon" viewBox="0 0 1024 1024">
                <path d="M741 291.8h-56v-55c0-9.4-7.6-17-17-17H441v-56h227c40.3 0 73 32.7 73 73v55z"/>
                <path d="M917 920.2H107c-40.3 0-73-32.7-73-73v-671c0-40.3 32.7-73 73-73h292.6l127.1 161H917c40.3 0 73 32.7 73 73v510c0 40.3-32.7 73-73 73z m-810-761c-9.4 0-17 7.6-17 17v671c0 9.4 7.6 17 17 17h810c9.4 0 17-7.6 17-17v-510c0-9.4-7.6-17-17-17H499.6l-127.1-161H107z"/>
                <path d="M129.3 739.8H384v56H129.3z"/>
              </svg>
              <svg v-else class="wtDeptIcon" viewBox="0 0 1024 1024">
                <path d="M690.338 661.474c-41.498-18.374-103.937-65.868-195.163-82.197 23.332-24.985 40.564-63.996 58.672-110.231 10.528-26.786 8.425-49.62 8.425-82.185 0-24.002 4.507-62.528-1.502-83.71-20.073-71.577-71.002-91.29-130.507-91.29-59.583 0-110.473 19.828-130.557 91.452-5.848 21.24-1.355 59.627-1.355 83.548 0 32.623-1.764 55.56 8.787 82.359 18.247 46.477 35.683 85.444 58.865 110.347-90.428 16.525-148.928 63.73-190.16 82.047-85.32 38.11-83.219 79.828-83.219 79.828v70.698l685.644-0.128v-70.57c0-0.001-2.262-41.88-87.93-79.968zM659.56 227.805h271.187v59.352H659.56v-59.352zM659.56 357.765h165.782v60.375H659.56v-60.375z"/>
                <path d="M659.56 487.725h237.417V548.1H659.56v-60.375z"/>
              </svg>
              <div class="wtSCName">
                <div class="wtSCName1" :title="el.label">{{el.label}}</div>
                <div v-if="el.corpName" class="wtSCName2" :title="el.corpName">@{{el.corpName}}</div>
              </div>
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
import { Button, ButtonGroup, Dialog, Input, Tree } from 'element-ui'
import { debounce, isEmpty } from 'lodash'

export default {
  components: {
    [Button.name]: Button,
    [ButtonGroup.name]: ButtonGroup,
    [Dialog.name]: Dialog,
    [Input.name]: Input,
    [Tree.name]: Tree
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
    renderContent (h, { node, data, store }) {
      if (data.isUser) {
        /* 人员项 */
        return (
          <div class="el-tree-node__label wtPersonC">
            <svg class="wtDeptIcon" viewBox="0 0 1024 1024">
              <path d="M690.338 661.474c-41.498-18.374-103.937-65.868-195.163-82.197 23.332-24.985 40.564-63.996 58.672-110.231 10.528-26.786 8.425-49.62 8.425-82.185 0-24.002 4.507-62.528-1.502-83.71-20.073-71.577-71.002-91.29-130.507-91.29-59.583 0-110.473 19.828-130.557 91.452-5.848 21.24-1.355 59.627-1.355 83.548 0 32.623-1.764 55.56 8.787 82.359 18.247 46.477 35.683 85.444 58.865 110.347-90.428 16.525-148.928 63.73-190.16 82.047-85.32 38.11-83.219 79.828-83.219 79.828v70.698l685.644-0.128v-70.57c0-0.001-2.262-41.88-87.93-79.968zM659.56 227.805h271.187v59.352H659.56v-59.352zM659.56 357.765h165.782v60.375H659.56v-60.375z"/>
              <path d="M659.56 487.725h237.417V548.1H659.56v-60.375z"/>
            </svg>
            <span class="wtPersonName" title={data.label}>{data.label}</span>
          </div>
        )
      } else {
        return (
          <span class="el-tree-node__label comContainer_wisTree_ellipsis" title={node.label}>{node.label}</span>
        )
      }
    },
    onDialogClose () {
    },
    onFilterNode (value, data) {
      if (!value) return true
      return (data.label && data.label.indexOf(value) !== -1) || (data.pinyinName || data.pinyinName.indexOf(value) !== -1)
    },
    async onDeptLoad (node, resolve) {
      await this.deptLoad(node, (result) => {
        if (this.parentMode && result) {
          result = result.map(el => {
            if (el.isUser && !/的家长$/.test(el.label)) el.label += '的家长'
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
    onRemoveDept (data, deptIndex) {
      this.checkedDeptList.splice(deptIndex, 1)
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
    width: 540px;
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
      height: 330px;
      .wtTreeC {
        width: 260px;
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
        width: 240px;
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
        .wtPersonDetail {
          flex: 1;
          width: 0;
        }
        .wtPersonND {
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-height: 26px;
        }
        .wtPersonName {
          flex: 1;
          width: 0;
          @extend .comContainer_wisTree_ellipsis;
        }
        .wtPersonDept {
          text-align: right;
          font-size: 12px;
          color: #999;
          width: 100px;
          @extend .comContainer_wisTree_ellipsis;
        }
        .wtPersonCorpName {
          font-size: 12px;
          color: #FF6633;
          @extend .comContainer_wisTree_ellipsis;
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
      .wtSCName {
        flex: 1;
        width: 0;
        .wtSCName1 {
          min-height: 26px;
          line-height: 26px;
          @extend .comContainer_wisTree_ellipsis;
        }
        .wtSCName2 {
          font-size: 12px;
          color: #FF6633;
          @extend .comContainer_wisTree_ellipsis;
        }
      }
      .wtSCClose {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 26px;
        height: 26px;
        cursor: pointer;
      }
    }
    .el-tree-node__expand-icon {
      padding: 4px !important;
      font-size: 16px !important;
    }
    .el-tree-node__expand-icon, .el-tree-node__children.collapse-transition {
      transition-duration: 0.15s, 0.15s !important;
    }
    .wtPersonC {
      width: 0;
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .wtPersonName {
        flex: 1;
        width: 0;
      }
      .wtPersonMobile {
        width: 83px;
      }
    }
    .wtDeptIcon {
      fill: #6aace2;
      width: 26px;
      height: 26px;
      padding: 4px;
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
