<template>
  <div class="comContainer_wisMobileCalendar">
    <wisSingleLineCalendar v-show="showSingleLineFlag"
      v-model="singleLineDate" :tipDateList="tipDateList">
    </wisSingleLineCalendar>
    <inline-calendar v-show="!showSingleLineFlag" class="inlineCalendarC"
      v-model="meetingDate" :marks="marks"
      :firstDayOfWeek="1" :show-last-month="false" :show-next-month="false"
      @on-view-change="onViewChange">
    </inline-calendar>
    <img :src="showSingleLineFlag ? calendarOpen : calendarClose"
      class="calendarOptIcon" alt="" @click="onSwitch">
  </div>
</template>

<script>
import { InlineCalendar } from 'k12vux'
import wisSingleLineCalendar from './wisSingleLineCalendar'
import calendarOpen from '../static/images/calendarOpen.png'
import calendarClose from '../static/images/calendarClose.png'

export default {
  props: {
    value: {
      type: String,
      required: true,
      default: ''
    },
    tipDateList: {
      type: Array,
      default () {
        return []
      }
    },
    singleLineFlag: {
      type: Boolean,
      default: true
    }
  },
  components: {
    InlineCalendar,
    wisSingleLineCalendar
  },
  created () {},
  mounted () {},
  data () {
    return {
      calendarOpen,
      calendarClose,
      showSingleLineFlag: this.singleLineFlag,
      singleLineDate: this.value,
      meetingDate: this.value
    }
  },
  computed: {
    marks () {
      return this.tipDateList.map(el => {
        return {
          date: el,
          topTip: {}
        }
      })
    }
  },
  watch: {
    value (v) {
      this.singleLineDate = this.value
      this.meetingDate = this.value
    },
    singleLineDate (v) {
      this.$emit('input', v)
    },
    meetingDate (v) {
      this.$emit('input', v)
    }
  },
  filters: {},
  methods: {
    onSwitch () {
      this.showSingleLineFlag = !this.showSingleLineFlag
    },
    onViewChange (data, index) {
      if (index !== 0) {
        this.$emit('onViewChange', {
          startDate: data.firstCurrentMonthDate,
          endDate: data.lastCurrentMonthDate
        })
      }
    }
  }
}
</script>

<style scoped lang="scss">
  .comContainer_wisMobileCalendar {
    position: relative;
    background-color: #4c76ae;
    padding-bottom: 34px;
    transition: all .5s ease;
    .calendarOptIcon {
      position: absolute;
      left: 50%;
      bottom: 0;
      transform: translateX(-50%);
      width: 58px;
    }
  }
</style>
<style lang="scss">
  .comContainer_wisMobileCalendar {
    .inlineCalendarC {
      background-color: #4c76ae !important;
      border-radius: 0 !important;
      .vux-prev-icon, .vux-next-icon {
        border-color: #fff !important;
      }
      .calendar-title, th {
        color: #fff !important;
      }
      th {
        padding: 8px 0;
      }
      &.inline-calendar td {
        padding: 8px 0 !important;
      }
      &.inline-calendar td > span.vux-calendar-each-date {
        width: 35px !important;
        height: 35px !important;
        line-height: 35px !important;
      }
      &.inline-calendar td:not(.is-disabled) > span.vux-calendar-each-date {
        color: #fff !important;
      }
      &.inline-calendar td.current > span.vux-calendar-each-date {
        background-color: #fff !important;
        color: #4c76ae !important;
      }
      .vux-calendar-top-tip {
        position: absolute !important;
        top: 5px !important;
        left: initial !important;
        right: 3px !important;
        display: inline-block !important;
        width: 5px !important;
        height: 5px !important;
        background: #FFC000 !important;
        border-radius: 50% !important;
        transform: none !important;
        transform-origin: initial !important;
      }
    }
  }
</style>
