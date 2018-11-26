<template>
  <div class="comContainer_wisSingleLineCalendar">
    <div class="title">{{title}}</div>
    <table class="table">
      <thead>
        <tr>
          <th v-for="(el, index) in weekList" :key="index">{{el}}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td v-for="(el, index) in renderDateList" :key="index"
            :class="{current: el.current, disabled: el.disabled}">
            <span class="eachDate" :class="{hidden: el.disabled}"
              @click.stop="onDate(el)">{{el.date}}
              <i v-if="el.showTip" class="tipDateI"></i>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { eachDay, format, isSameDay, isSameMonth, lastDayOfWeek, parse, startOfWeek } from 'date-fns'

const formatStr = 'YYYY-MM-DD'

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
    }
  },
  created () {},
  mounted () {},
  data () {
    return {
      format,
      weekList: ['一', '二', '三', '四', '五', '六', '日']
    }
  },
  computed: {
    renderDateList () {
      let startDate = startOfWeek(this.value, { weekStartsOn: 1 })
      let endDate = lastDayOfWeek(this.value, { weekStartsOn: 1 })
      return eachDay(startDate, endDate).map(el => {
        return {
          value: el,
          date: el.getDate(),
          day: el.getDay(),
          current: isSameDay(el, this.value),
          disabled: !isSameMonth(el, this.value),
          showTip: this.tipDateList.indexOf(format(el, formatStr)) > -1
        }
      })
    },
    title () {
      return format(parse(this.value, formatStr), 'YYYY年MM月')
    }
  },
  watch: {},
  filters: {},
  methods: {
    onDate (v) {
      this.$emit('input', format(v.value, formatStr))
    }
  }
}
</script>

<style scoped lang="scss">
  .comContainer_wisSingleLineCalendar {
    .title {
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;
      font-size: 1.2em;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      th {
        color: #fff;
        font-weight: normal;
        padding: 8px 0;
      }
      td {
        padding: 8px 0;
        text-align: center;
        vertical-align: middle;
        font-size: 16px;
        position: relative;
        > span.eachDate {
          width: 35px;
          height: 35px;
          line-height: 35px;
          position: relative;
          display: inline-block;
          border-radius: 50%;
          text-align: center;
          border: 1px solid transparent;
          &.hidden {
            visibility: hidden;
          }
        }
        &.current > span.eachDate {
          background-color: #fff;
          color: #4c76ae !important;
        }
        &:not(.disabled) > span.eachDate {
          color: #fff;
        }
        &.disabled > span.eachDate {
          color: #c0c0c0;
        }
        .tipDateI {
          position: absolute;
          top: 5px;
          right: 3px;
          display: inline-block;
          width: 5px;
          height: 5px;
          background: #FFC000;
          border-radius: 50%;
        }
      }
    }
  }
</style>
