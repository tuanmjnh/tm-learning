<template>
  <div>
    <q-table :data="items" :columns="columns" row-key="_id" flat :visible-columns="visibleColumns"
      :loading="$store.state.loading.get || $store.state.loading.patch" :selected.sync="selected"
      :dense="$store.getters.dense.table" selection="multiple" :no-data-label="$t('table.no_data')"
      :rows-per-page-label="$t('table.row_per_page')" :selected-rows-label="
        () => `${selected.length} ${$t('table.row_selected')}`
      " :rows-per-page-options="[10, 20, 50, 100, 200, 0]" :pagination.sync="pagination"
      @request="onSelect" :filter="pagination.filter" binary-state-sort>
      <template v-slot:top="props">
        <div class="col-12 row">
          <div class="col-xs-12 col-sm-auto q-table__title text-h6">
            {{ $t("roles.list") }}
          </div>
          <q-space />
          <div class="col-xs-12 col-sm-auto self-center text-right">
            <q-btn v-if="isRoutes.add" flat round dense icon="add" color="blue"
              @click="dialogAdd = true">
              <q-tooltip v-if="!$q.platform.is.mobile">{{
                $t("global.add")
              }}</q-tooltip>
            </q-btn>
            <q-btn v-if="isRoutes.trash && selected.length > 0 && pagination.flag" flat round dense
              color="negative" icon="delete" @click="onTrash()">
              <q-tooltip v-if="!$q.platform.is.mobile">{{
                $t("global.delete")
              }}</q-tooltip>
            </q-btn>
            <q-btn v-if="isRoutes.trash && selected.length > 0 && !pagination.flag" flat round dense
              color="warning" icon="restore_page" @click="onTrash()">
              <q-tooltip v-if="!$q.platform.is.mobile">{{
                $t("global.recover")
              }}</q-tooltip>
            </q-btn>
            <q-btn flat round dense :color="$store.getters.darkMode ? '' : 'grey-7'"
              icon="menu_open">
              <q-tooltip v-if="!$q.platform.is.mobile">{{
                $t("table.display_columns")
              }}</q-tooltip>
              <q-menu fit>
                <q-list dense style="min-width:100px">
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
                {{
                  props.inFullscreen
                    ? $t("table.normal_screen")
                    : $t("table.full_screen")
                }}</q-tooltip>
            </q-btn>
            <q-btn v-if="isRoutes.trash" flat round dense
              :color="$store.getters.darkMode ? '' : 'grey-7'" icon="more_vert">
              <q-tooltip v-if="!$q.platform.is.mobile">{{
                $t("table.action")
              }}</q-tooltip>
              <q-menu auto-close>
                <q-list dense bordered>
                  <q-item clickable>
                    <q-item-section no-wrap @click="onChangeFlag(1)">{{
                      $t("global.working")
                    }}</q-item-section>
                  </q-item>
                  <q-item clickable>
                    <q-item-section no-wrap @click="onChangeFlag(0)">{{
                      $t("global.trash")
                    }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </div>
        <div class="col-12 row">
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
            <span v-if="$store.getters.darkMode" class="text-bold">{{
              $t(col.label)
            }}</span>
            <span v-else class="text-bold text-blue-grey-10">{{
              $t(col.label)
            }}</span>
          </q-th>
          <q-th v-if="isRoutes.edit || isRoutes.trash" auto-width>#</q-th>
        </q-tr>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-checkbox v-model="props.selected" color="primary"
              :dense="$store.getters.dense.table" />
          </q-td>
          <q-td key="name" :props="props">
            <q-badge class="bri" :style="{ backgroundColor: props.row.color }">
              {{ props.row.name }}
            </q-badge>
          </q-td>
          <q-td key="key" :props="props">
            {{ props.row.key }}
          </q-td>
          <q-td key="level" :props="props">
            {{ props.row.level }}
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
                  $t("global.trash")
                }}</q-tooltip>
              </q-btn>
              <q-btn v-else flat round dense color="amber" icon="restore"
                :size="$store.getters.dense.table ? 'sm' : 'md'" @click="onTrash(props.row)">
                <q-tooltip v-if="!$q.platform.is.mobile">{{
                  $t("global.recover")
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
        :routes="routes" />
    </q-dialog>
  </div>
</template>

<script>
import templateAdd from './add'
import { axiosApi } from '@/utils/http-client'
// import * as apiRoutes from '@/api/routes'
import * as tree from '@/utils/tree'
import { dynamic } from '@/router/routes'
export default {
  components: { templateAdd },
  data() {
    return {
      dialogFilter: false,
      dialogAdd: false,
      items: [],
      selected: [],
      routes: [],
      // rootRoutes: [],
      isRoutes: {
        add: this.$router.has('manager-roles-add'),
        edit: this.$router.has('manager-roles-edit'),
        trash: this.$router.has('manager-roles-trash')
      },
      pagination: {
        filter: '',
        sortBy: 'level',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 1,
        flag: 1
      },
      visibleColumns: ['level'],
      columns: [
        { name: 'name', field: 'name', label: 'roles.name', align: 'left', sortable: true, required: true }, // row => this.$t(`roles.${row.name}`)
        { name: 'key', field: 'key', label: 'roles.key', align: 'left', sortable: true, required: true },
        { name: 'level', field: 'level', label: 'global.level', align: 'right', sortable: true }
      ]
    }
  },
  created() {
    this.routes = tree.generateRoutesRoles(dynamic)
  },
  mounted() {
    this.onSelect({ pagination: this.pagination })
    // this.onSelectRoutes({ flag: 1 })
  },
  watch: {
    dialogAdd(val) {
      if (!val) this.selected = []
    }
  },
  methods: {
    onSelect(props) {
      axiosApi.get('roles', { params: props.pagination }).then((x) => {
        this.items = x.data
        this.pagination = props.pagination
        this.pagination.rowsNumber = x.rowsNumber
      })
    },
    // async onSelectRoutes() {
    //   this.routes = dynamic
    //   console.log(this.routes)
    // },
    // onSelectRoutes(props) {
    //   apiRoutes.select(props).then(async x => {
    //     if (x && x.data && x.data.length > 0) {
    //       this.rootRoutes = x.data
    //       this.routes = await treeRouters.generateRoutes(x.data)
    //     }
    //   })
    // },
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
        // dark: this.dark,
        title: this.$t('message_box.warning'),
        message: this.pagination.flag ? this.$t('message_box.trash') : this.$t('message_box.recover'),
        cancel: true,
        persistent: true
      }).onOk(() => {
        if (item) this.selected = [item]
        axiosApi.patch('roles', { _id: this.selected.map(x => x._id) }).then((x) => {
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
