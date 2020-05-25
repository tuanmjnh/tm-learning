<template>
  <q-card :style="$q.platform.is.mobile ? { width: '100%' } : { minWidth: '800px' }">
    <q-toolbar>
      <q-toolbar-title>
        {{exercise.name}}
      </q-toolbar-title>
      <div class="q-mr-lg">
        <span class="q-pr-xs">{{$t('exams.timeLeft')}}: </span>
        <span class="text-bold text-red q-pr-xs">
          {{$moment().startOf('day').seconds(this.seconds).format('HH:mm:ss')}}
        </span>
        <span>Phút</span>
      </div>
      <div>
        <!-- <q-btn flat round dense :color="$store.state.app.darkMode?'':'grey-7'"
          :icon="maximized?'fullscreen_exit':'fullscreen'" :disable="loading"
          @click="$emit('update:maximized',!maximized)">
          <q-tooltip v-if="!$q.platform.is.mobile">
            {{maximized?$t('table.normal_screen'):$t('table.full_screen')}}
          </q-tooltip>
        </q-btn> -->
        <!-- <q-btn flat round dense icon="close" :disable="loading" @click="onCancel">
          <q-tooltip v-if="!$q.platform.is.mobile">{{$t('global.cancel')}}</q-tooltip>
        </q-btn> -->
        <q-btn :disable="loading||(exam.questions && exam.questions.length<questions.length)"
          color="blue" :label="$t('exams.submit')" class="q-btn--square" @click="onSubmit" />
      </div>
    </q-toolbar>
    <q-separator />
    <q-card-section style="max-height: calc(100vh - 60px);" class="scroll">
      <div class="q-pa-md">
        <q-list v-for="(e,i) in items" :key="i">
          <q-item class="q-mb-md">
            <q-item-section>
              <q-item-label>
                <span class="text-bold text-indigo q-pr-xs">{{i+1}}.</span>
                <span :class="['text-bold', e.answersSelect?'text-indigo':'']">
                  {{e.content}}
                </span>
              </q-item-label>
              <q-item-label>
                <div v-for="(q,ii) in e.answers" :key="ii" class="q-pb-sm">
                  <!-- <q-checkbox v-model="e.answersSelect" dense :val="q.value"
                    :label="q.label?q.label.toString():''" /> -->
                  <q-checkbox v-if="e.correctLength>1" v-model="e.answersSelect" dense
                    :val="q.value" :label="q.label?q.label.toString():''" />
                  <q-radio v-else v-model="e.answersSelect" dense :val="q.value"
                    :label="q.label?q.label.toString():''" />
                </div>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-pagination v-if="items&&items.length&&pagination.rowsNumber>1" v-model="pagination.page"
          :max="pagination.rowsNumber" :direction-links="true" :boundary-links="true"
          icon-first="skip_previous" icon-last="skip_next" icon-prev="fast_rewind"
          icon-next="fast_forward" class="pagination q-pb-md flex flex-center"
          @input="onChangePage">
        </q-pagination>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { axiosApi } from '@/utils/http-client'
