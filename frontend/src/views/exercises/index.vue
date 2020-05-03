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
            {{ $t("exercises.title") }}
          </div>
          <q-space />
          <div class="col-xs-12 col-sm-auto self-center text-right">
            <div class="col-auto self-center">
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
            <!-- <select-category :categories="categories" :selected.sync="pagination.categories"
              data-key="_id" data-all :dense="$store.getters.dense.input"
              :labelTitle="$t('category.title_question')" :labelSelect="$t('category.select')"
              :labelAll="$t('category.select_all')" :labelClose="$t('global.cancel')"
              @on-selected="onSelectCategory" /> -->
          </div>
          <q-space />
          <div class="col-xs-12 col-sm-5">
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
          <q-td auto-width key="typeName" :props="props">
            {{ props.row.typeName }}
          </q-td>
          <q-td key="name" :props="props">
            {{ props.row.name }}
          </q-td>
          <q-td key="startAt" :props="props">
            {{ props.row.startAt.formatDate('DD/MM/YYYY HH:mm') }}
          </q-td>
          <q-td key="endAt" :props="props">
            {{ props.row.endAt.formatDate('DD/MM/YYYY HH:mm') }}
          </q-td>
          <q-td key="numberTest" :props="props">
            {{ props.row.numberTest }}
          </q-td>
          <q-td key="createdAt" :props="props">
            {{ props.row.createdAt.formatDate() }}
          </q-td>
          <q-td v-if="isRoutes.edit||isRoutes.trash||isRoutes.report" auto-width
            class="text-center">
            <q-btn v-if="isRoutes.report" flat round dense icon="pie_chart" color="teal"
              :size="$store.getters.dense.table?'sm':'md'" @click="onReport(props.row)">
              <q-tooltip v-if="!$q.platform.is.mobile">{{$t("report.view")}}</q-tooltip>
            </q-btn>
            <!-- <q-btn v-if="isRoutes.edit" flat round dense icon="edit" color="light-green"
              :size="$store.getters.dense.table ? 'sm' : 'md'" @click="onUpdate(props.row)">
              <q-tooltip v-if="!$q.platform.is.mobile">
                {{ $t("global.update") }}</q-tooltip>
            </q-btn> -->
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
      <tpl-add :dialog.sync="dialogAdd" :item.sync="selected[0]" :items.sync="items" :types="types"
        :kinds="kinds" :levels="levels" />
    </q-dialog>
    <!-- Report dialog -->
    <q-dialog v-model="dialogReport" :maximized="maximizedView" persistent>
      <tpl-report :dialog.sync="dialogReport" :maximized.sync="maximizedView"
        :exercise.sync="selected[0]" />
    </q-dialog>
  </div>
</template>

<script>
import tplAdd from './add'
import tplReport from './report'
import selectCategory from '@/views/category/components/select-category'
import tmLoadFiles from '@/components/tm-load-files'
import { axiosApi, axiosApiDebonce } from '@/utils/http-client'; // questions
export default {
  components: { tplAdd, tplReport },
  data() {
    return {
      loading: false,
      dialogAdd: false,
      dialogReport: false,
      maximizedView: false,
      items: [],
      selected: [],
      types: [],
      kinds: [],
      levels: [],
      isRoutes: {
        add: this.$router.has('library-exercises-add'),
        edit: this.$router.has('library-exercises-edit'),
        trash: this.$router.has('library-exercises-trash'),
        report: this.$router.has('library-exercises-report')
      },
      pagination: {
        filter: '',
        sortBy: 'createdAt',
        descending: true,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 1,
        categories: null,
        flag: 1
      },
      visibleColumns: ['createdAt', 'numberTest'],
      columns: [
        { name: 'typeName', field: 'typeName', label: 'exercises.type', align: 'left', sortable: true, required: true },
        { name: 'name', field: 'name', label: 'exercises.name', align: 'left', sortable: true, required: true },
        { name: 'startAt', field: 'startAt', label: 'exercises.startAt', align: 'left', sortable: true, required: true },
        { name: 'endAt', field: 'endAt', label: 'exercises.endAt', align: 'left', sortable: true, required: true },
        { name: 'numberTest', field: 'numberTest', label: 'exercises.numberTest', align: 'left', sortable: true },
        { name: 'createdAt', field: 'createdAt', label: 'global.created_at', align: 'left', sortable: true }
      ]
    }
  },
  async created() {
    this.onSelect({ pagination: this.pagination })
    this.types = await this.onGetTypes({ key: 'exercises_type' })
    this.kinds = await this.onGetTypes({ key: 'question_kind' })
    this.levels = await this.onGetTypes({ key: 'question_level' })
  },
  watch: {
    dialogAdd(val) {
      if (!val) this.selected = []
    }
  },
  methods: {
    onGetTypes(params) {
      return axiosApi.get('types', { params: params }).then((x) => {
        return x
      })
    },
    onSelect(params) {
      axiosApi.get('exercises', { params: params.pagination }).then((x) => {
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
        axiosApi.patch('exercises', { _id: this.selected.map(x => x._id) }).then((x) => {
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
    },
    onReport(item) {
      this.selected = [item]
      this.maximizedView = false
      this.dialogReport = true
    }
  }
}
</script>

<style>
</style>
