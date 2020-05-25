<template>
  <q-card flat bordered :style="$q.platform.is.mobile ? { width: '100%' } : { minWidth: '800px' }">
    <q-toolbar>
      <q-avatar :icon="$route.meta.icon" size="50px" />
      <q-toolbar-title>
        {{ this.item ? $t("global.update") : $t("global.add") }}
        <span class="text-weight-bold">{{ $t("route.libraryExercises") }}</span>
      </q-toolbar-title>
      <q-btn flat round dense icon="close" v-close-popup
        :disable="loadingAdd || loadingDrafts ? true : false">
        <q-tooltip v-if="!$q.platform.is.mobile">{{
          $t("global.cancel")
        }}</q-tooltip>
      </q-btn>
    </q-toolbar>
    <q-separator />
    <q-form ref="form">
      <q-card-actions v-if="item" align="right">
        <q-btn flat type="submit" :dense="$store.getters.dense.button" color="amber"
          icon="offline_pin" :label="$t('global.update')" :loading="loadingAdd"
          @click.prevent="onSubmit">
          <!-- <q-tooltip>{{$t('global.add')}}</q-tooltip> -->
        </q-btn>
      </q-card-actions>
      <q-card-actions v-else align="right">
        <q-btn flat type="submit" :dense="$store.getters.dense.button" color="blue"
          icon="check_circle" :label="$t('global.add')" :loading="loadingAdd"
          :disable="loadingDrafts" @click.prevent="onSubmit(1)">
          <!-- <q-tooltip>{{$t('global.add')}}</q-tooltip> -->
        </q-btn>
        <q-btn flat type="submit" :dense="$store.getters.dense.button" color="amber" icon="receipt"
          :label="$t('global.drafts')" :loading="loadingDrafts" :disable="loadingAdd"
          @click.prevent="onSubmit(0)">
          <!-- <q-tooltip>{{$t('global.drafts')}}</q-tooltip> -->
        </q-btn>
      </q-card-actions>
      <q-tabs v-model="tabs" narrow-indicator :dense="$store.getters.dense.form"
        class="text-deep-purple" align="justify">
        <q-tab name="main" :label="$t('tabs.main')" />
        <q-tab name="question" :label="$t('global.question')" />
        <q-tab name="users" :label="$t('exercises.users')" />
        <q-tab name="attributes" :label="$t('global.attributes')" />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tabs" animated>
        <q-tab-panel name="main">
          <div class="row q-gutter-xs">
            <div class="col-12 col-md-5">
              <q-select v-model="type" input-debounce="200" :dense="$store.getters.dense.input"
                :options="types" :label="$t('exercises.type')" option-value="code"
                :option-label="opt=>opt.name.toHtml()" :rules="[v=>!!v||$t('error.required')]" />
            </div>
            <q-space />
            <div class="col-12 col-md-5">
              <q-input v-model.trim="form.name" v-uppercaseFirst :dense="$store.getters.dense.input"
                :label="$t('exercises.name')" :rules="[v=>!!v||$t('error.required')]" />
            </div>
          </div>
          <div class="row q-gutter-xs">
            <div class="col-12 col-md-5">
              <!-- ?$moment(form.startAt).format('DD/MM/YYYY hh:mm'):'' -->
              <q-input :value="form.startAt" :dense="$store.getters.dense.input" readonly
                :label="$t('exercises.startAt')" :hint="`${$t('global.format')}: DD/MM/YYYY hh:mm`">
                <template v-slot:prepend>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="startAtDate" transition-show="scale"
                      transition-hide="scale">
                      <q-date v-model="form.startAt" mask="DD/MM/YYYY HH:mm" today-btn
                        @input="()=>$refs.startAtDate.hide()" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
                <template v-slot:append>
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy ref="startAtTime" transition-show="scale"
                      transition-hide="scale">
                      <q-time v-model="form.startAt" mask="DD/MM/YYYY HH:mm" format24h
                        @input="()=>$refs.startAtTime.hide()" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <q-space />
            <div class="col-12 col-md-5">
              <!-- ?$moment(form.endAt).format('DD/MM/YYYY HH:mm'):'' -->
              <q-input :value="form.endAt" :dense="$store.getters.dense.input" readonly
                :label="$t('exercises.endAt')" :hint="`${$t('global.format')}: DD/MM/YYYY HH:mm`">
                <template v-slot:prepend>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="endAtDate" transition-show="scale" transition-hide="scale">
                      <q-date v-model="form.endAt" mask="DD/MM/YYYY HH:mm" today-btn
                        @input="()=>$refs.endAtDate.hide()" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
                <template v-slot:append>
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy ref="endAtTime" transition-show="scale" transition-hide="scale">
                      <q-time v-model="form.endAt" mask="DD/MM/YYYY HH:mm" format24h
                        @input="()=>$refs.endAtTime.hide()" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>
          <div class="row q-gutter-xs">
            <div class="col-5 col-md-3">
              <q-input v-model="form.minutes" type="number" :dense="$store.getters.dense.input"
                :label="`${$t('exercises.time')} (${$t('global.minute')})`"
                :rules="[v=>parseInt(v)>-1||$t('error.required')]" />
            </div>
            <!-- <div class="col-5 col-md-2">
              <q-input v-model="testTime.hours" type="number" :dense="$store.getters.dense.input"
                :label="`${$t('exercises.time')} (${$t('global.hour')})`"
                :rules="[v=>parseInt(v)>-1||$t('error.required')]" />
            </div>
            <div class="col-5 col-md-3">
              <q-input v-model="testTime.minutes" type="number" :dense="$store.getters.dense.input"
                :label="`${$t('exercises.time')} (${$t('global.minute')})`"
                :rules="[v=>parseInt(v)>-1||$t('error.required')]" />
            </div> -->
            <q-space />
            <div class="col-5 col-md-3">
              <q-input v-model="form.numberTest" type="number" :dense="$store.getters.dense.input"
                :label="$t('exercises.numberTest')" :rules="[v=>!!v||$t('error.required')]" />
            </div>
            <q-space />
            <div class="col-5 col-md-3">
              <q-input v-model="form.eligible" type="number" :dense="$store.getters.dense.input"
                :label="$t('exercises.eligible')" :rules="[v=>!!v||$t('error.required')]" />
            </div>
          </div>
          <div class="row q-gutter-xs">
            <div class="col-5 col-md-3">
              <q-checkbox v-model="form.mixQuestion" :label="$t('exercises.mixQuestion')"
                :true-value="1" :false-value="0" />
            </div>
            <div class="col-5 col-md-3">
              <q-checkbox v-model="form.mixAnswer" :label="$t('exercises.mixAnswer')"
                :true-value="1" :false-value="0" />
            </div>
            <!-- <q-space />
            <div class="col-5 col-md-2">
              <q-input v-model="form.order" type="number" :dense="$store.getters.dense.input"
                :label="$t('global.order')" :rules="[v=>!!v||$t('error.required')]" />
            </div> -->
          </div>
          <div class="row q-gutter-xs">
            <div class="col-12">
              <q-input v-model="form.desc" autogrow :label="$t('global.desc')" />
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="question">
          <div class="row q-gutter-xs">
            <div class="col-5">
              <q-checkbox v-model="append" :label="$t('global.append')" />
            </div>
            <q-space />
            <div class="col-5">
              <tm-load-files ref="tmLoadFiles" :button="true" :label="$t('files.open_file')"
                :placeholder="$t('files.choose_file')" accept=".xls,.xlsx,.csv,.tsv,.txt,.json,.xml"
                @on-start="loading=true" @on-finish="onLoadedFile"
                :options="{header:'A',raw:true}" />
            </div>
          </div>
          <div v-if="step===2" class="row q-gutter-xs">
            <div v-if="loadedReport.wrong.length" class="col-12"
              v-html="$t('question.msgPushWrong',{total:loadedReport.wrong.length})+'<br/>'+$t('question.msgPushWrongDetails')+loadedReport.wrong.join(', ')">
            </div>
            <div class="col-12">
              <q-table :data="loadedData" :columns="loadedColumns" row-key="id" dense
                :pagination.sync="loadedPagination">
                <template v-slot:top="props">
                  <div class="col-12 row">
                    <div class="col col-sm-auto q-table__title text-h6">
                      {{ $t("files.dataList") }}
                    </div>
                    <q-space />
                    <div class="self-center text-right">
                      <q-btn flat round dense :color="$store.getters.darkMode ? '' : 'grey-7'"
                        :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                        @click="props.toggleFullscreen">
                        <q-tooltip v-if="!$q.platform.is.mobile">
                          {{props.inFullscreen? $t("table.normal_screen"): $t("table.full_screen")}}
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </template>
              </q-table>
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="users">
          <div class="row q-gutter-xs">
            <div class="col-5">
              <q-chip clickable @click="onSelectUsers" color="primary" text-color="white">
                {{$t('exercises.selectUser')}}
              </q-chip>
            </div>
            <q-space />
            <div class="col-5">
              <tm-load-files ref="tmLoadFiles" :button="true" :label="$t('files.open_file')"
                :placeholder="$t('files.choose_file')" accept=".xls,.xlsx,.csv,.tsv,.txt,.json,.xml"
                @on-start="loading=true" @on-finish="onLoadedFileUsers"
                :options="{header:'A',raw:true}" />
            </div>
          </div>
          <div v-if="loadedDataUsers&&loadedDataUsers.length" class="row q-gutter-xs">
            <div v-if="loadedReportUsers.wrong.length" class="col-12"
              v-html="$t('question.msgPushWrong',{total:loadedReportUsers.wrong.length})+'<br/>'+$t('question.msgPushWrongDetails')+loadedReportUsers.wrong.join(', ')">
            </div>
            <div class="col-12">
              <q-table :data="loadedDataUsers" :columns="loadedColumnsUsers" row-key="id" dense
                :visible-columns="visibleColumnsUsers" :pagination.sync="loadedPaginationUsers">
                <template v-slot:top="props">
                  <div class="col-12 row">
                    <div class="col col-sm-auto q-table__title text-h6">
                      {{ $t("files.dataList") }}
                    </div>
                    <q-space />
                    <div class="self-center text-right">
                      <q-btn flat round dense :color="$store.getters.darkMode ? '' : 'grey-7'"
                        icon="menu_open">
                        <q-tooltip v-if="!$q.platform.is.mobile">{{ $t("table.display_columns")}}
                        </q-tooltip>
                        <q-menu fit>
                          <q-list dense style="min-width:100px">
                            <template v-for="(item, index) in loadedColumnsUsers">
                              <q-item clickable :key="index" v-if="!item.required"
                                @click="onColumnsUsers(item.name)"
                                :active="visibleColumnsUsers.indexOf(item.name) > -1 || false">
                                <q-item-section>{{ $t(item.label) }}</q-item-section>
                              </q-item>
                            </template>
                          </q-list>
                        </q-menu>
                      </q-btn>
                      <q-btn flat round dense :color="$store.getters.darkMode ? '' : 'grey-7'"
                        :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                        @click="props.toggleFullscreen">
                        <q-tooltip v-if="!$q.platform.is.mobile">
                          {{props.inFullscreen? $t("table.normal_screen"): $t("table.full_screen")}}
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </template>
                <template v-slot:header="props">
                  <q-tr :props="props">
                    <q-th v-for="col in props.cols" :key="col.name" :props="props">
                      <span :class="['text-bold',$store.getters.darkMode?'':'text-blue-grey-10']">
                        {{ $t(col.label) }}
                      </span>
                    </q-th>
                  </q-tr>
                </template>
              </q-table>
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="attributes">
          <div class="row q-gutter-xs">
            <div class="col">
              <tm-tags :data.sync="form.tags" :dense="$store.getters.dense.input"
                :labelTitle="$t('global.keyword')+':'" :labelBtnAdd="$t('global.add')"
                :labelInput="$t('global.tags')" btnIcon="add" btnColor="blue" tagsColor="primary"
                tagsTextColor="white" :labelConfirmTitle="$t('message_box.confirm')"
                :labelConfirmContent="$t('message_box.delete')"
                :labelWarningTitle="$t('message_box.warning')"
                :labelWarningContent="$t('error.required')"></tm-tags>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-form>
  </q-card>
