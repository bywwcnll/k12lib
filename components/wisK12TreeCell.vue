<template>
  <cell :title="title" is-link @click.native="onClick" :class="{hiddenCell: templateType !== 0}" :required="required">
    <div v-if="templateType === 0" ref="clampDom">
      <span v-if="displayStr">{{displayStr}}</span>
      <span v-else-if="placeholder" class="placeholder">{{placeholder}}</span>
    </div>
    <k12-tree ref="k12TreeDom" v-model="selectedList" :show.sync="showTreeFlag" :load="onTreeLoad"
      :defaultDeptId="defaultDeptId" :limit="limit" :onlySelectUser="selectedType === 2"
      @confirm="onTreeConfirm"></k12-tree>
  </cell>
</template>

<script>
import { mapActions } from 'vuex'
import { Cell, K12Tree } from 'k12vux'
import $clamp from 'clamp-js'

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
    deptType: String,
    userType: String,
    show: Boolean,
    placeholder: {
      type: String,
      default: '请选择'
    },
    required: Boolean
  },
  components: {
    Cell,
    K12Tree
  },
  created () {},
  mounted () {
    if (this.templateType === 0) {
      $clamp(this.$refs.clampDom, {clamp: 1})
    }
  },
  data () {
    return {
      showTreeFlag: this.show,
      selectedList: [...this.value]
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
    ...mapActions('common', ['listSubDeptByDeptId', 'listUserByDeptId']),

    onClick () {
      this.showTreeFlag = true
    },
    async onTreeLoad (data) {
      let { deptType, userType } = this
      let { deptId } = data
      if (deptId === '-1' && this.defaultDeptData && this.defaultDeptData.length > 0) {
        return this.defaultDeptData
      }
      if (this.customTreeLoad) {
        let customResult = await this.customTreeLoad(data, {
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
</style>