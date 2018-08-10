<template>
  <div class="comContainer_wsdu">
    <div class="deptUserC">
      <div v-for="(el, index) in selectedUserList" :key="index" class="deptUserImgC">
        <img :src="el.avatar" alt="" class="deptUserImg">
        <div class="closeI" @click="handleRemoveUserTag(index)">
          <i class="el-icon-circle-close"></i>
        </div>
      </div>
      <!-- <el-tag v-for="(el, index) in selectedUserList" :key="index"
        class="deptUserTag" type="info" closable @close="handleRemoveUserTag(index)">{{el.label}}</el-tag> -->
      <el-button v-if="selectedUserList.length === 0" @click="dialogVisible = true" type="text" icon="el-icon-plus">添加</el-button>
      <el-button v-else @click="dialogVisible = true" type="text">修改</el-button>
    </div>

    <wisTree :dialogVisible.sync="dialogVisible"
      :deptIdsList.sync="selectedUserList" :title="title"
      :deptLoad="handleInspectorLoad"></wisTree>
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
    deptType: {
      type: String,
      default: ''
    },
    value: {
      type: Array,
      default: () => []
    }
  },
  components: {
    [Tag.name]: Tag,
    wisTree
  },
  created () {
    this.selectedUserList = this.value
  },
  mounted () {},
  data () {
    return {
      dialogVisible: false,
      selectedUserList: []
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
    ...mapActions('common', ['listSubDeptByDeptId', 'listUserByDeptId']),

    async handleInspectorLoad (node, resolve) {
      let deptId = node.data && node.data.value ? node.data.value : -1
      let subDeptNum = node.data && node.data.subDeptNum ? node.data.subDeptNum : 0
      if (subDeptNum > 0 || deptId === -1) {
        let [subDeptRes, userRes] = await Promise.all([
          this.listSubDeptByDeptId({ deptId, deptType: this.deptType, wisLoading: false }),
          this.listUserByDeptId({ deptId, wisLoading: false })
        ])
        let subDeptList = (subDeptRes.data || []).map(el => {
          return {
            label: el.deptName,
            value: el.deptId,
            subDeptNum: 1,
            pinyinName: el.pinyinName,
            disabled: true
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
        let userRes = await this.listUserByDeptId({ deptId, wisLoading: false })
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
  .comContainer_wisSelectDeptUser {
    & .deptUserC {
      display: flex;
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
