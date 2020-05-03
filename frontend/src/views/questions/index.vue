<template>
  <div>
    <q-table :data="items" :columns="columns" row-key="_id" flat :visible-columns="visibleColumns"
      :loading="$store.state.loading.get || $store.state.loading.patch" :selected.sync="selected"
      :dense="$store.getters.dense.table" selection="multiple" :no-data-label="$t('table.no_data')"
      :no-results-label="$t('table.no_filter_data')" :rows-per-page-label="$t('table.row_per_page')"
      :selected-rows-label="() => `${selected.length} ${$t('table.row_selected')}`"
      :rows-per-page-options="[10, 20, 50, 100, 200, 0]" :pagination.sync="pagination"
      @request="onSelect" :filter="pagination.filter" binary-state-sort>
      <template v-slot:top="props">
        <div class="col-12 row">
          <div class="col-xs-12 col-sm-auto q-table__title text-h6">
            {{ $t("question.title") }}
          </div>
          <q-space />
          <div class="col-xs-12 col-sm-auto self-center text-right">
            <div class="col-auto self-center">
              <q-btn v-if="isRoutes.add" flat round dense icon="note_add" color="green"
                @click="onDialogLoadFile">
                <q-tooltip v-if="!$q.platform.is.mobile">
                  {{$t("files.open_file")}}
                </q-tooltip>
              </q-btn>
              <q-btn v-if="isRoutes.add" flat round dense icon="add" color="blue"
                @click="dialogAdd = true">
                <q-tooltip v-if="!$q.platform.is.mobile">
                  {{$t("global.add")}}
                </q-tooltip>
              </q-btn>
              <q-btn v-if="isRoutes.trash && selected.length > 0 && pagination.flag" flat round
                dense color="negative" icon="delete" @click="onTrash()">
                <q-tooltip v-if="!$q.platform.is.mobile">
                  {{$t("global.delete")}}
                </q-tooltip>
              </q-btn>
              <q-btn v-if="isRoutes.trash && selected.length > 0 && !pagination.flag" flat round
                dense color="warning" icon="restore_page" @click="onTrash()">
                <q-tooltip v-if="!$q.platform.is.mobile">
                  {{$t("global.recover")}}
                </q-tooltip>
              </q-btn>
              <q-btn flat round dense :color="$store.getters.darkMode ? '' : 'grey-7'"
                icon="menu_open">
                <q-tooltip v-if="!$q.platform.is.mobile">
                  {{$t("table.display_columns")}}
                </q-tooltip>
                <q-menu fit>
                  <q-list dense style="min-width:120px">
                    <template v-for="(item, index) in columns">
                      <q-item clickable :key="index" v-if="!item.required"
                        @click="onColumns(item.name)"
                        :active="visibleColumns.indexOf(item.name) > -1 || false">
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
              <q-btn v-if="isRoutes.trash" flat round dense
                :color="$store.getters.darkMode ? '' : 'grey-7'" icon="more_vert">
                <q-tooltip v-if="!$q.platform.is.mobile">
                  {{$t("table.action")}}
                </q-tooltip>
                <q-menu auto-close>
                  <q-list dense bordered>
                    <q-item clickable>
                      <q-item-section no-wrap @click="onChangeFlag(1)">
                        {{$t("global.working")}}
                      </q-item-section>
                    </q-item>
                    <q-item clickable>
                      <q-item-section no-wrap @click="onChangeFlag(0)">
                        {{$t("global.locked")}}
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </div>
        </div>
        <div class="col-12 row">
          <div class="col-xs-12 col-sm-5 col-md-4">
            <select-category :categories="categories" :selected.sync="pagination.categories"
              data-key="_id" data-all :dense="$store.getters.dense.input"
              :labelTitle="$t('category.title_question')" :labelSelect="$t('category.select')"
              :labelAll="$t('category.select_all')" :labelClose="$t('global.cancel')"
              @on-selected="onSelectCategory" />
          </div>
          <q-space />
          <div class="col-xs-12 col-sm-6">
            <q-input v-model="pagination.filter" :dense="$store.getters.dense.input" debounce="500"
              :placeholder="$t('global.search')">
              <template v-slot:append>
                <q-icon v-if="pagination.filter === ''" name="search" />
                <q-icon v-else name="clear" class="cursor-pointer"
                  @click="pagination.filter = ''" />
              </template>
            </q-input>
          </div>
        </div>
      </template>
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width>
            <q-checkbox v-if="props.multipleSelect" v-model="props.selected"
              indeterminate-value="some" :dense="$store.getters.dense.table" />
          </q-th>
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            <span :class="['text-bold',$store.getters.darkMode?'':'text-blue-grey-10']">
              {{$t(col.label)}}
            </span>
          </q-th>
          <q-th v-if="isRoutes.edit||isRoutes.trash" auto-width>#</q-th>
        </q-tr>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-checkbox v-model="props.selected" color="primary"
              :dense="$store.getters.dense.table" />
          </q-td>
          <q-td auto-width key="kindName" :props="props">
            {{ props.row.kindName }}
          </q-td>
          <q-td auto-width key="levelName" :props="props">
            {{ props.row.levelName }}
          </q-td>
          <q-td key="content" :props="props" v-html="props.row.content">
          </q-td>
          <q-td key="order" :props="props">
            {{ props.row.order }}
          </q-td>
          <q-td v-if="isRoutes.edit || isRoutes.trash" auto-width class="text-center">
            <q-btn v-if="isRoutes.edit" flat round dense icon="edit" color="light-green"
              :size="$store.getters.dense.table ? 'sm' : 'md'" @click="onUpdate(props.row)">
              <q-tooltip v-if="!$q.platform.is.mobile">
                {{ $t("global.update") }}</q-tooltip>
            </q-btn>
            <template v-if="isRoutes.trash">
              <q-btn v-if="pagination.flag" flat round dense color="negative" icon="clear"
                :size="$store.getters.dense.table ? 'sm' : 'md'" @click="onTrash(props.row)">
                <q-tooltip v-if="!$q.platform.is.mobile">{{
                  $t("global.lock")
                }}</q-tooltip>
              </q-btn>
              <q-btn v-else flat round dense color="amber" icon="restore"
                :size="$store.getters.dense.table ? 'sm' : 'md'" @click="onTrash(props.row)">
                <q-tooltip v-if="!$q.platform.is.mobile">{{
                  $t("global.unlock")
                }}</q-tooltip>
              </q-btn>
            </template>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <!-- Add dialog -->
    <q-dialog v-model="dialogAdd" persistent>
      <template-add :dialog.sync="dialogAdd" :item.sync="selected[0]" :items.sync="items"
        :categories="categories" :kinds="kinds" :levels="levels" />
    </q-dialog>
    <!-- Load file dialog -->
    <q-dialog v-model="dialogLoadFile" :maximized="maximizedView" persistent>
      <q-card style="min-width:800px">
        <q-toolbar>
          <q-avatar :icon="$route.meta.icon" size="50px" />
          <q-toolbar-title>{{$t('files.data_file')}}</q-toolbar-title>
          <q-btn v-if="loadedData&&loadedData.length>0" flat round dense icon="publish" color="blue"
            :disable="loading" @click="onPushLoadedFile">
            <q-tooltip v-if="!$q.platform.is.mobile">{{$t('files.uploadData')}}</q-tooltip>
          </q-btn>
          <q-btn v-if="loadedData&&loadedData.length>0" flat round dense icon="replay" color="amber"
            :disable="loading" @click="onReplayLoadFile">
            <q-tooltip v-if="!$q.platform.is.mobile">{{$t('global.replay')}}</q-tooltip>
          </q-btn>
          <q-btn flat round dense :color="$store.state.app.darkMode?'':'grey-7'"
            :icon="maximizedView?'fullscreen_exit':'fullscreen'" :disable="loading"
            @click="maximizedView=!maximizedView">
            <q-tooltip v-if="!$q.platform.is.mobile">
              {{maximizedView?$t('table.normal_screen'):$t('table.full_screen')}}</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="close" v-close-popup :disable="loading">
            <q-tooltip v-if="!$q.platform.is.mobile">{{$t('global.cancel')}}</q-tooltip>
          </q-btn>
        </q-toolbar>
        <q-separator />
        <q-card-section class="text-center">
          <q-form ref="form">
            <div v-if="step===1">
              <div class="row q-gutter-xs q-mt-sm">
                <div class="col-12">
                  <select-category :categories="categories"
                    :selected.sync="loadedPagination.categories" data-key="_id"
                    :dense="$store.getters.dense.input" :labelTitle="$t('category.title_question')"
                    :labelSelect="$t('category.select')" :labelAll="$t('category.select_all')"
                    :labelClose="$t('global.cancel')" :rules="[v=>!!v||$t('error.required')]" />
                </div>
              </div>
              <tm-load-files :button="true" :label="$t('files.open_file')"
                :placeholder="$t('files.choose_file')" accept=".xls,.xlsx,.csv,.tsv,.txt,.json,.xml"
                @on-start="loading=true" @on-finish="onLoadedFile"
                :options="{header:'A',raw:true}" />
            </div>
            <q-table v-if="step===2" :data="loadedData" :columns="loadedColumns" row-key="id" dense
              :pagination.sync="loadedPagination" />
            <div v-if="step===3"
              v-html="$t('message_box.importSuccess',{number:loadedReport.success.length,total:loadedData.length})">
              <div class="row q-gutter-xs">
                <label class="text-positive">{{$t('question.successImport')}}:</label>
              </div>
              <div class="row q-gutter-xs q-mb-md">
                {{loadedReport.success.join(', ')}}
              </div>
              <div class="row q-gutter-xs">
                <label class="text-negative">{{$t('question.errorImport')}}:</label>
              </div>
              <div class="row q-gutter-xs">
                {{loadedReport.error.join(', ')}}
              </div>
              <!-- <q-list bordered separator>
                <q-item>
                  <q-item-section v-html=""></q-item-section>
                  <q-item-section avatar>
                    <q-badge color="positive">{{loadedReport.success}}</q-badge>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>Single line item</q-item-section>
                  <q-item-section avatar>
                    <q-badge color="negative">{{loadedReport.error}}</q-badge>
                  </q-item-section>
                </q-item>
              </q-list> -->
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import templateAdd from './add'
import selectCategory from '@/views/category/components/select-category'
import tmLoadFiles from '@/components/tm-load-files'
import { axiosApi, axiosApiDebonce } from '@/utils/http-client' // questions
export default {
  components: { templateAdd, selectCategory, tmLoadFiles },
  data() {
    return {
      loading: false,
      dialogAdd: false,
      dialogLoadFile: false,
      maximizedView: false,
      step: 1,
      loadedData: [],
      loadedReport: { wrong: [], correct: [], success: [], error: [] },
      items: [],
      selected: [],
      categories: [],
      kinds: [],
      levels: [],
      isRoutes: {
        add: this.$router.has('library-question-add'),
        edit: this.$router.has('library-question-edit'),
        trash: this.$router.has('library-question-trash')
      },
      pagination: {
        filter: '',
        sortBy: 'order',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 1,
        categories: null,
        flag: 1
      },
      visibleColumns: [],
      columns: [
        { name: 'kindName', field: 'kindName', label: 'question.kind', align: 'left', sortable: true, required: true },
        { name: 'levelName', field: 'levelName', label: 'question.level', align: 'left', sortable: true, required: true },
        { name: 'content', field: 'content', label: 'question.content', align: 'left', sortable: true, required: true },
        { name: 'order', field: 'order', label: 'global.order', align: 'right', sortable: true }
      ],
      loadedPagination: {
        filter: '',
        sortBy: 'order',
        descending: false,
        page: 1,
        rowsPerPage: 15,
        categories: null,
        flag: 1
      },
      loadedColumns: []
    }
  },
  async created() {
    this.onGetCategory({ type: 'question' })
    this.kinds = await this.onGetTypes({ key: 'question_kind' })
    this.levels = await this.onGetTypes({ key: 'question_level' })
    this.onSelect({ pagination: this.pagination })
  },
  watch: {
    dialogAdd(val) {
      if (!val) this.selected = []
    },
    dialogLoadFile(val) {
      if (!val) this.onReplayLoadFile()
    }
  },
  methods: {
    onGetCategory(params) {
      axiosApi.get('categories', { params: params }).then((x) => {
        this.categories = x.data
      })
    },
    onSelectCategory(value) {
      if (value) {
        // this.pagination.categories = value._id
        this.onSelect({ pagination: this.pagination })
      }
    },
    onGetTypes(params) {
      return axiosApi.get('types', { params: params }).then((x) => {
        return x
      })
    },
    onDialogLoadFile() {
      this.dialogLoadFile = true
      this.maximizedView = false
      this.loadedData = []
    },
    onLoadedFile(data) {
      this.step = 2
      this.loading = false
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
          data.splice(0, 1)
          this.loadedData = data
        }
      })
    },
    onPushLoadedFile() {
      this.loading = true
      const questions = []
      for (let i = 0; i < this.loadedData.length; i++) {
        const e = this.loadedData[i]
        // const values = Object.values(e)
        // if (values.length < 4) {
        //   this.loadedReport.wrong.push(i)
        //   continue
        // }
        const question = {
          categories: this.loadedPagination.categories
        }
        question.kind = parseInt(e.A)
        question.level = parseInt(e.B)
        if (e.C) {
          question.content = e.C.trim()
        } else {
          this.loadedReport.wrong.push(i)
          continue
        }
        if (e.D) {
          question.correct = []
          e.D.toString().trim().split(';').forEach(tmp => {
            question.correct.push(parseInt(tmp))
          })
        } else {
          this.loadedReport.wrong.push(i)
          continue
        }
        question.answers = []
        if (e.E) question.answers.push(e.E)
        if (e.F) question.answers.push(e.F)
        if (e.G) question.answers.push(e.G)
        if (e.H) question.answers.push(e.H)
        if (e.I) question.answers.push(e.I)
        if (e.J) question.answers.push(e.J)
        if (e.K) question.answers.push(e.K)
        if (e.L) question.answers.push(e.L)
        question.tags = e.M ? e.M.toString().split(';') : []
        question.order = 1
        question.flag = 1
        questions.push(question)
        this.loadedReport.correct.push(i)
      }
      if (this.loadedReport.wrong.length) {
        this.$q.dialog({
          title: this.$t('message_box.warning'),
          message: this.$t('question.msgPushWrong', { total: this.loadedReport.wrong.length }) + this.loadedReport.wrong.join(', ') + '<br/>' + this.$t('message_box.continue'),
          cancel: true,
          persistent: true,
          html: true
        }).onOk(() => {
          axiosApi.post('questions/import', questions).then((x) => {
            this.loadedReport.success = x.success
            this.loadedReport.error = x.error
          }).finally(() => {
            this.step = 3
            this.loading = false
            this.onSelect({ pagination: this.pagination })
          })
        })
      }
    },
    onReplayLoadFile() {
      this.step = 1
      this.loadedData = []
      this.loadedPagination.categories = null
      this.loadedReport = { wrong: [], correct: [], success: [], error: [] }
    },
    onSelect(params) {
      axiosApi.get('questions', { params: params.pagination }).then((x) => {
        this.items = x.data
        this.pagination = params.pagination
        this.pagination.rowsNumber = x.rowsNumber
      })
    },
    onChangeFlag(flag) {
      if (flag === this.pagination.flag) return
      this.selected = []
      this.pagination.flag = flag
      this.onSelect({ pagination: this.pagination })
    },
    onColumns(value) {
      var index = this.visibleColumns.indexOf(value)
      if (index < 0) this.visibleColumns.push(value)
      else this.visibleColumns.splice(index, 1)
    },
    onUpdate(item) {
      this.dialogAdd = true
      this.selected = [item]
    },
    onTrash(item) {
      this.$q.dialog({
        title: this.$t('message_box.warning'),
        message: this.pagination.flag ? this.$t('message_box.lock') : this.$t('message_box.unlock'),
        cancel: true,
        persistent: true
      }).onOk(() => {
        if (item) this.selected = [item]
        axiosApi.patch('questions', { _id: this.selected.map(x => x._id) }).then((x) => {
          x.success.forEach(e => {
            const index = this.items.findIndex(x => x._id === e)
            this.items.splice(index, 1)
          })
        }).finally(() => {
          this.selected = []
        })
      }).onOk(() => {
        // console.log('>>>> second OK catcher')
      }).onCancel(() => {
        this.selected = []
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    }
  }
}
</script>

<style>
</style>
