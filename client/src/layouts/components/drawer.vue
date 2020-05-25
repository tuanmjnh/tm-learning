<template>
  <q-list class="rounded-borders">
    <drawer-item
      v-for="(e, i) in items"
      :key="i"
      :active="e ? onActive(e.name) : false"
      :dense="dense"
      :item="e"
      is-icon
    >
    </drawer-item>
  </q-list>
</template>
<script>
import drawerItem from './drawer-item'
export default {
  components: { drawerItem },
  props: {
    items: { type: Array, default: () => [] },
    dense: { type: Boolean, default: false }
  },
  data() {
    return {}
  },
  computed: {
    // onActive(name) {
    //   console.log(name, this.$route.matched.map(x => x.name).indexOf(name) > -1 || false)
    //   return this.$route.matched.map(x => x.name).indexOf(name) > -1 || false
    // }
  },
  methods: {
    onActive(name) {
      const rs = this.$route.matched.map(x => x.name).indexOf(name) > -1 || false
      return rs
    }
  }
}
</script>
<style>
</style>
