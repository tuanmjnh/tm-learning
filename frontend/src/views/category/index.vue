<template>
  <div>
    <div class="col-12 row">
      <div class="col-xs-12 col-sm-auto q-table__title text-h6">
        {{$t(`category.title_${$route.meta.type}`)}}</div>
    </div>
    <div class="col-12 row">
      <div class="col">
        <q-btn v-if="isRoutes.add" flat round dense icon="add" color="blue" @click="onAdd()">
          <q-tooltip v-if="!$q.platform.is.mobile">{{$t('global.add')}}</q-tooltip>
        </q-btn>
      </div>
      <div class="col-xs-5 col-sm-5 col-md-4">
        <q-input v-model="pagination.filter" :dense="$store.getters.dense.input" debounce="500"
          :placeholder="$t('global.search')">
          <template v-slot:append>
            <q-icon v-if="pagination.filter===''" name="search" />
            <q-icon v-else name="clear" class="cursor-pointer" @click="pagination.filter=''" />
          </template>
        </q-input>
      </div>
    </div>
    <!-- <q-tree ref="tree" class="col-12 col-sm-6" :nodes="items" :dense="$store.getters.dense.input" node-key="_id" :ticked.sync="ticked"
      :selected.sync="selected" :expanded.sync="expanded" tick-strategy="leaf" :filter="pagination.filter"
      :filter-method="onFilter" :no-nodes-label="$t('table.no_data')">
      <template v-slot:default-header="prop">
        <div class="row items-center" @mouseover="tooltipAction=prop.key" @mouseleave="tooltipAction=''">
          <q-icon :name="prop.node.icon" color="blue-grey" size="20px" class="q-mr-sm" />
          <div :class="['q-pr-md',prop.node.flag===1?'':'text-blue-grey-4']" :style="{color:prop.node.color}">
            {{ prop.node.meta && prop.node.meta.label ? $t(`category.${prop.node.meta.label}`) : prop.node.title }}
          </div>
          <template v-if="prop.key===tooltipAction">
            <q-icon v-if="isRoutes.add" name="add" color="blue" size="16px" class="q-pl-xs q-pr-xs"
              @click="onAdd(prop.node)" />
            <q-icon v-if="isRoutes.edit" name="edit" color="light-green" size="16px" class="q-pl-xs q-pr-xs"
              @click="onUpdate(prop.node)" />
            <template v-if="isRoutes.trash">
              <q-icon v-if="prop.node.flag===1" name="clear" color="negative" size="16px" class="q-pl-xs q-pr-xs"
                @click="onTrash(prop.node)" />
              <q-icon v-else name="restore" color="amber" size="16px" class="q-pl-xs q-pr-xs"
                @click="onTrash(prop.node)" />
            </template>
          </template>
        </div>
      </template>
    </q-tree>
    <q-separator></q-separator> -->
    <tm-tree :nodes="items" node-key="_id" node-label="label" :no-nodes-label="$t('table.no_data')"
      :selected.sync="selected" :ticked.sync="ticked" :expanded.sync="expanded"
      tick-strategy="leaf-child" :draggable="true" :filter-method="onFilter"
      :filter="pagination.filter" @on-drag-changed="onTreeDragChanged">
      <!-- <template v-slot:content-after="prop">
        {{ prop.node.label }} a
      </template> -->
      <template v-slot:content-after="prop">
        <div class="row items-center" @mouseover="tooltipAction=prop.node._id"
          @mouseleave="tooltipAction=''">
          <q-icon :name="prop.node.icon" color="blue-grey" size="20px" class="q-mr-sm" />
          <div :class="['node-label q-pr-md',prop.node.flag===1?'':'text-blue-grey-4']"
            :style="{color:prop.node.color?prop.node.color:'#009688'}">
            {{ prop.node.label }}
          </div>
          <template v-if="prop.node._id===tooltipAction">
            <q-icon v-if="isRoutes.add" name="add" color="blue" size="16px" class="q-pl-xs q-pr-xs"
              @click="onAdd(prop.node)" />
            <q-icon v-if="isRoutes.edit" name="edit" color="light-green" size="16px"
              class="q-pl-xs q-pr-xs" @click="onUpdate(prop.node)" />
            <template v-if="isRoutes.trash">
              <q-icon v-if="prop.node.flag===1" name="clear" color="negative" size="16px"
                class="q-pl-xs q-pr-xs" @click="onTrash(prop.node)" />
              <q-icon v-else name="restore" color="amber" size="16px" class="q-pl-xs q-pr-xs"
                @click="onTrash(prop.node)" />
            </template>
          </template>
        </div>
      </template>
    </tm-tree>
    <!-- <div class="row">selected: {{selected}}</div>
    <div class="row">ticked: {{ticked}}</div>
    <div class="row">expanded: {{expanded}}</div> -->
    <!-- Add dialog -->
    <q-dialog v-model="dialogAdd" persistent>
      <template-add :dialog.sync="dialogAdd" :item.sync="item" :items.sync="items"
        :dependent="dependent" :positions="positions" :expanded="expanded" />
    </q-dialog>
  </div>
