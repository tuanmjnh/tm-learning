<template>
  <div v-if="nodes&&nodes.length>0" class="tm-tree">
    <draggable v-if="draggable" :list="nodes" @change="onDragChanged" :group="{ name: 'people' }" tag="div"
      class="tm-nodes">
      <tm-tree-node v-for="(node, index) in nodes" :key="index" :node="node" :node-key="nodeKey" :node-label="nodeLabel"
        :selected.sync="selected" :ticked.sync="ticked" :expanded.sync="expanded" :expanded-all="expandedAll"
        :expanded-express="expandedExpress" :add-button="addButtonChild" :add-express="addExpress" :parent="null"
        :draggable="draggable" :filter="filter" :filter-method="filterMethod" @on-tick="onTick"
        @make-folder="onMakeFolder" @add-node="onAddChildNode" @click-node="onClickNode" @on-expand="onExpand"
        @on-drag-changed="onDragChanged" :slot-content-after="slotContentAfter">
        <template v-if="slotContentAfter" v-slot:content-after="prop">
          <slot name="content-after" :node="prop.node"></slot>
        </template>
      </tm-tree-node>
    </draggable>
    <div v-else class="tm-nodes">
      <tm-tree-node v-for="(node, index) in nodes" :key="index" :node="node" :node-key="nodeKey" :node-label="nodeLabel"
        :selected.sync="selected" :ticked.sync="ticked" :expanded.sync="expanded" :expanded-all="expandedAll"
        :expanded-express="expandedExpress" :add-button="addButtonChild" :add-express="addExpress" :parent="null"
        :filter="filter" :filter-method="filterMethod" @on-tick="onTick" @make-folder="onMakeFolder"
        @add-node="onAddChildNode" @click-node="onClickNode" @on-expand="onExpand" @on-drag-changed="onDragChanged"
        :slot-content-after="slotContentAfter">
        <template v-if="slotContentAfter" v-slot:content-after="prop">
          <slot name="content-after" :node="prop.node"></slot>
        </template>
      </tm-tree-node>
    </div>
    <div v-if="addButtonMain" class="node-add" @click="onAddRootNode">+</div>
  </div>
  <label v-else class="no-data-label">{{noNodesLabel}}</label>
</template>

