<template>
  <div class="dialog-categories">
    <!-- v-model="selectedLocal.label"-->
    <q-input :value="selectedLocal?selectedLocal.label:''" v-uppercaseFirst :dense="dense" readonly
      :label="labelTitle" :rules="rules">
      <template v-slot:after>
        <q-btn round dense flat icon="pageview" @click="dialog=!dialog">
          <q-tooltip>{{labelSelect}}</q-tooltip>
        </q-btn>
      </template>
    </q-input>
    <q-dialog v-model="dialog">
      <q-card style="width:500px">
        <q-toolbar>
          <q-toolbar-title>{{labelTitle}}</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup>
            <q-tooltip>{{labelClose}}</q-tooltip>
          </q-btn>
        </q-toolbar>
        <q-card-section>
          <tm-tree :nodes="categoriesLocal" node-key="_id" node-label="label"
            :no-nodes-label="$t('table.no_data')" :expanded-all="true"
            :selected.sync="selectedLocal" @on-selected="onSelected">
            <template v-slot:content-after="prop">
              <div class="row items-center">
                <q-icon :name="prop.node.icon" color="blue-grey" size="20px" class="q-mr-sm" />
                <div :class="['node-label q-pr-md',prop.node.flag===1?'':'text-blue-grey-4']"
                  :style="{color:prop.node.color?prop.node.color:'#009688'}">
                  {{ prop.node.label }}
                </div>
              </div>
            </template>
          </tm-tree>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import tmTree from '@/components/tm-tree'
import * as treeRouters from '@/utils/tree'
// import * as api from '@/api/categories'
export default {
  components: { tmTree },
  props: {
    categories: { type: Array, default: null },
    selected: { default: undefined },
    dataKey: { type: String, default: 'id' },
    dataAll: { type: Boolean, default: false },
    // dialog: { type: Boolean, default: true },
    dense: { type: Boolean, default: true },
    labelTitle: { type: String, default: 'Category of product' },
    labelSelect: { type: String, default: 'Select category' },
    labelAll: { type: String, default: '-- Select all --' },
    labelClose: { type: String, default: 'Close' },
    rules: { default: null }
  },
  data() {
    return {
      dialog: false,
      selectedLocal: null,
      categoriesLocal: []
      // categories: [],
    }
  },
  watch: {
    categories: {
      handler(val) {
        const all = [{
          _id: null,
          dependent: null,
          icon: 'graphic_eq',
          color: '#3f51b5',
          flag: 1,
          label: this.labelAll
        }]
        this.categoriesLocal = this.dataAll ? [...all, ...treeRouters.generateCategory(val)] : treeRouters.generateCategory(val)
        // const item = treeRouters.findNode(this.categories, this.selected, this.dataKey)
        if (this.selected) {
          const item = this.categories.find(x => x[this.dataKey] === this.selected)
          this.selectedLocal = item
        } else {
          if (this.dataAll) this.selectedLocal = this.categoriesLocal[0]
        }
      },
      deep: true,
      immediate: true
    }
    // selected(val) {
    //   // const item = treeRouters.findNode(this.categories, this.selected, this.dataKey)
    //   console.log(val)
    //   if (!this.selected) {
    //     this.selectedLocal = this.categoriesLocal[0]
    //   } else {
    //     const item = this.categories.find(x => x[this.dataKey] === this.selected)
    //     this.selectedLocal = item
    //   }
    // }
  },
  computed: {
    // selectedLocal: {
    //   get: function() {
    //     const item = treeRouters.findNode(this.categories, this.selected, this.dataKey)
    //     return item
    //   },
    //   set: function(val) {
    //     if (val) this.$emit('update:selected', val[this.dataKey])
    //   }
    // }
  },
  // created() {
  // this.onGetCategory()
  // },
  methods: {
    // onGetCategory() {
    //   api.select().then((x) => {
    //     this.categories = treeRouters.generateCategory(x.data)
    //     const all = {
    //       _id: null,
    //       icon: 'graphic_eq',
    //       color: '#3f51b5',
    //       flag: 1,
    //       label: this.$t('category.select_all')
    //     }
    //     this.categories = [...[all], ...this.categories]
    //     this.selected = this.categories[0]
    //   })
    // },
    onSelected(value) {
      // if (!this.selected) this.selected = value
      if (!this.selectedLocal) this.selectedLocal = value
      if (this.selected !== value[this.dataKey]) {
        this.$emit('on-selected', value)
        this.$emit('update:selected', value[this.dataKey])
      }
      this.dialog = false
    }
  }
}
</script>

<style>
</style>
