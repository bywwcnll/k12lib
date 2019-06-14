<template>
  <div class="wtComContainer">
    <div v-if="data.isUser || !renderMode" class="wtDeptIcon">
      <svg v-if="data.isUser" viewBox="0 0 1024 1024">
        <path d="M690.338 661.474c-41.498-18.374-103.937-65.868-195.163-82.197 23.332-24.985 40.564-63.996 58.672-110.231 10.528-26.786 8.425-49.62 8.425-82.185 0-24.002 4.507-62.528-1.502-83.71-20.073-71.577-71.002-91.29-130.507-91.29-59.583 0-110.473 19.828-130.557 91.452-5.848 21.24-1.355 59.627-1.355 83.548 0 32.623-1.764 55.56 8.787 82.359 18.247 46.477 35.683 85.444 58.865 110.347-90.428 16.525-148.928 63.73-190.16 82.047-85.32 38.11-83.219 79.828-83.219 79.828v70.698l685.644-0.128v-70.57c0-0.001-2.262-41.88-87.93-79.968zM659.56 227.805h271.187v59.352H659.56v-59.352zM659.56 357.765h165.782v60.375H659.56v-60.375z"/>
        <path d="M659.56 487.725h237.417V548.1H659.56v-60.375z"/>
      </svg>
      <svg v-else-if="!renderMode" viewBox="0 0 1024 1024">
        <path d="M741 291.8h-56v-55c0-9.4-7.6-17-17-17H441v-56h227c40.3 0 73 32.7 73 73v55z"/>
        <path d="M917 920.2H107c-40.3 0-73-32.7-73-73v-671c0-40.3 32.7-73 73-73h292.6l127.1 161H917c40.3 0 73 32.7 73 73v510c0 40.3-32.7 73-73 73z m-810-761c-9.4 0-17 7.6-17 17v671c0 9.4 7.6 17 17 17h810c9.4 0 17-7.6 17-17v-510c0-9.4-7.6-17-17-17H499.6l-127.1-161H107z"/>
        <path d="M129.3 739.8H384v56H129.3z"/>
      </svg>
    </div>
    <div class="wtTextC">
      <div class="wtMainDiv">
        <p :title="data.label"><span>{{data.label}}</span></p>
        <p v-if="computedShowDeptNames && data.corpName" :title="data.corpName"><span class="wtCorpName">@{{data.corpName}}</span></p>
      </div>
      <div v-if="computedShowDeptNames && data.isUser && data.deptNames" class="wtOtherDiv">
        <p :title="data.deptNames"><span class="wtDeptNames wtMultiOmit">{{data.deptNames}}</span></p>
      </div>
      <div v-if="computedShowDeptNames && !data.isUser && data.parentDeptName" class="wtOtherDiv">
        <p :title="data.parentDeptName"><span class="wtDeptNames wtMultiOmit">{{data.parentDeptName}}</span></p>
      </div>
    </div>
    <div v-if="showCloseBtn" class="wtSCClose" @click="onClose">
      <i class="el-icon-close"></i>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default: () => { return {} }
    },
    node: {
      type: Object,
      default: () => { return {} }
    },
    renderMode: Boolean,
    showCloseBtn: Boolean,
    showDeptNames: Boolean,
    index: Number
  },
  data () {
    return {}
  },
  computed: {
    computedShowDeptNames () {
      return this.showDeptNames || this.data.showDeptNames
    }
  },
  watch: {},
  filters: {},
  methods: {
    onClose () {
      this.$emit('close', {
        data: this.data,
        index: this.index
      })
    }
  }
}
</script>

<style lang="scss">
  .wtComContainer {
    flex: 1;
    width: 0;
    display: flex;
    justify-content: flex-start;
    align-items: stretch;
  }
  .wtDeptIcon {
    display: flex;
    align-items: center;
    margin-right: 5px;
    > svg {
      fill: #6aace2;
      width: 18px;
      height: 18px;
    }
  }
  .wtTextC {
    padding: 4px 0 3px;
    flex: 1;
    width: 0;
    height: 100%;
    display: flex;
    /*align-items: stretch;*/
    > div {
      &.wtMainDiv {
        flex: 4;
      }
      &.wtOtherDiv {
        flex: 3;
      }
      display: flex;
      flex-direction: column;
      align-items: center;
      > p {
        width: 100%;
        display: flex;
        align-items: center;
        &:first-child {
          flex: 1;
        }
        > span {
          flex: 1;
          width: 0;
          &:not(.wtMultiOmit) {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }
  .wtDeptNames {
    white-space: normal !important;
    margin-left: 10px;
    font-size: 12px;
    color: #999;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    /*! autoprefixer: ignore next */
    -webkit-box-orient: vertical;
  }
  .wtCorpName {
    flex: 1;
    width: 0;
    font-size: 12px;
    color: #FF6633;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .wtSCClose {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 26px;
    cursor: pointer;
  }
</style>
