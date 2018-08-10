<template>
  <div class="comContainer_wsd">
    <div class="deptC">
      <el-tag v-for="(el, index) in selectedDeptList" :key="index" size="medium"
        class="deptTag" type="info" closable @close="handleRemoveDeptTag(index)">{{el.label}}</el-tag>
      <el-button v-if="selectedDeptList.length === 0" @click="handleLoadAllDeptData" type="text" icon="el-icon-plus">添加</el-button>
      <el-button v-else @click="handleLoadAllDeptData" type="text">修改</el-button>
    </div>

    <wisTree :dialogVisible.sync="dialogVisible" :title="title"
      showType="all" :allData="allDeptData"
      :deptIdsList.sync="selectedDeptList"></wisTree>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { Tag } from 'element-ui'
import { mapDeptData } from '../../utils/common.js'

const wisTree = () => import('./wisTree.vue')

export default {
  props: {
    title: {
      type: String,
      default: '部门'
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
    this.selectedDeptList = this.value
  },
  mounted () {},
  data () {
    return {
      dialogVisible: false,
      allDeptData: [],
      selectedDeptList: []
    }
  },
  computed: {},
  watch: {
    value (v) {
      this.selectedDeptList = v
    },
    selectedDeptList (v) {
      this.$emit('update:value', v)
    }
  },
  filters: {},
  methods: {
    ...mapActions('common', ['listAllDept']),

    async handleLoadAllDeptData () {
      if (this.allDeptData && this.allDeptData.length > 0) {
        this.dialogVisible = true
      } else {
        let res = await this.listAllDept({
          /* 部门类型，1：行政部门；2：年级部门；3：班级部门，参数不传是查询全部 */
          deptType: this.deptType,
          wisLoading: false
        })
        this.allDeptData = mapDeptData((res.data || []))
        this.dialogVisible = true
      }
    },
    handleRemoveDeptTag (index) {
      let tmp = [...this.selectedDeptList]
      tmp.splice(index, 1)
      this.selectedDeptList = tmp
    }
  }
}
</script>

<style scoped lang="scss">
  .comContainer_wisSelectDept {
    & .deptC {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      min-height: 30px;
      & .deptTag {
        margin: 0 5px 5px 0;
      }
    }
  }
</style>
