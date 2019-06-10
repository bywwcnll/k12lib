import { cloneDeep, isEmpty } from 'lodash'

const recordListDataInitData = {
  pageNum: 1,
  pageSize: 20,
  rows: [],
  totalCount: 0,
  totalPage: 1
}

export default {
  async created () {
  },
  async mounted () {
  },
  data () {
    return {
      showFilterFlag: false,
      
      isLoading: false,
      recordListData: {...recordListDataInitData},
      recordListRows: []
    }
  },
  computed: {
    searchAndFilterAttrs () {
      let t = {};
      ['filterList', 'filterParams', 'filterDisplayDataList', 'setFilterParams', 'resetFilterParams',
        'loadMore', 'recordListRows', 'showNoMore'].forEach(el => t[el] = this[el])
      return t
    },
    searchAndFilterListener () {
      let t = {};
      ['showSearch', 'searchChange'].forEach(el => t[el] = this[el]);
      ['searchCancel', 'filterConfirm', 'resetFilter'].forEach(el => t[el] = this.refreshList)
      return t
    },
    filterParamsObj () {
      let { filterParams } = this
      let result = {}
      if (!isEmpty(filterParams)) {
        Object.keys(filterParams).filter(key => filterParams[key].id !== null).forEach(key => {
          let keyLength = Object.keys(filterParams[key]).length
          if (keyLength === 2) {
            result[key] = filterParams[key].id
          } else if (keyLength > 2) {
            let tmp = cloneDeep(filterParams[key])
            delete tmp.name
            result[key] = JSON.stringify(tmp)
          }
        })
      }
      return result
    },
    showNoMore () {
      let rlrLength = this.recordListRows.length
      let rldTotalCount = this.recordListData.totalCount
      return rldTotalCount > 0 && rlrLength >= rldTotalCount
    }
  },
  watch: {},
  filters: {},
  methods: {
    showSearch () {
      this.isLoading = true
      this.resetListData()
    },
    searchChange (v, flag) {
      this.isLoading = false
      if (flag) {
        this.resetListData()
        this.getRecordList(true, { keyWord: v })
      }
    },
    async refreshList () {
      this.isLoading = true
      this.resetListData()
      await this.getRecordList()
      this.isLoading = false
    },
    
    resetListData () {
      this.recordListData = { ...recordListDataInitData }
      this.recordListRows = []
    },
    async getRecordList (exeLoading = true, extraParams = {}) {
      if (exeLoading) this.$wisLoading(true)
      let { recordListData, filterParamsObj } = this
      let { pageNum, pageSize } = recordListData
      let params = {
        pageRequest: {
          pageNum,
          pageSize
        },
        ...filterParamsObj,
        ...extraParams
      }
      let res = await this.commonListRequest(params)
      if (res.data) {
        res.data.pageNum += 1
        this.recordListRows = [...this.recordListRows, ...(res.data.rows || [])]
        this.recordListData = res.data
      } else {
        this.recordListData = {...recordListDataInitData}
        this.recordListRows = []
      }
      if (exeLoading) this.$wisLoading(false)
    },
    async loadMore () {
      let { pageNum, totalPage } = this.recordListData
      if (pageNum <= totalPage) {
        this.isLoading = true
        await this.getRecordList()
        this.isLoading = false
      }
    }
  },
  beforeRouteLeave (to, from, next) {
    if (this.showFilterFlag) {
      this.showFilterFlag = false
      next(false)
    } else {
      next()
    }
  }
}
