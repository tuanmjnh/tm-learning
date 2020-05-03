<template>
  <q-card flat bordered :style="$q.platform.is.mobile?{width:'100%'}:{minWidth:'800px'}">
    <q-toolbar>
      <q-avatar :icon="$route.meta.icon" size="50px" />
      <q-toolbar-title>
        {{$t('exams.title')}}
      </q-toolbar-title>
    </q-toolbar>
    <q-separator />
    <q-list v-if="items&&items.length">
      <template v-for="(e,i) in items">
        <q-item :key="i">
          <q-item-section>
            <q-item-label class="text-bold">
              <span class="q-pr-sm">{{e.name}}</span>
              <q-badge v-if="e.eligibleExams.length" color="primary">{{$t('exams.ok')}}</q-badge>
              <template v-else>
                <q-badge v-if="e.exams.length<e.numberTest" color="warning">
                  {{$t('exams.doing')}}
                </q-badge>
                <q-badge v-else color="red">{{$t('exams.noOk')}}</q-badge>
              </template>
            </q-item-label>
            <q-item-label lines="1">
              {{$t('exams.numberDid')}}:
              <b :class="['cursor-pointer',e.exams.length<e.numberTest?'text-green':'text-red']"
                @click="onDetails(e)">
                {{e.exams.length}}/{{e.numberTest}}
                <span v-if="e.exams.length" class="material-icons text-h6 q-pl-xs">pageview</span>
              </b>
              <!-- {{$t('exams.numberDid')}}: <b class="text-red">{{e.exams.length}}</b> -->
            </q-item-label>
            <q-item-label caption lines="2">
              {{$t('exercises.startAt')}}: <b
                class="text-indigo">{{e.startAt.formatDate('DD/MM/YYYY HH:mm')}}</b> -
              {{$t('exercises.endAt')}}: <b
                class="text-indigo">{{e.endAt.formatDate('DD/MM/YYYY HH:mm')}}</b>
            </q-item-label>
            <q-item-label caption lines="1">
              {{e.desc}}
            </q-item-label>
          </q-item-section>
          <q-item-section side top>
            <q-item-label caption>
              {{$t('global.created_at')}}:
              <span class="text-deep-purple">{{e.createdAt.formatDate()}}</span>
            </q-item-label>
            <q-chip v-if="e.numberLeft&&e.eligibleExams.length<1" clickable @click="onStart(e)"
              icon="alarm_on" color="blue" text-color="white">
              {{$t('exams.start')}}
            </q-chip>
          </q-item-section>
        </q-item>
        <q-separator v-if="i<items.length-1" spaced inset :key="`s${i}`" />
      </template>
    </q-list>
    <q-list v-else>
      <q-item>
        <q-item-section>
          <q-item-label class="text-bold">
            {{$t('exercises.noData')}}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <!-- Start dialog -->
    <q-dialog v-model="dialogStart" :maximized="maximizedView" persistent>
      <tpl-start :dialog.sync="dialogStart" :maximized.sync="maximizedView"
        :exercise.sync="exercise" />
    </q-dialog>
    <!-- Details dialog -->
    <q-dialog v-model="dialogDetails" :maximized="maximizedView" persistent>
      <tpl-details :dialog.sync="dialogDetails" :maximized.sync="maximizedView"
        :exercise.sync="exercise" />
    </q-dialog>
  </q-card>
</template>

<script>
import tplStart from './start'
import tplDetails from './details'
import { axiosApi } from '@/utils/http-client'
export default {
  components: { tplStart, tplDetails },
  data() {
    return {
      dialogStart: false,
      dialogDetails: false,
      dialogReport: false,
      maximizedView: true,
      items: [],
      exercise: {},
      pagination: {
        filter: '',
        sortBy: 'createdAt',
        descending: true,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 1,
        categories: null,
        flag: 1
      }
    }
  },
  created() {
    this.onSelect({ pagination: this.pagination })
  },
  methods: {
    onSelect(params) {
      axiosApi.get('exams/get-exercies', { params: params.pagination }).then((x) => {
        this.items = x.data
        this.pagination = params.pagination
        this.pagination.rowsNumber = x.rowsNumber
      })
    },
    onStart(exercise) {
      this.maximizedView = true
      this.dialogStart = true
      this.exercise = exercise
    },
    onDetails(exercise) {
      if (!exercise.exams.length) return
      this.maximizedView = false
      this.dialogDetails = true
      this.exercise = exercise
    }
  }
}
</script>

<style>
</style>