<script>
import draggable from 'vuedraggable'
import tmTreeNode from './node'
import _ from 'lodash'
export default {
  name: 'tm-tree',
  components: { tmTreeNode, draggable },
  props: {
    nodes: { type: Array, default: () => [] },
    nodeKey: { type: String, default: 'id' },
    nodeLabel: { type: String, default: 'label' },
    selected: { type: Object, default: () => { } },
    ticked: { type: Array, default: () => undefined },
    tickStrategy: { type: String, default: undefined },
    expanded: { type: Array, default: () => [] },
    expandedExpress: { type: Boolean, default: false },
    expandedAll: { type: Boolean, default: false },
    addExpress: { type: Boolean, default: false },
    addButtonMain: { type: Boolean, default: false },
    addButtonChild: { type: Boolean, default: false },
    noNodesLabel: { type: String, default: 'No data available' },
    draggable: { type: Boolean, default: false },
    filter: { type: String, default: '' },
    filterMethod: { type: Function }
  },
  data() {
    return {
    }
  },
  watch: {
    // nodes: {
    //   handler(val) {
    //     this.nodesClone = [...this.nodes]
    //     console.log(this.nodes === this.nodesClone)
    //     console.log(val)
    //   }
    // deep: true
    // immediate: true
    // },
    filter(val) {
      if (typeof this.filterMethod === 'function') {
        this.onFilter(this.nodes)
      }
    }
  },
  computed: {
    slotContentAfter() {
      // console.log(this.$scopedSlots['content-after'])
      return !!this.$scopedSlots['content-after']
    }
  },
  created() {
    if (this.ticked && this.ticked.length) {
      this.ticked.forEach(e => {
        this.onTickedParentAll(this.nodes, e, this.nodeKey)
      })
    }
  },
  methods: {
    onClickNode(node) {
      if (this.selected && this.selected[this.nodeKey] === node[this.nodeKey]) {
        this.$emit('update:selected', null)
      } else {
        this.$emit('update:selected', node)
      }
      this.$emit('on-selected', node)
      // console.log(node)
    },
    onMakeFolder: function(node) {
      // Vue.set(node, 'children', [])
      this.$set(node, 'children', [])
      this.onAddChildNode(node)
    },
    onAddRootNode: function(node) {
      this.nodes.push({ [this.nodeKey]: 'new stuff' })
    },
    onAddChildNode: function(node) {
      const newNode = { _id: Math.random(), [this.nodeKey]: 'new stuff' }
      // if (!node.children) this.$set(node, 'children', [])
      // const tmp = node.children.push(node)
      node.children.push(newNode)
      this.expanded.push(node[this.nodeKey])
      // this.$set(node, 'children', tmp)
      // node.children.push({ title: 'new stuff' })
    },
    onTick(node, ticked, children = false) {
      if (this.tickStrategy === 'leaf' || this.tickStrategy === 'leaf-child' || this.tickStrategy === 'leaf-filtered') { // leaf
        this.onTickedChildren(node, ticked)
        this.onTickedParentAll(this.nodes, node, this.nodeKey)
      } else { // strict
        if (node.ticked) {
          if (this.ticked.indexOf(node[this.nodeKey]) < 0) this.ticked.push(node[this.nodeKey])
        } else {
          const index = this.ticked.indexOf(node[this.nodeKey])
          if (index > -1) this.ticked.splice(index, 1)
        }
      }
    },
    onExpand(node) {
      if (node.expanded && this.expanded.indexOf(node[this.nodeKey]) < 0) this.expanded.push(node[this.nodeKey])
      else {
        const index = this.expanded.indexOf(node[this.nodeKey])
        if (index > -1) this.expanded.splice(index, 1)
      }
    },
    getParent(root, node, key, reset = true) {
      for (let i = 0; i < root.length; i++) {
        const e = root[i]
        if (reset) this.parents = []
        this.parents.push(e)
        // console.log(e[key] === node[key], e[key], node[key])
        if (e[key] === node[key]) {
          // return rs
          // console.log('break')
          return e
        }
        if (e.children) {
          this.getParent(e.children, node, key, false)
        }
      }
      return this.parents
    },
    onTickedChildren(node, ticked, children = false) {
      if (children) node.ticked = ticked
      if (node.ticked) {
        // if (this.tickStrategy === 'leaf') {
        if (this.tickStrategy === 'leaf-filtered') {
          if (this.ticked.indexOf(node[this.nodeKey] && node.show) < 0) this.ticked.push(node[this.nodeKey])
        } else {
          if (this.ticked.indexOf(node[this.nodeKey]) < 0) this.ticked.push(node[this.nodeKey])
        }
        // }
        if (node.children && node.children.length > 0) {
          node.children.forEach(e => { this.onTickedChildren(e, node.ticked, true) })
        }
      } else {
        // if (this.tickStrategy === 'leaf') {
        const index = this.ticked.indexOf(node[this.nodeKey])
        if (index > -1) this.ticked.splice(index, 1)
        // }
        if (node.children && node.children.length > 0) {
          node.children.forEach(e => { this.onTickedChildren(e, node.ticked, true) })
        }
      }
    },
    onTickedParentAll(nodes, node, key) {
      const x = this.onTickedParent(nodes, node, key)
      if (x && x.dependent) this.onTickedParentAll(nodes, x, key)
    },
    onTickedParent(nodes, node, key) {
      if (node.dependent) {
        for (const e of nodes) {
          if (e[this.nodeKey].toString() === node.dependent) {
            const tickedChild = e.children.filter(x => x.ticked === true || x.ticked === null)
            if (tickedChild.length === 0) e.ticked = false
            else if (tickedChild.length === e.children.length) e.ticked = node.ticked
            else if (tickedChild.length <= e.children.length) e.ticked = null
            if (node.ticked || node.ticked == null) {
              if (!this.ticked.includes(e[this.nodeKey])) this.ticked.push(e[this.nodeKey])
            } else {
              if (tickedChild.length === 0) {
                const index = this.ticked.indexOf(e[this.nodeKey])
                if (index > -1) this.ticked.splice(index, 1)
              }
            }
            return e
          }
          if (e.children && e.children.length > 0) {
            const x = this.onTickedParent(e.children, node, key)
            if (x) return x
          }
        }
      }
    },
    getParentDrag(nodes, node, child = false) {
      for (const e of nodes) {
        if (e[this.nodeKey].toString() === node[this.nodeKey]) {
          return child
        }
        if (e.children && e.children.length > 0) {
          const x = this.getParentDrag(e.children, node, true)
          if (x) return { child: true, node: e }
        }
      }
    },
    updateNodes(nodes, node, dependent = null, level = 1) {
      return new Promise(async (resolve, reject) => {
        let rs
        for await (const e of nodes) {
          e.dependent = dependent
          e.level = level
          if (e[this.nodeKey] === node[this.nodeKey]) {
            rs = e
            return resolve(e)
          }
          if (e.children && e.children.length > 0) {
            const x = await this.updateNodes(e.children, node, e[this.nodeKey], e.level + 1)
            if (x) {
              rs = e
              return resolve(e)
            }
          }
        }
        resolve(rs)
      })
    },
    onFilter(nodes, show = false) {
      const rs = []
      nodes.forEach(e => {
        if (show) e.show = true
        e.show = this.filterMethod(e, this.filter)
        if (e.show) rs.push(e)
        if (e.children && e.children.length > 0) {
          if (e.show) this.onFilter(e.children, this.filter, true)
          else {
            const x = this.onFilter(e.children, this.filter)
            if (x.length) {
              e.show = true
              rs.push(e)
            }
          }
        }
      })
      return rs
    },
    // checkMove: _.debounce(function(e) {
    // console.log(e)
    // this.$nextTick(() => {
    // const related = relatedContext
    // const dragged = draggedContext
    // this.updateNodes(this.nodes, e.draggedContext.element).then((x) => {
    //   // console.log(draggedContext.element)
    //   this.$emit('on-drag', { node: x, index: e.draggedContext.index })
    // })
    // console.log(related, dragged)
    // this.$nextTick(() => {
    //   const x = this.getParentDrag(this.nodes, element)
    //   console.log(x)
    // })
    // })
    // }, 1000),
    onDragChanged(e) { // _.debounce(function(e) {
      setTimeout(() => {
        // console.log(e)
        if (e.removed) {
          this.updateNodes(this.nodes, e.removed.element).then((x) => {
            this.$emit('on-drag-changed', e)
          })
          // console.log(e)
        } else if (e.added) {
          // this.updateNodes(this.nodes, e.added.element).then((x) => {
          //   this.$emit('on-drag-changed', e)
          // })
          this.$emit('on-drag-changed', e)
        } else if (e.moved) {
          this.updateNodes(this.nodes, e.moved.element).then((x) => {
            this.$emit('on-drag-changed', e)
          })
        }
        // }, 500)
      }, 500)
    }
  }
}
</script>

