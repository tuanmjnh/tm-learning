<template>
  <q-card :style="$q.platform.is.mobile ? { width: '100%' } : { minWidth: '800px' }">
    <q-toolbar>
      <q-toolbar-title>
        <span>{{$t('report.view')}}</span> - <span
          class="text-bold">{{exercise?exercise.name:''}}</span>
      </q-toolbar-title>
      <tm-export color="blue" icon="cloud_download" :isTooltip="!$q.platform.is.mobile"
        :lblTooltip="$t('report.export')" :filename="`report_${exercise.name}`" :data="dataExport"
        :options="{}" :types="[
        { title: 'Export .xlsx', type: 'xlsx' },
        { title: 'Export .xls', type: 'xls' },
        { title: 'Export .csv', type: 'csv' },
        ]" @start="onStartExport" />
      <q-btn flat round dense :color="$store.state.app.darkMode?'':'grey-7'"
        :icon="maximized?'fullscreen_exit':'fullscreen'" :disable="loading"
        @click="$emit('update:maximized',!maximized)">
        <q-tooltip v-if="!$q.platform.is.mobile">
          {{maximized?$t('table.normal_screen'):$t('table.full_screen')}}
        </q-tooltip>
      </q-btn>
      <q-btn flat round dense icon="close" :disable="loading" v-close-popup>
        <q-tooltip v-if="!$q.platform.is.mobile">{{$t('global.cancel')}}</q-tooltip>
      </q-btn>
    </q-toolbar>
    <q-separator />
    <q-card-section>
      <!-- style="max-height: calc(100vh - 60px);" class="scroll" -->
      <q-list>
        <template v-for="(e,i) in items">
          <q-item :key="i">
            <q-item-section>
              <q-item-label>
                <span>{{e.username}} - {{e.fullName}}</span>
                <!-- <span class="text-red">{{}}</span> -->
              </q-item-label>
              <q-item-label lines="1">
                <span>{{$t('exams.numberDid')}}: </span>
                <b v-if="e.exams.length<exercise.numberTest"
                  class="text-teal">{{e.exams.length}}/{{exercise.numberTest}}</b>
                <b v-else class="text-deep-orange">{{e.exams.length}}/{{exercise.numberTest}}</b>
              </q-item-label>
              <q-item-label lines="2">
                <span>{{$t('exams.bestResults')}}: </span>
                <b class="text-indigo">{{getMaxResults(e.exams)}}/{{exercise.eligible}}</b>
              </q-item-label>
              <q-item-label lines="3">
                <span>{{$t('exercises.totalQuestion')}}: </span>
                <b class="text-purple">{{exercise.totalQuestion}}</b>
              </q-item-label>
            </q-item-section>
            <q-item-section side v-html="getResults(e.exams)">
              <!-- <q-badge v-if="e.result" color="primary">{{$t('exams.eligible')}}</q-badge>
              <q-badge v-else color="red">{{$t('exams.ineligible')}}</q-badge> -->
            </q-item-section>
          </q-item>
          <q-separator v-if="i<items.length-1" spaced inset :key="`s${i}`" />
        </template>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script>
import tmExport from '@/components/tm-export'
import { axiosApi } from '@/utils/http-client'
export default {
  components: { tmExport },
  props: {
    exercise: { type: Object, default: null },
    maximized: { type: Boolean, default: false },
    dialog: { type: Boolean, default: false }
  },
  data() {
    return {
      loading: false,
      items: [],
      dataExport: [],
      pagination: {
        filter: '',
        sortBy: 'username',
        descending: true,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 1,
        categories: null,
        flag: 1
      }
    }
  },
  watch: {
    dialog: {
      handler(val) {
        if (this.exercise) {
          this.onSelect({ key: this.exercise._id })
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    onSelect(params) {
      axiosApi.get('exams/get-report', { params: params }).then((x) => {
        this.items = x.data
        // address: "VNPT BKN"
        // avatar: null
        // dateBirth: "2020-04-08T17:00:00.000Z"
        // email: "admin.bkn@vnpt.vn"
        // exams: [{totalQuestion: 6, totalCorrect: 3, totalWrong: 3, result: 0, flag: 2,…},…]
        // fullName: "Admin BKN"
        // gender: 3
        // personNumber: "123456789"
        // username: "admin"
        // this.pagination = params.pagination
        this.pagination.rowsNumber = x.rowsNumber
      })
    },
    onStartExport() {
      this.dataExport = this.items.map(x => ({
        'Tài khoản': x.username,
        'Họ tên': x.fullName,
        email: x.email,
        'Số ĐT': x.personNumber,
        'Tổng số câu': this.exercise.totalQuestion,
        'Tối thiểu đạt/Câu': this.exercise.eligible,
        'Giới hạn làm/Lần': this.exercise.numberTest,
        'Số lần đã làm': x.exams.length,
        'Đạt cao nhất': this.getMaxResults(x.exams),
        'kết quả': this.getResultsExport(x.exams)
      }))
    },
    getMaxResults(exams) {
      if (exams && exams.length) {
        return Math.max.apply(null, exams.map((x) => { return x.totalCorrect }))
      }
      return 0
    },
    getResults(exams) {
      const rs = exams.find(x => x.result)
      if (rs) return `<div role="alert" class="q-badge flex inline items-center no-wrap q-badge--single-line bg-primary">${this.$t('exams.ok')}</div>`
      return `<div role="alert" class="q-badge flex inline items-center no-wrap q-badge--single-line bg-red">${this.$t('exams.noOk')}</div>`
    },
    getResultsExport(exams) {
      const rs = exams.find(x => x.result)
      if (rs) return 'Đỗ'
      return 'Trượt'
    }
  }
}
</script>

<style>
</style>
