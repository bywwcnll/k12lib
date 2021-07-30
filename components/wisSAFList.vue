<template>
  <div class="comContainer_wisSAFList">
    <div class="safContainer">
      <div class="placeHolderC">
        <div class="searchC">
          <search ref="searchDom" v-model="tmpSearchVal" auto-scroll-to-top position="absolute" :placeholder="placeholder"
                  @on-change="onSearchChange" @on-cancel="onSearchCancel" :debounce="800"></search>
        </div>
        <div v-show="!showSearchFlag" class="sfC">
          <div class="searchAndFilterC">
            <div @click="onShowSearch"><img :src="searchIcon" alt="">搜索</div>
            <div @click="showPopupFlag = true"><img :src="filterIcon" alt="">筛选</div>
          </div>
        </div>
      </div>
      <div v-if="!isEmpty(filterDisplayDataList)" class="filterDisplayC">
        <div>
          <span>筛选条件:</span>
          <span v-for="(el, index) in filterDisplayDataList" :key="`fdd_${index}`">{{el}}</span>
        </div>
        <img @click="onResetFilter" :src="closeIcon" class="filterCloseImg"/>
      </div>
    </div>
    <div ref="infiniteListCDom" class="infiniteListC">
      <div v-infinite-scroll="loadMore"
           infinite-scroll-disabled="isLoading"
           infinite-scroll-distance="10"
           infinite-scroll-immediate-check="false">
        <slot></slot>
        <wisWarning v-if="recordListRows.length <= 0" type="empty" style="margin-top: 70px;"></wisWarning>
        <div v-show="showNoMore" class="com_hasNoData">~没有更多了~</div>
      </div>
    </div>

    <div v-transfer-dom>
      <popup v-model="showPopupFlag" v-bind="bindPopupAttrs">
        <div class="mobilePageContainer wisSAF_popupC">
          <div class="mainC">
            <div v-for="(el, index) in filterList" :key="index" class="typeCell" :class="index % 2 === 0 ? 'blue' : 'green'">
              <p class="type">
                <i></i>
                <span>{{el.title}}</span>
              </p>
              <div class="typeContainer">
                <template v-for="(i, idx) in (el.options || [])">
                  <div :key="`${index}_${idx}`"
                       :class="`cell ${i.id === filterForm[el.propName].id ? 'active' : ''}`"
                       @click="onProp(el.propName, i)">{{i.name}}</div>
                  <template v-if="i.id === 'customTime'">
                    <div v-show="customDateEnable" class="customTimeC">
                      <datetime v-model="customTimeForm.startTime" title="开始时间" placeholder="请选择"></datetime>
                      <datetime v-model="customTimeForm.endTime" title="结束时间" placeholder="请选择"></datetime>
                    </div>
                  </template>
                </template>
              </div>
            </div>
          </div>
          <div @click="onFilterConfirm" class="confirmBtn">确认</div>
        </div>
      </popup>
    </div>
  </div>
</template>

<script>
import { Datetime, Popup, Search } from 'k12vux'
import wisWarning from './wisWarning'
import closeIcon from '../static/images/close.png'
import filterIcon from '../static/images/filter.png'
import searchIcon from '../static/images/search.png'
import { cloneDeep, isEmpty } from 'lodash'
import { format } from 'date-fns'

