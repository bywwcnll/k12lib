<script>
  import { mapActions } from 'vuex'
  import { wisSelectDeptUser } from 'k12lib'

  const buildDept = (data = [], enableDept = false) => {
    return data.map(el => {
      return {
        ...el,
        label: el.deptName,
        value: el.deptId,
        subDeptNum: 1,
        pinyinName: el.pinyinName,
        disabled: !enableDept
      }
    })
  }
  const buildUser = (data = [], extraAttrs = []) => {
    return data.map(el => {
      let tmp = {
        ...el,
        label: el.userName,
        value: el.userId,
        subDeptNum: 0,
        isUser: true,
        pinyinName: el.pinyinName
      }
      extraAttrs.forEach(key => {
        tmp[key] = el[key]
      })
      return tmp
    })
  }

  const transDeptData = (data = [], isGroup = false) => {
    return data.map(el => {
      if (isGroup) {
        return {
          ...el,
          label: el.groupName,
          value: el.groupId,
          _groupId: el.groupId
        }
      } else {
        return {
          ...el,
          label: el.deptName,
          value: el.deptId,
          subDeptNum: 1
        }
      }
    })
  }
  const transUserData = (data = []) => {
    return data.map(el => {
      return {
        ...el,
        isUser: true,
        label: el.userName,
        value: el.userId,
        subDeptNum: 0
      }
    })
  }

  export default {
    extends: wisSelectDeptUser,
    props: {
      transValue: Object,
      contactsDefaultData: Array,
      unTransValueData: Array,
      request: {
        type: Function,
        required: true
      }
    },
    async created () {
      await this.refreshTransValueData()
    },
    mounted () {
      this.$on('confirm', (data = []) => {
        this.$emit('contactsConfirm', {
          data,
          contactsUserAddParams: this.buildContactsDataUtil(data)
        })
      })
      this.$on('update:value', (data = []) => {
        this.$emit('update:transValue', this.buildContactsDataUtil(data))
      })
    },
    data () {
      return {
        contactsMode: true,
        transValueData: null
      }
    },
    computed: {},
    watch: {
      unTransValueData (v) {
        this.refreshTransValueData()
      },
      transValueData (v) {
        if (v instanceof Array) {
          this.selectedUserList = v
        }
      }
    },
    filters: {},
    methods: {
      ...mapActions('common', ['listSubDeptByDeptId', 'listUserByDeptId']),
      ...mapActions('contacts', ['contactsUserPage']),
      ...mapActions('corpUser', ['userGetMyDepts']),
      ...mapActions('corpUserSelect', ['userSelectMenuList', 'userSelectSearch', 'userSelectTranslate']),

      buildContactsDataUtil (data = []) {
        let groupIds = data.filter(el => el._groupId).map(el => el._groupId)
        let userTypes = data.filter(el => el._menuType === '3').map(el => Number(el._menuParam))
        let deptIds = [
          ...data.filter(el => el._menuType === '4').map(el => Number(el._menuParam)),
          ...data.filter(el => el._slaveCorpDeptId).map(el => el._slaveCorpDeptId),
          ...data.filter(el => el.subDeptNum && !el.hasOwnProperty('groupMode')).map(el => el.value)
        ]
        let userIds = data.filter(el => el.isUser).map(el => el.value)
        return {
          groupIds,
          userTypes,
          deptIds,
          userIds
        }
      },
      async transGDUUtil (g, d, u) {
        let res = await this.userSelectTranslate({
          selectedGroupIds: (g || []).map(el => el.groupId),
          selectedDepIds: (d || []).map(el => el.deptId),
          selectedUserIds: (u || []).map(el => el.userId)
        })
        res.data = res.data || {}
        g = res.data.groupList || []
        d = res.data.deptList || []
        u = res.data.userList || []
        return [
          ...transDeptData(g || [], true),
          ...transDeptData(d || []),
          ...transUserData(u || [])
        ]
      },

      async refreshTransValueData () {
        let v = this.unTransValueData
        if (v instanceof Array && v.length > 0) {
          this.transValueData = await this.transGDUUtil.apply(null, v)
        }
      },
      async refreshContactsList () {
        let res = await this.userSelectMenuList()
        let menuList = res.data || []
        return menuList.map(el => {
          let groupMode = el.menuType === '1' || el.menuType === '2'
          let result = {
            label: el.menuName,
            value: JSON.stringify(el),
            subDeptNum: 1,
            pinyinName: null,
            disabled: groupMode || !this.enableDept,
            groupMode,
            jsonData: JSON.stringify(el)
          }
          Object.keys(el).forEach(key => {
            result[`_${key}`] = el[key]
          })
          if (result._menuType === '4') {
            result.value = result._menuParam
          }
          return result
        })
      },
      addPrivateAttr (data = [], extraAttr = {}) {
        return data.map(el => {
          return { ...el, ...extraAttr }
        })
      },
      async requestGroup (api) {
        let res = await this.request({
          url: api,
          method: 'POST'
        })
        return (res.data || []).map(el => {
          let tmp = {
            value: el.groupId || el.slaveCorpDeptId,
            label: el.groupName || el.slaveCorpName
          }
          if (el.groupId) tmp._groupId = el.groupId
          if (el.slaveCorpDeptId) tmp._slaveCorpDeptId = el.slaveCorpDeptId
          return tmp
        })
      },
      async commonRequestList (subDeptParams = {}, userParams = {}, willAddPrivateAttr = {}) {
        let subDeptRes = await this.listSubDeptByDeptId(subDeptParams)
        let userRes = await this.listUserByDeptId(userParams)
        let deptList = buildDept(this.addPrivateAttr(subDeptRes.data, willAddPrivateAttr), this.enableDept)
        let userList = buildUser(userRes.data || [])
        return deptList.concat(userList)
      },
      async requestMenuParam1 (deptId = -1) {
        let deptType = 1
        let res = await this.commonRequestList({ deptId, deptType },
          { deptId, userType: 1 },
          { _menuParam: 1, _deptType: deptType })
        if (res && res.length === 1 && !res[0].isUser) {
          let subDeptId = res[0].value
          const result = await this.commonRequestList({ deptId: subDeptId, deptType },
            { deptId: subDeptId, userType: 1 },
            { _menuParam: 1, _deptType: deptType })
          return result
        } else {
          return this.addPrivateAttr(res, { _menuParam: 1, _deptType: deptType })
        }
      },
      async requestMenuParamPS (menuParam) {
        let deptType = 2
        let res1 = await this.userGetMyDepts({
          deptTypes: [3],
          ignoreDeptType: false
        })
        if (res1.data && res1.data.length === 1 && res1.data[0].deptId) {
          let deptId = res1.data[0].deptId
          const result = await this.commonRequestList({ deptId, deptType },
            { deptId, userType: menuParam },
            { _menuParam: menuParam, _deptType: deptType })
          return result
        } else {
          return this.addPrivateAttr(res1.data, { _menuParam: menuParam, _deptType: deptType })
        }
      },
      async contactsTreeLoad (data = {}) {
        let result = null
        let { value: deptId, _deptType, _groupId, _slaveCorpDeptId, _menuParam, jsonData } = data
        if (jsonData && /^{"/.test(jsonData)) {
          let { _api, _menuType, groupMode } = data
          if (groupMode && _api) {
            /* 处理常用联系人分组和下属单位列表 */
            result = await this.requestGroup(_api)
            return result
          } else if (_menuType === '3') {
            if (_menuParam === '1') {
              /* 处理教职工列表 */
              result = await this.requestMenuParam1()
              return result
            } else {
              /* 处理家长和学生列表 */
              result = await this.requestMenuParamPS(_menuParam)
              return result
            }
          } else if (_menuType === '4') {
            /* 处理本单位部门列表 */
            result = await this.requestMenuParam1(_menuParam)
            return result
          }
        }
        /* 处理常用联系人分组用户列表 */
        if (_groupId) {
          let contactRes = await this.contactsUserPage({ groupId: _groupId, pageRequest: { pageNum: 1, pageSize: -1 } })
          return {
            data: buildUser(contactRes.data && contactRes.data.rows ? contactRes.data.rows : [], ['deptNames', 'corpName']),
            showDeptNamesFlag: true
          }
        }
        /* 处理下属单位用户列表 */
        if (_slaveCorpDeptId) {
          result = await this.requestMenuParam1(_slaveCorpDeptId)
          return result
        }
        /* 处理通常情况 */
        result = await this.commonRequestList({ deptId, deptType: _deptType },
          { deptId, userType: _menuParam },
          { _menuParam, _deptType })
        return result
      },
      async contactsTreeSearch (keyword) {
        let res = await this.userSelectSearch({
          keyword,
          scopes: ['contacts', 'circleCorp', 'dept']
        })
        return res.data || []
      }
    }
  }
</script>
