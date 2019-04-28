<template>
  <div class="comContainer_wsdu">
    <div class="deptUserC">
      <template v-if="computedShowDeptFlag">
        <el-tag v-for="(el, index) in renderSelectedUserList" :key="index" size="medium"
        class="deptUserTag" type="info" closable @close="handleRemoveUserTag(index)">{{el.label}}</el-tag>
      </template>
      <template v-else>
        <div v-for="(el, index) in renderSelectedUserList" :key="index" class="deptUserImgC">
          <img :src="el.avatar" alt="" class="deptUserImg">
          <div class="closeI" @click="handleRemoveUserTag(index)">
            <i class="el-icon-circle-close"></i>
          </div>
        </div>
      </template>
      <el-button v-if="selectedUserList.length === 0" @click="dialogVisible = true" type="text" icon="el-icon-plus">添加</el-button>
      <el-button v-else @click="dialogVisible = true" type="text">修改</el-button>
    </div>

    <wisTree ref="wisTreeDom" :dialogVisible.sync="dialogVisible" :hideSearch="true"
             :deptIdsList.sync="selectedUserList" :title="title" :customTitle="customTitle"
             :showAdvancedSearchFlag="showAdvancedSearchFlag && selectedType !== 1" adSearchPlaceholder="按姓名和手机号搜索" :advancedLoad="handleAdvancedLoad"
             :showTagListFlag="showTagListFlag" :tagList="tagList"
             :deptLoad="handleDeptLoad" :limit="limit" :parentMode="parentMode"
             @confirm="handleTreeConfirm"
             @tagChange="handleTagChange"></wisTree>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { Tag } from 'element-ui'

const wisTree = () => import('./wisTree.vue')

