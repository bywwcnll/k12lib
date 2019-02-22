<script>
import { mapActions } from 'vuex'
import wisK12TreeCell from './wisK12TreeCell'

export default {
  extends: wisK12TreeCell,
  props: {
    contactsDefaultData: Array,
    request: {
      type: Function,
      required: true
    }
  },
  async created () {},
  mounted () {
    this.$on('confirm', (data = []) => {
      this.$emit('contactsConfirm', {
        data,
        contactsUserAddParams: this.parseContactsData(data)
      })
    })
  },
  data () {
    return {
      contactsMode: true
    }
  },
  computed: {},
  watch: {},
  filters: {},
  methods: {
    ...mapActions('common', ['listSubDeptByDeptId', 'listUserByDeptId']),
    ...mapActions('contacts', ['contactsUserPage']),
    ...mapActions('corpUser', ['userGetMyDepts']),
    ...mapActions('corpUserSelect', ['userSelectMenuList', 'userSelectSearch']),

    parseContactsData (data = []) {
      let selectedGroupIds = data.filter(el => el._groupId).map(el => el._groupId)
      let selectedUserTypes = data.filter(el => el._menuType === '3').map(el => Number(el._menuParam))
      let selectedDepIds = [
        ...data.filter(el => el._menuType === '4').map(el => Number(el._menuParam)),
        ...data.filter(el => el._slaveCorpDeptId).map(el => el._slaveCorpDeptId),
        ...data.filter(el => el.deptId && el.deptPath).map(el => el.deptId)
      ]
      let selectedUserIds = data.filter(el => el.userId).map(el => el.userId)
      return {
        selectedGroupIds,
        selectedUserTypes,
        selectedDepIds,
        selectedUserIds
      }
    },
    async refreshContactsList () {
      let res = await this.userSelectMenuList()
      let menuList = res.data || []
      return menuList.map(el => {
        let result = {
          deptId: JSON.stringify(el),
          deptName: el.menuName,
          groupMode: el.menuType === '1' || el.menuType === '2',
          jsonData: JSON.stringify(el)
        }
        Object.keys(el).forEach(key => {
          result[`_${key}`] = el[key]
        })
        if (result._menuType === '4') {
          result.deptId = Number(result._menuParam)
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
          deptId: el.groupId || el.slaveCorpDeptId,
          deptName: el.groupName || el.slaveCorpName
        }
        if (el.groupId) tmp._groupId = el.groupId
        if (el.slaveCorpDeptId) tmp._slaveCorpDeptId = el.slaveCorpDeptId
        return tmp
      })
    },
    async commonRequestList (subDeptParams = {}, userParams = {}, willAddPrivateAttr = {}) {
      let subDeptRes = await this.listSubDeptByDeptId(subDeptParams)
      let userRes = await this.listUserByDeptId(userParams)
      let deptList = this.addPrivateAttr(subDeptRes.data, willAddPrivateAttr)
      let userList = userRes.data || []
      return deptList.concat(userList)
    },
    async requestMenuParam1 (deptId = -1) {
      let deptType = 1
      let res = await this.commonRequestList({ deptId, deptType },
        { deptId, userType: 1 },
        { _menuParam: 1, _deptType: deptType })
      if (res && res.length === 1 && res[0].deptId) {
        let subDeptId = res[0].deptId
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
      let { deptId, _deptType, _groupId, _slaveCorpDeptId, _menuParam, jsonData } = data
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
        return contactRes.data && contactRes.data.rows ? contactRes.data.rows : []
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