</template>

<script>
import templateAdd from './add'
import { axiosApi } from '@/utils/http-client';
import { generateCategory } from '@/utils/tree'
import normalize from '@/utils/search'
import tmTree from '@/components/tm-tree'
export default {
  components: { templateAdd, tmTree },
  data() {
    return {
      dialogAdd: false,
      items: [],
      rootItems: [],
      item: null,
      dependent: null,
      selected: null,
      ticked: [],
      expanded: [],
      positions: [],
      filter: '',
      tooltipAction: '',
      pagination: {
        filter: '',
        sortBy: 'orders',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 1,
        flag: 1,
        type: this.$route.meta.type
      },
      isRoutes: {
        add: this.$router.has(`category-${this.$route.meta.type}-add`),
        edit: this.$router.has(`category-${this.$route.meta.type}-edit`),
        trash: this.$router.has(`category-${this.$route.meta.type}-trash`)
      }
    }
  },
  mounted() {
    this.onSelect({ pagination: this.pagination })
    this.onGetPosition({ key: 'position' })
  },
  watch: {
    dialogAdd(val) {
      if (!val) {
        this.item = null
        this.dependent = null
      }
    }
    // pagination: {
    //   handler(val) {
    //     this.onSelect({ pagination: this.pagination })
    //   },
    //   deep: true,
    //   immediate: true
    // }
  },
  methods: {
    onGetPosition(props) {
      axiosApi.get('types', { params: props }).then((x) => {
        if (x && x.data && x.data.length > 0) this.positions = x.data.map(x => ({ label: this.$t(`position.${x.code}`), value: x.code }))
      })
    },
    onSelect(props) {
      axiosApi.get('categories', { params: props.pagination }).then((x) => {
        this.rootItems = x.data
        this.items = generateCategory(x.data)
        // console.log(this.items)
      })
    },
    onFilter(node, filter) {
      const filt = normalize(filter.toLowerCase())
      const title = normalize(node.title)
      return title && title.toLowerCase().indexOf(filt) > -1
    },
    onResetFilter() {
      this.filter = ''
      this.$refs.filter.focus()
    },
    onChangeFlag(flag) {
      if (flag === this.pagination.flag) return
      this.selected = []
      this.pagination.flag = flag
      this.onSelect({ pagination: this.pagination })
    },
    onAdd(item) {
      this.dialogAdd = true
      if (item) this.dependent = item
    },
    onUpdate(item) {
      this.dialogAdd = true
      this.dependent = this.rootItems.find(x => x._id === item.dependent)
      this.item = item
    },
    onTrash(item) {
      this.$q.dialog({
        // dark: this.dark,
        title: this.$t('message_box.warning'),
        message: item.flag ? this.$t('message_box.trash') : this.$t('message_box.recover'),
        cancel: true,
        persistent: true
      }).onOk(() => {
        if (item) this.selected = [item]
        axiosApi.patch('categories', { _id: this.selected.map(x => x._id) }).then(x => {
          item.flag = item.flag === 1 ? 0 : 1
          // x.success.forEach(e => {
          //   e.flag = e.flag === 1 ? 0 : 1
          //   // const index = this.items.findIndex(x => x._id === e)
          //   // this.items.splice(index, 1)
          // })
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
    onDragTree({ node, index }) {
      // this.$nextTick(() => {
      if (node.level.toString() === 'NaN') {
        this.onSelect({ pagination: this.pagination })
      } else {
        node.orders = index
        axiosApi.put('categories/update-order', node).then((x) => {
          // console.log(index)
        })
      }
      // })
    },
    onTreeDragChanged(e) {
      if (e.added) return
      else if (e.removed) e = e.removed
      else if (e.moved) e = e.moved
      // console.log(e.element.dependent, e.element.level, e.element.orders)
      e.element.orders = e.newIndex
      axiosApi.put('categories/update-order', e.element).then((x) => {
        // console.log(x)
      })
    }
  }
}
</script>

<style lang="scss" scope>
.selected .node-label {
  color: #2196f3 !important;
}
.tooltip-action {
  position: absolute;
  .q-btn__content {
    i {
      font-size: 16px !important;
    }
  }
  &.add {
    right: -23px;
  }
  &.edit {
    right: -43px;
  }
  &.delete {
    right: -63px;
  }
}
.q-tree__node--selected .q-tree__node-header-content {
  color: initial;
}
.delete {
  color: #9e9e9e;
}
</style>
