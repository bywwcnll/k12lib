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
    if (this.pageNumStart !== null && this.pageNumStart >= 0) {
      recordListDataInitData.pageNum = this.pageNumStart
    }
    this.recordListData = cloneDeep(recordListDataInitData)
  },
  async mounted () {
  },
  data () {
    return {
      showFilterFlag: false,
  
      safKeyWord: '',
      isLoading: false,
      recordListData: cloneDeep(recordListDataInitData),
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
        this.safKeyWord = v
        this.getRecordList()
      }
    },
    async refreshList () {
      this.isLoading = true
      this.resetListData()
      await this.getRecordList()
      this.isLoading = false
    },
    
    resetListData () {
      this.safKeyWord = ''
      this.recordListData = cloneDeep(recordListDataInitData)
      this.recordListRows = []
    },
    getInfiniteListCDom () {
      let childrenList = this.$children || []
      for (let i = 0; i < childrenList.length; i++) {
        let { className } = childrenList[i].$el || {}
        if ((className || '').indexOf('comContainer_wisSAFList') > -1) {
          return (childrenList[i].$refs || {}).infiniteListCDom
        }
      }
    },
    async getRecordList (exeLoading = true, extraParams = {}) {
      let element = this.getInfiniteListCDom() || {}
      if (element && element.scrollTop > 0 && isEmpty(this.recordListRows)) return
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
      if (this.safKeyWord) params.keyWord = this.safKeyWord
      let res = await this.commonListRequest(params)
      if (res.data) {
        res.data.pageNum += 1
        this.recordListRows = [...this.recordListRows, ...(res.data.rows || [])]
        this.recordListData = res.data
      } else {
        this.recordListData = cloneDeep(recordListDataInitData)
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