<style lang="scss">
$base-color: #9e9e9e;
.selected .node-label {
  color: #2196f3 !important;
}
.no-data-label {
  color: $base-color;
  font-size: 18px;
}
.tm-tree {
  position: relative;
  padding-left: 5px;
  width: fit-content;
  .tm-node {
    // .q-checkbox .q-checkbox__inner {
    //   width: 20px;
    //   min-width: 20px;
    //   height: 20px;
    //   padding: 0;
    //   .q-checkbox__bg {
    //     left: 1px;
    //     top: 1px;
    //     width: 18px;
    //     height: 18px;
    //   }
    // }
    // position: relative;
    .tm-node-child > .tm-node {
      position: relative;
      padding-left: 25px;
    }
    .tm-node-child .tm-node-content {
      position: relative;
    }
    .tm-node-child .tm-node-content::before {
      content: "";
      position: absolute;
      top: -8px;
      bottom: 45%;
      width: 30px;
      left: -16px;
      border-left: 1px solid $base-color;
      border-bottom: 1px solid $base-color;
    }
    .tm-node-child .tm-node-content.tm-node-expand::before {
      width: 15px;
    }
    // .tm-node-child .tm-node-content:last-child:before {
    //   border-left: none;
    //   border-bottom: none;
    // }
    .tm-node-child {
      .tm-node::after {
        content: "";
        position: absolute;
        top: 15px;
        bottom: 0;
        width: 2px;
        right: auto;
        left: 9px;
        border-left: 1px solid $base-color;
      }
      .tm-node:nth-last-of-type(1):after {
        border-left: none;
      }
    }
    // .tm-node-child .tm-node-content:nth-last-child(2):after {
    //   border-left: none;
    // }
  }
  .tm-node-child {
    padding: 3px 0px;
  }
}
</style>