export default {
  props: {
    showFilterFlag: Boolean,
    placeholder: {
      type: String,
      default: '请输入'
    },
    filterParams: {
      type: Object,
      default () {
        return {}
      }
    },
    filterList: {
      type: Array,
      default () {
        return []
      }
    },
    customDateFormat: {
      type: String,
      default: 'YYYY-MM-DD'
    },
    setFilterParams: {
      type: Function,
      required: true
    },
    resetFilterParams: {
      type: Function,
      required: true
    },
    filterDisplayDataList: {
      type: Array,
      default () {
        return []
      }
    },
    popupAttrs: {
      type: Object,
      default () {
        return {}
      }
    },
    loadMore: Function,
    recordListRows: {
      type: Array,
      default () {
        return []
      }
    },
    showNoMore: Boolean
  },
  components: {
    Datetime,
    Popup,
    Search,
    wisWarning
  },
  created () {
    this.showPopupFlag = this.showFilterFlag
    this.filterForm = cloneDeep(this.filterParams)

    this.buildCustomTimeForm()
  },
  mounted () {},
  data () {
    return {
      isEmpty,
      closeIcon,
      filterIcon,
      searchIcon,

      tmpSearchVal: '',
      showSearchFlag: false,
      showPopupFlag: false,

      filterForm: {},
      customTimeForm: {
        startTime: null,
        endTime: null
      }
    }
  },
  computed: {
    bindPopupAttrs () {
      let t = {
        position: 'right',
        width: '100%',
        animation: false,
      }
      Object.keys(this.popupAttrs).forEach(key => {
        t[key] = this.popupAttrs[key]
      })
      return t
    },
    customDateEnable () {
      let fObj = Object.keys(this.filterForm).filter(key => this.filterForm[key].id === 'customTime')
      return !isEmpty(fObj)
    }
  },
  watch: {
    showFilterFlag (v) {
      this.showPopupFlag = v
    },
    showPopupFlag (v) {
      if (v) {
        this.filterForm = cloneDeep(this.filterParams)
      }
      this.$emit('update:showFilterFlag', v)
    }
  },
  filters: {},
  methods: {
    buildCustomTimeForm () {
      let fObj = Object.keys(this.filterForm).filter(key => this.filterForm[key].id === 'customTime')
      if (!isEmpty(fObj)) {
        let obj = this.filterForm[fObj[0]]
        this.customTimeForm = {
          startTime: obj.startTime,
          endTime: obj.endTime
        }
      } else {
        let currentTime = format(new Date(), this.customDateFormat)
        this.customTimeForm = {
          startTime: currentTime,
          endTime: currentTime
        }
      }
    },
    onShowSearch () {
      this.resetFilterParams()
      this.showSearchFlag = true
      this.$refs.searchDom.setFocus()
      this.$emit('showSearch')
    },
    onSearchChange (v) {
      this.$emit('searchChange', v, this.showSearchFlag)
    },
    onSearchCancel () {
      this.resetFilterParams()
      this.showSearchFlag = false
      this.$emit('searchCancel')
    },
    onFilterConfirm () {
      this.showPopupFlag = false
      let params = {}
      Object.keys(this.filterForm).forEach(key => {
        if (this.filterForm[key].id === 'customTime') {
          params[key] = {
            ...this.filterForm[key],
            ...this.customTimeForm
          }
        } else {
          params[key] = this.filterForm[key]
        }
      })
      this.setFilterParams(params)
      this.$emit('filterConfirm')
    },
    onResetFilter () {
      this.resetFilterParams()
      this.$emit('resetFilter')
    },
    onProp (propName, v = {}) {
      let tmp = this.filterForm[propName]
      if (tmp && tmp.id !== v.id) {
        this.$emit('change', propName, v)
      }
      this.filterForm[propName] = v
      this.$emit('prop', propName, v)
    }
  }
}
</script>

<style lang="scss">
  $blue: #3292FF;
  $blueLiner: #E1F0FD;
  $green: #7ED15C;
  $greenLiner: #E1F8EF;
  .comContainer_wisSAFList {
    display: flex;
    flex-direction: column;
    .placeHolderC {
      position: relative;
      height: 44px;
      overflow: hidden;
      .weui-search-bar {
        &:before, &:after {
          display: none !important;
        }
      }
      .searchC {
        z-index: 0;
      }
      .sfC {
        z-index: 1;
      }
      > div {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    }
    .searchAndFilterC {
      display: flex;
      align-items: stretch;
      background: #fff;
      font-size: 17px;
      color: #666;
      height: 44px;
      border-bottom: 1px solid #EFEFF4;
      > div {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        img {
          display: block;
          width: 12px;
          margin-right: 5px;
        }
      }
    }
    .filterDisplayC {
      height: 36px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      border-bottom: 1px solid #e8e8e8;
      background-color: #fff;
      > div {
        font-size: 12px;
        color: #999;
        > span {
          &:not(:last-child) {
            margin-right: 8px;
          }
        }
      }
      .filterCloseImg {
        width: 16px;
      }
    }
    .infiniteListC {
      flex: 1;
      height: 0;
      overflow: auto;
    }
  }
  .wisSAF_popupC {
    display: flex;
    flex-direction: column;
    background-color: #fff !important;
    .mainC {
      flex: 1;
      height: 0;
      overflow: auto;
    }
    .typeCell {
      &.blue {
        i {
          background-color: $blue;
        }
        .typeContainer {
          .cell.active {
            color: $blue;
            background-color: $blueLiner;
          }
        }
      }
      &.green {
        i {
          background-color: $green;
        }
        .typeContainer {
          .cell.active {
            color: $green;
            background-color: $greenLiner;
          }
        }
      }
    }
    .type {
      display: flex;
      align-items: center;
      margin: 20px 15px;
      > i {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 5px;
      }
      > span {
        margin-left: 10px;
        font-size: 15px;
      }
    }
    .typeContainer {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      margin: 15px;
      .cell {
        width: calc((100% - 10px) / 2);
        height: 46px;
        background-color: #F2F2F2;
        border-radius: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 17px;
        color: #9B9B9B;
        margin-bottom: 10px;
        &:nth-child(odd){
          margin-right: 10px;
        }
      }
    }
    .confirmBtn {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 46px;
      color: #fff;
      font-size: 18px;
      background-color: $blue;
    }
    .customTimeC {
      width: 100%;
      border: 1px solid #eee;
      font-size: 14px;
    }
  }
</style>