</template>

<script>
import { axiosApi, axiosApiDebonce } from '@/utils/http-client'; // questions
import tmTags from '@/components/tm-tags'
import tmLoadFiles from '@/components/tm-load-files'
export default {
  components: { tmTags, tmLoadFiles },
  props: {
    dialog: { type: Boolean, default: true },
    items: { type: Array, default: () => [] },
    item: { type: Object, default: () => { } },
    categories: { type: Array, default: null },
    types: { type: Array, default: null },
    kinds: { type: Array, default: null },
    levels: { type: Array, default: null }
  },
  data() {
    return {
      loading: false,
      loadingAdd: false,
      loadingDrafts: false,
      tabs: 'main',
      type: null,
      step: 1,
      append: false,
      loadedData: [],
      loadedReport: { wrong: [], correct: [], success: [], error: [] },
      loadedDataUsers: [],
      loadedReportUsers: { wrong: [], correct: [], success: [], error: [] },
      form: {},
      testTime: { hours: 1, minutes: 0 },
      default: {
        type: 1,
        name: null,
        questions: [],
        users: [],
        startAt: this.$moment().format('DD/MM/YYYY HH:mm'),
        endAt: this.$moment().format('DD/MM/YYYY HH:mm'),
        numberTest: 1,
        minutes: 60,
        mixQuestion: 1,
        mixAnswer: 1,
        eligible: 1,
        desc: null,
        tags: null,
        order: 1,
        flag: 1
      },
      loadedPagination: {
        filter: '',
        sortBy: 'order',
        descending: false,
        page: 1,
        rowsPerPage: 15,
        categories: null,
        flag: 1
      },
      loadedColumns: [],
      loadedPaginationUsers: {
        filter: '',
        group: '',
        sortBy: 'level',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 1,
        enable: true
      },
      visibleColumnsUsers: ['email', 'phone', 'roles', 'email_verified'],
      loadedColumnsUsers: [
        { name: 'username', field: 'username', label: 'users.username', align: 'left', sortable: true, required: true },
        { name: 'fullName', field: 'fullName', label: 'users.fullName', align: 'left', sortable: true, required: true },
        { name: 'email', field: 'email', label: 'users.email', align: 'left', sortable: true }, // row => this.$t(`roles.${row.name}`)
        { name: 'phone', field: 'phone', label: 'users.phone', align: 'right', sortable: true }
        // { name: 'roles', field: 'roles', label: 'roles.title', align: 'left', sortable: true }
      ]
    }
  },
  watch: {
    dialog: {
      handler(val) {
        this.reset()
        if (this.item) {
          this.form = { ...this.item }
          if (!this.form.content) this.form.content = ''
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    onLoadedFile(data) {
      this.step = 2
      this.loading = false
      if (!this.append) {
        this.form.questions = []
        this.loadedData = []
        this.loadedReport = { wrong: [], correct: [], success: [], error: [] }
      }
      this.$refs.form.validate().then(valid => {
        if (valid) {
          if (!data) {
            this.$q.notify({
              message: this.$t('error.exist'),
              color: 'warning'
            })
            return null
          }
          if (data.length < 2) return
          this.loadedColumns = []
          Object.keys(data[0]).forEach(e => {
            this.loadedColumns.push({
              name: e,
              field: e,
              label: data[0][e],
              align: 'left',
              sortable: true
            })
          })
          for (let i = 1; i < data.length; i++) {
            const e = data[i]
            const question = {}
            // Check kind
            const kind = this.kinds.find(x => x.code === e.A.toString())
            if (kind) {
              e.A = kind.name
              question.kind = parseInt(kind.code)
            } else {
              this.loadedReport.wrong.push(i)
              continue
            }
            // Check level
            const level = this.levels.find(x => x.code === e.B.toString())
            if (level) {
              e.B = level.name
              question.level = parseInt(level.code)
            } else {
              this.loadedReport.wrong.push(i)
              continue
            }
            // Check content
            if (e.C) {
              e.C = e.C.trim()
              question.content = e.C
            } else {
              this.loadedReport.wrong.push(i)
              continue
            }
            // Check correct
            if (e.D) {
              question.correct = []
              e.D.toString().trim().split(';').forEach(tmp => {
                if (tmp) question.correct.push(parseInt(tmp))
              })
              if (!question.correct.length) {
                this.loadedReport.wrong.push(i)
                continue
              }
            } else {
              this.loadedReport.wrong.push(i)
              continue
            }
            // Check answers
            question.answers = []
            if (e.E) question.answers.push({ value: 1, label: e.E })
            if (e.F) question.answers.push({ value: 2, label: e.F })
            if (e.G) question.answers.push({ value: 3, label: e.G })
            if (e.H) question.answers.push({ value: 4, label: e.H })
            if (e.I) question.answers.push({ value: 5, label: e.I })
            if (e.J) question.answers.push({ value: 6, label: e.J })
            if (e.K) question.answers.push({ value: 7, label: e.K })
            if (e.L) question.answers.push({ value: 8, label: e.L })
            question.tags = e.M ? e.M.toString().split(';') : []
            question.order = 1
            question.flag = 1
            this.form.questions.push(question)
            this.loadedData.push(e)
          }
        }
      })
    },
    onSelectUsers() {

    },
    onLoadedFileUsers(data) {
      data.splice(0, 1)
      const params = { users: data.map(x => x.A) }
      axiosApi.post('users/finds', params).then((x) => {
        this.loadedDataUsers = x
        this.form.users = this.loadedDataUsers.map(x => x.username)
        // this.pagination = props.pagination
        // this.loadedPaginationUsers.rowsNumber = x.rowsNumber
      }).finally(() => {
        this.loading = false
      })
    },
    onColumnsUsers(value) {
      var index = this.visibleColumns.indexOf(value)
      if (index < 0) this.visibleColumns.push(value)
      else this.visibleColumns.splice(index, 1)
    },
    onSubmit(action) {
      this.$refs.form.validate().then(valid => {
        if (valid) {
          if (!this.form.questions.length) {
            this.$q.notify({
              message: this.$t('question.required'),
              icon: 'error',
              color: 'negative'
            })
            return
          }
          this.form.type = this.type.code
          // this.form.minutes = (parseInt(this.testTime.hours) * 60) + parseInt(this.testTime.minutes)
          if (this.item) {
            this.loadingAdd = true
            axiosApi.put('exercises', this.form).then((x) => {
              if (x.ok) {
                const index = this.items.indexOf(this.item)
                if (index > -1) this.items.splice(index, 1, this.form)
              }
            }).finally(() => {
              this.loadingAdd = false
            })
          } else {
            this.form.flag = action
            if (action) this.loadingAdd = true
            else this.loadingDrafts = true
            axiosApi.post('exercises', this.form).then((x) => {
              this.reset()
              const type = this.types.find(t => t.code === x.data.type.toString())
              x.data.typeName = type.name
              this.items.push(x.data)
              this.loadedReport.success = x.result.success
              this.loadedReport.error = x.result.error
            }).finally(() => {
              this.loadingAdd = false
              this.loadingDrafts = false
            })
          }
        }
      })
    },
    reset() {
      new Promise((resolve, reject) => {
        this.step = 1
        this.loadedData = []
        this.form = { ...this.default }
        if (this.types.length) this.type = this.types[0]
        if (this.$refs.tmLoadFiles) this.$refs.tmLoadFiles.reset()
        this.loadedReport = { wrong: [], correct: [], success: [], error: [] }
        resolve()
      }).then(() => {
        if (this.$refs.form) this.$refs.form.resetValidation()
      })
    }
  }
}
</script>

<style>
</style>
