<template>
  <!-- <draggable :list="nodes" :move="checkMove" :group="{ name: 'g1' }" tag="div" class="tm-nodes"> -->
  <div class="tm-node" v-if="node.show">
    <div :class="['tm-node-content',node.children&&node.children.length?'tm-node-expand':'']">
      <div :class="selected&&selected[nodeKey]===node[nodeKey]?'selected':''">
        <!-- <div :class="node.selected?'selected':''"> -->
        <div class="node-expand">
          <i v-if="node.children&&node.children.length" :class="['material-icons tree-arrow',node.expanded?'open':'']"
            @click="onToggle">play_arrow</i>
        </div>
        <!-- <i v-else class="node-prefix"></i> -->
        <q-checkbox v-model="node.ticked" v-if="ticked!==undefined" @input="$emit('on-tick',node)" dense
          class="node-checkbox" />
        <div class="node-item" @click="onClickNode" @dblclick="onMakeFolder">
          <slot v-if="slotContentAfter" name="content-after" :node="node"></slot>
          <div v-if="!slotContentAfter" class="node-icon material-icons">{{node.icon}}</div>
          <div v-if="!slotContentAfter" class="node-label">{{ node[nodeLabel] }}</div>
        </div>
      </div>
    </div>
    <!-- <transition name="slide"> -->
    <draggable v-if="draggable" :list="node.children" :group="{ name: 'people' }" tag="div"
      class="tm-nodes tm-node-child" transition-show="flip-up" transition-hide="flip-down"
      @change="$emit('on-drag-changed', $event)">
      <!-- <div class="tm-node-child" v-show="node.expanded" v-if="isFolder"> -->
      <tm-tree-node v-show="node.expanded" v-for="(child, index) in node.children" :key="index" :node="child"
        :node-key="nodeKey" :node-label="nodeLabel" :is-children="true" :selected.sync="selected" :ticked.sync="ticked"
        :expanded.sync="expanded" :expanded-all="expandedAll" :expanded-express="expandedExpress" :parent.sync="node"
        :draggable="draggable" :filter="filter" :filter-method="filterMethod"
        @make-folder="$emit('make-folder', $event)" @add-node="$emit('add-node', $event)"
        @click-node="$emit('click-node', $event)" @on-tick="$emit('on-tick', $event)"
        @on-expand="$emit('on-expand', $event)" @on-drag-changed="$emit('on-drag-changed', $event)"
        :slot-content-after="slotContentAfter">
        <template v-if="slotContentAfter" v-slot:content-after="prop">
          <slot name="content-after" :node="prop.node"></slot>
        </template>
      </tm-tree-node>
      <q-btn v-if="addButton" flat round size="sm" color="primary" icon="add" class="node-add" />
      <!-- </div> -->
    </draggable>
    <div v-else class="tm-nodes tm-node-child">
      <tm-tree-node v-show="node.expanded" v-for="(child, index) in node.children" :key="index" :node="child"
        :node-key="nodeKey" :node-label="nodeLabel" :is-children="true" :selected.sync="selected" :ticked.sync="ticked"
        :expanded.sync="expanded" :expanded-all="expandedAll" :expanded-express="expandedExpress" :parent.sync="node"
        :filter="filter" :filter-method="filterMethod" @make-folder="$emit('make-folder', $event)"
        @add-node="$emit('add-node', $event)" @click-node="$emit('click-node', $event)"
        @on-tick="$emit('on-tick', $event)" @on-expand="$emit('on-expand', $event)"
        @on-drag-changed="$emit('on-drag-changed', $event)" :slot-content-after="slotContentAfter">
        <template v-if="slotContentAfter" v-slot:content-after="prop">
          <slot name="content-after" :node="prop.node"></slot>
        </template>
      </tm-tree-node>
    </div>
    <!-- </transition> -->
  </div>
  <!-- </draggable> -->
</template>

