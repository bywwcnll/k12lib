<template>
  <cell :title="title" is-link @click.native="onClick" :class="{hiddenCell: templateType !== 0}" :required="required"
        :valueAlign="valueAlign">
    <div v-if="templateType === 0" ref="clampDom" class="clampCellValue">
      <span v-if="displayStr">{{displayStr}}</span>
      <span v-else-if="placeholder" class="placeholder">{{placeholder}}</span>
    </div>
    <k12-tree v-if="showK12TreeFlag" ref="k12TreeDom" v-model="selectedList" :key="k12TreeKey" :show.sync="showTreeFlag" :load="onTreeLoad"
              :defaultDeptId="defaultDeptId" :limit="limit" :onlySelectUser="selectedType === 2"
              :showSearch="selectedType !== 1" :searchLoad="onSearchLoad" :clearSearchValAfterConfirm="clearSearchValAfterConfirm"
              :parentMode="parentMode"
              @confirm="onTreeConfirm"></k12-tree>
  </cell>
</template>

<script>
import { mapActions } from 'vuex'
import { Cell, K12Tree } from 'k12vux'

export default {
  props: {
    value: {
      type: Array,
      default () {
        return []
      }
    },
    /* 模板类型： 0：cell   1：popup */
    templateType: {
      type: Number,
      default: 0
    },
    title: {
      type: String,
      default: '标题'
    },
    /* 选择类型： 0：部门和人员   1：部门   2：人员 */
    selectedType: {
      type: Number,
      default: 0
    },
    defaultDeptId: {
      type: String,
      default: '-1'
    },
    defaultDeptData: Array,
    limit: {
      type: Number,
      default: 0
    },
    displayStrFormat: Function,
    customTreeLoad: Function,
    customSearchLoad: Function,
    searchResFilter: Function,
    clearSearchValAfterConfirm: Boolean,
    deptType: String,
    userType: String,
    show: Boolean,
    placeholder: {
      type: String,
      default: '请选择'
    },
    required: Boolean,
    valueAlign: {
      type: String,
      default: 'right'
    },
    parentMode: Boolean
  },
  components: {
    Cell,
    K12Tree
  },
  created () {},
  mounted () {},
  data () {
    return {
      k12TreeKey: 'k12Tree_' + Math.random() * 10 ** 16,
      showTreeFlag: this.show,
      selectedList: [...this.value],
      showK12TreeFlag: true
    }
  },
  computed: {
    displayStr () {
      if (this.displayStrFormat) {
        return this.displayStrFormat(this.selectedList)
      }
      switch (this.selectedType) {
        case 0: return this.selectedList.map(el => el.deptName || el.userName).join('、')
        case 1: return this.selectedList.map(el => el.deptName).join('、')
        case 2: return this.selectedList.map(el => el.userName).join('、')
      }
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
      this.selectedList = v
    },
    selectedList (v) {
      this.$emit('input', v)
    },
    show (v) {
      this.showTreeFlag = v
    },
    showTreeFlag (v) {
      this.$emit('update:show', v)
    }
  },
  filters: {},
  methods: {
    ...mapActions('common', ['listSubDeptByDeptId', 'listUserByDeptId', 'searchDeptUserByKeyword', 'searchUserByKeyword']),

    refresh () {
      this.showK12TreeFlag = false
      this.$nextTick(() => {
        this.showK12TreeFlag = true
      })
    },
    onClick () {
      this.showTreeFlag = true
    },
    async onTreeLoad (data) {
      let { deptType, userType } = this
      let { deptId } = data
      if (+deptId === -1 && this.defaultDeptData) {
        return this.defaultDeptData
      }
      if (+deptId === -1 && this.contactsMode) {
        if (this.contactsDefaultData) {
          return this.contactsDefaultData
        } else {
          let contactsListResult = await this.refreshContactsList()
          return contactsListResult
        }
      }
      if (this.computedCustomTreeLoad) {
        let customResult = await this.computedCustomTreeLoad(data, {
          selectedType: this.selectedType
        })
        return customResult
      }
      let subDeptRes = await this.listSubDeptByDeptId({ deptId, deptType })
      let userRes = {}
      if (this.selectedType === 0 || this.selectedType === 2) {
        userRes = await this.listUserByDeptId({ deptId, userType })
      }
      let deptList = subDeptRes.data || []
      let userList = userRes.data || []
      return deptList.concat(userList)
    },
    onTreeConfirm (data) {
      this.$emit('confirm', data)
    },
    onDeptPath (data, index) {
      this.$refs.k12TreeDom.onDeptPath(data, index)
    },
    async onSearchLoad (keyword) {
      if (this.computedCustomSearchLoad) {
        let customResult = await this.computedCustomSearchLoad(keyword)
        return customResult
      }
      if (this.computedDefaultData) {
        if (this.computedDefaultData.length === 0) {
          return []
        }
        let deptIds = this.computedDefaultData.filter(el => el.deptId && !el.userId).map(el => el.deptId).join(',')
        let defaultUserList = this.computedDefaultData.filter(el => !el.deptId && el.userId)
        if (deptIds.length > 0) {
          let searchDeptUserRes = await this.searchDeptUserByKeyword({
            corpId: window.corpId,
            keyword,
            userType: this.userType,
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
        userType: this.userType
      })
      return (res.data || [])
    }
  }
}
</script>

<style scoped lang="scss">
  .hiddenCell {
    display: none !important;
  }
  .placeholder {
    color: #ccc;
  }
  .clampCellValue {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    line-height: 20px;
    -webkit-line-clamp: 1;
    /*! autoprefixer: ignore next */
    -webkit-box-orient: vertical;
  }
</style>