export default {
  props: {
    title: {
      type: String,
      default: '部门人员'
    },
    customTitle: {
      type: Object,
      default () {
        return {}
      }
    },
    /* 选择类型： 0：部门和人员   1：部门   2：人员 */
    selectedType: {
      type: Number,
      default: 0
    },
    initDeptId: {
      type: String,
      default: ''
    },
    deptType: {
      type: String,
      default: ''
    },
    userType: {
      type: String,
      default: ''
    },
    value: {
      type: Array,
      default: () => []
    },
    enableDept: {
      type: Boolean,
      default: false
    },
    defaultDeptData: Array,
    limit: Number,
    customTreeLoad: Function,
    customSearchLoad: Function,
    searchResFilter: Function,
    showAdvancedSearchFlag: Boolean,
    showTagListFlag: Boolean,
    tagList: Array,
    parentMode: Boolean
  },
  components: {
    [Tag.name]: Tag,
    wisTree
  },
  created () {
    this.selectedUserList = this.value
    this._deptType = this.deptType
    this._userType = this.userType
  },
  mounted () {},
  data () {
    return {
      dialogVisible: false,
      selectedUserList: [],
      _deptType: '',
      _userType: ''
    }
  },
  computed: {
    computedShowDeptFlag () {
      return this.enableDept || this.selectedType !== 2
    },
    renderSelectedUserList () {
      if (this.parentMode) {
        return (this.selectedUserList || []).map(el => {
          if (el.isUser && !/的家长$/.test(el.label)) el.label += '的家长'
          return el
        })
      }
      return this.selectedUserList
    },
    computedDefaultData () {
      return !this.contactsMode ? this.defaultDeptData : this.contactsDefaultData
    },
    computedCustomTreeLoad () {
      return !this.contactsMode ? this.customTreeLoad : this.contactsTreeLoad
    },
    computedCustomSearchLoad () {
      return !this.contactsMode ? this.customSearchLoad : this.contactsTreeSearch
    }
  },
  watch: {
    value (v) {
      this.selectedUserList = v
    },
    selectedUserList (v) {
      this.$emit('update:value', v)
    }
  },
  filters: {},
  methods: {
    ...mapActions('common', ['listSubDeptByDeptId', 'listUserByDeptId', 'searchDeptUserByKeyword', 'searchUserByKeyword']),

    async getAdvancedLoadRes (keyword) {
      if (this.computedCustomSearchLoad) {
        let customResult = await this.computedCustomSearchLoad(keyword)
        return customResult
      }
      if (this.computedDefaultData) {
        if (this.computedDefaultData.length === 0) {
          return []
        }
        let deptIds = this.computedDefaultData.filter(el => !el.isUser).map(el => el.value).join(',')
        let defaultUserList = this.computedDefaultData.filter(el => el.isUser).map(el => {
          el.userName = el.label
          el.userId = el.value
          delete el.label
          delete el.value
          return el
        })
        if (deptIds.length > 0) {
          let searchDeptUserRes = await this.searchDeptUserByKeyword({
            corpId: window.corpId,
            keyword,
            userType: this._userType,
            deptIds
          })
          let searchFilterResult = searchDeptUserRes.data || []
          if (this.searchResFilter) {
            searchFilterResult = this.searchResFilter(searchFilterResult)
          }
          defaultUserList = [...defaultUserList, ...searchFilterResult]
        }
        let uniqUserList = []
        defaultUserList.forEach(el => {
          if (uniqUserList.map(i => i.userId).indexOf(el.userId) === -1) {
            uniqUserList.push(el)
          }
        })
        return uniqUserList.filter(el => {
          return (el.userName || '').indexOf(keyword) > -1 ||
            (el.pinyinName || '').indexOf(keyword) > -1 ||
            (el.mobile || '').indexOf(keyword) > -1
        })
      }
      let res = await this.searchUserByKeyword({
        corpId: window.corpId,
        keyword,
        userType: this._userType
      })
      return res.data || []
    },
    async handleAdvancedLoad (keyword) {
      let result = await this.getAdvancedLoadRes(keyword)
      return result.map(el => {
        return {
          ...el,
          label: el.userName,
          value: el.userId,
          subDeptNum: 0,
          isUser: true,
          showDeptNames: true
        }
      })
    },
    handleTagChange (v) {
      switch (v) {
        case '教职工':
          this._deptType = ''
          this._userType = '1'
          break
        case '学生':
          this._deptType = '2'
          this._userType = '2'
          break
        case '家长':
          this._deptType = '2'
          this._userType = '3'
          break
      }
      this.$refs.wisTreeDom.forceRenderTree()
    },
    async handleDeptLoad (node, resolve) {
      let deptId = node.data && node.data.value ? node.data.value : (this.initDeptId ? this.initDeptId : -1)
      if (this.computedDefaultData && !node.data) {
        resolve(this.computedDefaultData)
        return
      }
      if (+deptId === -1) {
        if (this.computedDefaultData) {
          resolve(this.computedDefaultData)
          return
        } else if (this.refreshContactsList) {
          let contactsListResult = await this.refreshContactsList()
          resolve(contactsListResult)
          return
        }
      }
      if (this.computedCustomTreeLoad) {
        let customResult = await this.computedCustomTreeLoad(node.data, {
          selectedType: this.selectedType
        })
        if (customResult instanceof Array) {
          resolve(customResult)
        } else if (customResult.hasOwnProperty('data')) {
          resolve((customResult.data || []).map(el => {
            return {
              ...el,
              showDeptNames: customResult.showDeptNamesFlag
            }
          }))
        } else {
          resolve(customResult)
        }
        return
      }
      let subDeptNum = node.data && node.data.subDeptNum ? node.data.subDeptNum : 0
      if (subDeptNum > 0 || deptId === -1) {
        let subDeptRes = await this.listSubDeptByDeptId({ deptId, deptType: this._deptType })
        let userRes = {}
        if (this.selectedType === 0 || this.selectedType === 2) {
          userRes = await this.listUserByDeptId({ deptId, userType: this._userType })
        }
        let subDeptList = (subDeptRes.data || []).map(el => {
          return {
            label: el.deptName,
            value: el.deptId,
            subDeptNum: 1,
            pinyinName: el.pinyinName,
            disabled: !this.computedShowDeptFlag
          }
        })
        let userList = (userRes.data || []).map(el => {
          return {
            label: el.userName,
            value: el.userId,
            subDeptNum: 0,
            isUser: true,
            pinyinName: el.pinyinName,
            avatar: el.avatar
          }
        })
        resolve([...subDeptList, ...userList])
      } else {
        let userRes = {}
        if (this.selectedType === 0 || this.selectedType === 2) {
          userRes = await this.listUserByDeptId({ deptId, userType: this._userType })
        }
        resolve((userRes.data || []).map(el => {
          return {
            label: el.userName,
            value: el.userId,
            subDeptNum: 0,
            isUser: true,
            pinyinName: el.pinyinName,
            avatar: el.avatar
          }
        }))
      }
    },
    handleRemoveUserTag (index) {
      let tmp = [...this.selectedUserList]
      tmp.splice(index, 1)
      this.selectedUserList = tmp
    },
    handleTreeConfirm (data) {
      this.$emit('confirm', data)
    }
  }
}
</script>

<style scoped lang="scss">
  .comContainer_wsdu {
    .deptUserC {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      margin-top: 10px;
      min-height: 34px;
      .deptUserImgC {
        display: inline-block;
        margin-right: 5px;
        position: relative;
        .deptUserImg {
          display: inline-block;
          width: 60px;
          height: 60px;
          box-shadow: 3px 3px 6px #ddd;
          & > img {
            display: block;
          }
        }
        .closeI {
          cursor: pointer;
          position: absolute;
          width: 18px;
          height: 18px;
          right: -5px;
          top: -5px;
          color: #666;
          background-color: #fff;
          border-radius: 100%;
          & > i {
            position: absolute;
            font-size: 20px;
            right: 0;
            top: 1px;
          }
        }
      }
      .deptUserTag {
        margin: 0 5px 5px 0;
      }
    }
  }
</style>
