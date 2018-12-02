<template>
  <div class="comContainer_wsdu">
    <div class="deptUserC">
      <template v-if="enableDept">
        <el-tag v-for="(el, index) in selectedUserList" :key="index" size="medium"
        class="deptUserTag" type="info" closable @close="handleRemoveUserTag(index)">{{el.label}}</el-tag>
      </template>
      <template v-else>
        <div v-for="(el, index) in selectedUserList" :key="index" class="deptUserImgC">
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
      :showAdvancedSearchFlag="showAdvancedSearchFlag" adSearchPlaceholder="按用户名和手机号搜索" :advancedLoad="handleAdvancedLoad"
      :showTagListFlag="showTagListFlag" :tagList="tagList"
      :deptLoad="handleDeptLoad" :limit="limit"
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
    showAdvancedSearchFlag: Boolean,
    showTagListFlag: Boolean,
    tagList: Array
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
  computed: {},
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
    ...mapActions('common', ['listSubDeptByDeptId', 'listUserByDeptId', 'searchUserByKeyword']),

    async handleAdvancedLoad (keyword) {
      let res = await this.searchUserByKeyword({
        corpId: window.corpId,
        keyword,
        userType: this._userType
      })
      return (res.data || []).map(el => {
        return {
          label: el.userName,
          value: el.userId,
          mobile: el.mobile,
          maskMobile: el.maskMobile,
          deptNames: el.deptNames,
          subDeptNum: 0,
          isUser: true,
          pinyinName: el.pinyinName,
          avatar: el.avatar
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
      if (this.defaultDeptData && !node.data) {
        resolve(this.defaultDeptData)
        return
      }
      let deptId = node.data && node.data.value ? node.data.value : (this.initDeptId ? this.initDeptId : -1)
      let subDeptNum = node.data && node.data.subDeptNum ? node.data.subDeptNum : 0
      if (subDeptNum > 0 || deptId === -1) {
        let [subDeptRes, userRes] = await Promise.all([
          this.listSubDeptByDeptId({ deptId, deptType: this._deptType }),
          this.listUserByDeptId({ deptId, userType: this._userType })
        ])
        let subDeptList = (subDeptRes.data || []).map(el => {
          return {
            label: el.deptName,
            value: el.deptId,
            subDeptNum: 1,
            pinyinName: el.pinyinName,
            disabled: !this.enableDept
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
        let userRes = await this.listUserByDeptId({ deptId })
        resolve((userRes.data || []).map(el => {
          return {
            label: el.userName,
            value: el.userId,
            subDeptNum: 0,
            isUser: true,
            pinyinName: el.pinyinName
          }
        }))
      }
    },
    handleRemoveUserTag (index) {
      let tmp = [...this.selectedUserList]
      tmp.splice(index, 1)
      this.selectedUserList = tmp
    }
  }
}
</script>

<style scoped lang="scss">
  .comContainer_wsdu {
    & .deptUserC {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      margin-top: 10px;
      min-height: 30px;
      & .deptUserImgC {
        display: inline-block;
        margin-right: 5px;
        position: relative;
        & .deptUserImg {
          display: inline-block;
          width: 60px;
          height: 60px;
          box-shadow: 3px 3px 6px #ddd;
          & > img {
            display: block;
          }
        }
        & .closeI {
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
      & .deptUserTag {
        margin: 0 5px 5px 0;
      }
    }
  }
</style>
