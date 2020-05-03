<template>
  <q-layout view="lHh Lpr lFf">
    <q-header :class="$store.state.app.darkMode?'bg-black':''">
      <q-toolbar>
        <q-btn flat dense round @click="drawer = !drawer" aria-label="Menu">
          <q-icon name="menu" />
        </q-btn>
        <q-toolbar-title>
          {{ title }}
        </q-toolbar-title>
        <header-right />
        <!-- <div>Quasar v{{ $q.version }}</div> -->
      </q-toolbar>
    </q-header>
    <q-drawer v-model="drawer" bordered>
      <q-scroll-area style="height:calc(100% - 50px);margin-top:50px;">
        <drawer :items="$store.getters.routes" :dense="$store.getters.dense.menu" />
      </q-scroll-area>
      <drawer-search />
    </q-drawer>
    <q-page-container>
      <q-page padding>
        <slot />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import drawer from '../components/drawer'
import drawerSearch from '../components/drawer-search'
import headerRight from '../components/header-right'
export default {
  components: { drawer, drawerSearch, headerRight },
  data() {
    return {
      title: 'TM-Store', // process.env.APP_NAME,
      drawer: this.$q.platform.is.desktop
    }
  },
  created() {
    // get status
    // console.log(this.$q.dark.isActive) // true, false

    // get configured status
    // console.log(this.$q.dark.mode) // "auto", true, false

    // set status
    // this.$q.dark.set(true) // or "false" or "auto"

    // toggle
    // this.$q.dark.toggle()
  },
  methods: {}
}
</script>

<style lang="scss">
// .q-drawer__content {
// background-color: #304156;
// color: white;
// }
</style>
