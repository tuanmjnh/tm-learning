<template>
  <q-card :style="$q.platform.is.mobile ? { width: '100%' } : { minWidth: '800px' }">
    <q-toolbar>
      <q-toolbar-title>
        <span>{{$t('global.details')}}</span> - <span class="text-bold">{{exercise.name}}</span>
      </q-toolbar-title>
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
        <template v-for="(e,i) in exams">
          <q-item :key="i">
            <q-item-section>
              <q-item-label>
                <span>{{$t('exams.timeDid')}}: </span>
                <b class="text-indigo">{{e.startAt.formatDate('DD/MM/YYYY HH:mm')}}</b> -
                <b class="text-indigo">{{e.endAt.formatDate('DD/MM/YYYY HH:mm')}}</b>
              </q-item-label>
              <q-item-label lines="1">
                <span>{{$t('exams.answerCorrect')}}: </span>
                <b class="text-green">{{e.totalCorrect}}</b>
              </q-item-label>
              <q-item-label lines="1">
                <span>{{$t('exams.answerWrong')}}: </span>
                <b class="text-red">{{e.totalWrong}}</b>
              </q-item-label>
            </q-item-section>
            <q-item-section side top>
              <q-btn flat dense color="blue">Xem lại</q-btn>
              <q-badge v-if="e.result" color="green">{{$t('exams.eligible')}}</q-badge>
              <q-badge v-else color="red">{{$t('exams.ineligible')}}</q-badge>
              <!-- <q-item-label caption>
                {{$t('global.created_at')}}:
                <span class="text-info">{{e.createdAt.formatDate()}}</span>
              </q-item-label>
              <q-chip v-if="e.numberLeft&&e.eligibleExams.length<1" clickable @click="onStart(e)"
                icon="alarm_on" color="blue" text-color="white">
                {{$t('exams.start')}}
              </q-chip> -->
            </q-item-section>
          </q-item>
          <q-separator v-if="i<exams.length-1" spaced inset :key="`s${i}`" />
        </template>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script>
import { axiosApi } from '@/utils/http-client'
export default {
  props: {
    exercise: { type: Object, default: null },
    maximized: { type: Boolean, default: false },
    dialog: { type: Boolean, default: false }
  },
  data() {
    return {
      loading: false,
      exams: []
    }
  },
  created() {
    this.onSelect({ exercise: this.exercise._id })
  },
  methods: {
    onSelect(params) {
      axiosApi.get('exams', { params: params }).then((x) => {
        this.exams = x.data
        // this.pagination = params.pagination
        // this.pagination.rowsNumber = x.rowsNumber
      })
    }
  }
}
</script>

<style>
</style>