import Pagination from '@/utils/pagination'
export default {
  props: {
    exercise: { type: Object, default: null },
    maximized: { type: Boolean, default: true },
    dialog: { type: Boolean, default: false }
  },
  data() {
    return {
      loading: false,
      timer: false,
      interval: null,
      seconds: 0,
      questions: [],
      items: [],
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 1
      },
      exam: {
        startAt: new Date(),
        endAt: null,
        exercise: null,
        questions: [],
        // totalMinute: 0,
        // totalQuestion: { type: Number, default: 0 },
        // totalCorrect: { type: Number, default: 0 },
        // totalWrong: { type: Number, default: 0 },
        flag: 1
      }
    }
  },
  created() {
    this.$q.dialog({
      title: this.$t('message_box.confirm'),
      message: this.$t('exams.startConfirm'),
      cancel: true,
      persistent: true,
      html: true
    }).onOk(async () => {
      // Set exercise ID
      this.exam.exercise = this.exercise._id
      // Get questions
      await axiosApi.get('exams/get-questions', { params: { key: this.exam.exercise } }).then((res) => {
        this.questions = this.exercise.mixQuestion ? res.data.shuffle() : res.data
        if (this.exercise.mixAnswer) this.questions = this.questions.shuffleProperty('answers')
        const pagination = Pagination(this.questions, this.pagination.page, this.pagination.rowsPerPage)
        this.items = pagination.data
        this.pagination.rowsNumber = pagination.totalPage
      }).catch(() => {
        this.onClose()
      })
      // Accept -> post exam
      await axiosApi.post('exams', this.exam).then((res) => {
        this.exam = res
        this.exam.questions = []
        this.exercise.numberLeft = this.exercise.numberLeft - 1
        this.exercise.exams.push(this.exam)
      }).catch(() => {
        this.onClose()
      })
      // Start Timer
      // console.log(this.questions)
      this.onStartTimer(this.exercise.minutes)
    }).onCancel(() => {
      this.$emit('update:dialog', false)
    })
  },
  watch: {
    questions: {
      handler(val) {
        this.exam.questions = val.filter(x => x.answersSelect)
      },
      deep: true
    }
  },
  methods: {
    onChangePage() {
      const pagination = Pagination(this.questions, this.pagination.page, this.pagination.rowsPerPage)
      this.items = pagination.data
      this.pagination.rowsNumber = pagination.totalPage
    },
    onCancel() {
      this.$q.dialog({
        title: this.$t('message_box.confirm'),
        message: this.$t('exams.submitConfirm'),
        cancel: true,
        persistent: true,
        html: true
      }).onOk(() => {
        this.onClose()
      })
    },
    onSubmit() {
      this.$q.dialog({
        title: this.$t('message_box.confirm'),
        message: this.$t('exams.submitConfirm'),
        cancel: true,
        persistent: true,
        html: true
      }).onOk(() => {
        this.onStopTimer()
        this.exam.questions = this.exam.questions.map(x => ({ _id: x._id, answers: x.answersSelect }))
        // console.log(this.questions.map(x => ({ _id: x._id, answers: x.answersSelect })))
        axiosApi.put('exams', this.exam).then((res) => {
          this.exam = res
          this.$q.dialog({
            title: this.$t('message_box.title'),
            message: `${this.$t('exams.answerCorrect')}: <span class="text-bold text-indigo">${this.exam.totalCorrect}/${this.exam.totalQuestion}</span> ${this.$t('global.question')}<br/>
            ${this.$t('global.result')}: ${this.exam.result ? '<span class="text-bold text-green">' + this.$t('exams.eligible') : '<span class="text-bold text-red">' + this.$t('exams.ineligible')}</span>`,
            persistent: true,
            html: true
          }).onOk(() => {
            this.onClose()
          })
        }).catch(() => {
          this.onClose()
        })
      })
    },
    onStartTimer(minutes) {
      this.onStopTimer()
      this.timer = true
      this.seconds = minutes * 60
      this.interval = setInterval(() => {
        this.seconds = this.seconds - 1
        // console.log(this.seconds)
        if (this.seconds < 1) {
          this.onStopTimer()
        }
      }, 1000)
    },
    onStopTimer() {
      clearInterval(this.interval)
      this.timer = false
    },
    onClose() {
      this.onStopTimer()
      this.$emit('update:dialog', false)
    }
  }
}
</script>

<style scoped>
.q-item__section,
.q-expansion-item >>> .q-item__section {
  min-width: initial;
}
.pagination >>> .q-btn {
  font-size: 12px;
}
.pagination >>> .q-btn {
  min-width: 30px !important;
}
.pagination >>> .q-btn .q-btn__wrapper::before {
  box-shadow: initial;
}
</style>
