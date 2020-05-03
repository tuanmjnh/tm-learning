<template>
  <div id="q-app">
    <!-- <q-spinner-pie color="primary" size="2em" /> -->
    <!-- <q-inner-loading :showing="$store.state.loading.get">
      <q-spinner-gears size="100px" color="primary" />
    </q-inner-loading> -->
    <!-- <b>{{$q.platform}}</b> -->
    <component v-if="getDisplay()" :is="layout">
      <!-- <transition name="fade" mode="out-in"> -->
      <!-- <transition  enter-active-class="animated fadeIn"> -->
      <!-- <q-transition appear enter="fadeInLeft" leave="fadeOutRight" mode="out-in"> -->
      <router-view :key="$route.path" />
      <!-- </transition> -->
      <!-- </transition> -->
      <!-- <router-view :layout.sync="layout" /> -->
    </component>
    <router-view v-else :key="$route.path" />
    <!-- <loading v-else /> -->
    <!-- <router-view v-if="$route.path === '/login'" :key="$route.path" /> -->
  </div>
</template>

<script>
import spa from './layouts/spa/index'
import mobile from './layouts/mobile'
import electron from './layouts/electron'
import loading from './layouts/loading'
export default {
  name: 'App',
  components: { spa, mobile, electron, loading },
  data() {
    return {
      platform: 'tuanmjnh'
    }
  },
  created() {
    // this.$store.commit('userSetting/SET', this.$store.state.userSetting.data)
    this.$store.dispatch('userSetting/set', this.$store.state.userSetting.data)
    this.$q.dark.set(this.$store.getters.darkMode)
  },
  computed: {
    layout() {
      if (this.$q.platform.is.mobile) return 'mobile'
      else if (this.$q.platform.is.electron) return 'electron'
      else return 'spa'
    }
  },
  methods: {
    getDisplay() {
      if (this.$store.state.auth.user && this.$store.state.auth.roles) {
        return setTimeout(() => {
          return true
        }, 3000)
      } else return false
    }
  }
}
</script>