<script>
import draggable from 'vuedraggable'
export default {
  name: 'tm-tree-node',
  components: { draggable },
  props: {
    // nodes: { type: Array, default: () => [] },
    node: { type: Object, default: () => { } },
    nodeKey: { type: String, default: 'id' },
    nodeLabel: { type: String, default: 'label' },
    selected: { type: Object, default: () => { } },
    ticked: { type: Array, default: () => undefined },
    expanded: { type: Array, default: () => [] },
    expandedExpress: { type: Boolean, default: false },
    expandedAll: { type: Boolean, default: false },
    addExpress: { type: Boolean, default: false },
    parent: { type: Object, default: null },
    addButton: { type: Boolean, default: false },
    draggable: { type: Boolean, default: false },
    filter: { type: String, default: '' },
    filterMethod: { type: Function },
    slotContentAfter: { type: Boolean, default: false }
  },
  data() {
    return {
      isOpen: false,
      checkBox: false
    }
  },
  computed: {
    // isFolder: function() {
    //   return this.node.children && this.node.children.length
    // },
    // slotContentAfter() {
    //   // console.log(this.$scopedSlots)
    //   return this.$scopedSlots['content-after'] || false
    // },
    // isShow() {
    //   return this.node.show
    // },
    nodeSelected() {
      // console.log(this.node.selected)
      return this.node.selected || false
    }
  },
  created() {
    // selected
    if (this.selected && this.selected[this.nodeKey] === this.node[this.nodeKey]) this.node.selected = true
    // expanded
    if (this.expandedAll) this.node.expanded = true
    else {
      if (this.expanded && this.expanded.length && this.expanded.includes(this.node[this.nodeKey])) this.node.expanded = true
      // if (this.expanded.includes(this.node[this.nodeKey])) this.isOpen = true
    }
    // ticked
    if (this.ticked && this.ticked.length) {
      if (this.ticked.includes(this.node[this.nodeKey])) {
        this.node.ticked = true
        this.$emit('on-tick', this.node, true)
      } else this.node.ticked = false
      if (this.parent) {
        this.node.dependent = this.parent[this.nodeKey]
        this.node.level = this.parent.level + 1
      }
    } else this.node.ticked = false
    // Show
    this.node.show = true
  },
  watch: {
    // ticked(val) {
    //   if (this.ticked.includes(this.node[this.nodeKey])) this.node.ticked = true
    //   else this.node.ticked = false
    // }
    // parent: {
    //   handler(val) {
    //     if (val) {
    //       this.node.dependent = val[this.nodeKey]
    //       this.node.level = val.level + 1
    //       console.log(this.parent.title)
    //     } else {
    //       this.node.dependent = null
    //       this.node.level = 1
    //     }
    //   },
    //   deep: true,
    //   immediate: true
    // }
    // parent(val) {
    //   console.log(val)
    // },
    // filter(val) {
    //   if (typeof this.filterMethod === 'function') {
    //     this.node.show = this.filterMethod(this.node, val)
    //     if (this.parent && this.node.show) {
    //       this.parent.show = true
    //       console.log(this.parent)
    //     }
    //   }
    // }
  },
  methods: {
    onToggle() {
      if (this.node.children && this.node.children.length) {
        this.node.expanded = !this.node.expanded
        // this.isOpen = !this.isOpen
        this.$emit('on-expand', this.node)
      }
    },
    onClickNode() {
      if (this.node.children && this.node.children.length && this.expandedExpress) this.node.expanded = !this.node.expanded
      // this.isOpen = !this.isOpen
      this.node.selected = !this.node.selected
      this.$emit('click-node', this.node)
      // if (this.selected === this.node[this.nodeKey]) this.$emit('update:selected', null)
      // else this.$emit('update:selected', this.node[this.nodeKey])
      // console.log(this.selected)
    },
    onMakeFolder() {
      if (!this.node.children && this.node.children.length < 1 && this.addExpress) {
        this.$emit('make-folder', this.node)
        this.node.expanded = true
        // this.isOpen = true
      }
    },
    onAddNode(node) {
      this.$emit('add-node', node)
    },
    getSelected() {
      // this.node.selected = !this.node.selected
      return this.node.selected ? 'selected' : ''
    },
    checkMove(e) {
      this.$emit('on-drag', e)
      // window.console.log('Future index: ' + e.draggedContext.futureIndex)
    }
  }
}
</script>

<style lang="scss">
// .tm-nodes {
// min-height: 50px;
// outline: 1px dashed;
// }
.tm-node {
  color: #607d8b;
  cursor: pointer;
  padding: 5px 0px;
  // padding-left: 25px;
  .node-prefix {
    padding-left: 25px;
  }
  .node-checkbox {
    margin-right: 5px;
  }
  .node-item {
    display: inline-flex;
    vertical-align: middle;
    flex-wrap: nowrap;
    .node-icon {
      font-size: 20px;
      margin-right: 8px;
    }
  }
  .node-expand {
    display: inline-flex;
    vertical-align: middle;
    width: 20px;
    .tree-arrow {
      transition: transform 0.3s;
      font-size: 16px;
      color: #9e9e9e;
      padding-right: 3px;
      &.open {
        transform: rotate3d(0, 0, 1, 90deg);
      }
    }
  }
  .selected {
    color: #2196f3;
  }
  // .checkbox{
  // padding-left: 3px;
  // }
}
</style>
