<template>
  <div class="window-height window-width row justify-center items-center">
    <!-- <div v-if="loading" style="position:absolute;top:38%;left:50%;">
      <q-spinner color="primary" size="5em" :thickness="2" />
    </div> -->
    <q-form ref="form" class="col-9 col-md-4">
      <q-card flat square inline bordered>
        <q-card-section class="bg-teal text-white">
          <div class="text-h6">{{ $t("login.title") }}</div>
          <!-- <div class="text-subtitle2">by John Doe</div> -->
        </q-card-section>
        <q-card-section>
          <div class="q-pl-md q-pr-md q-pt-md">
            <q-input v-model.trim="form.username" type="email" :dense="$store.getters.dense.input"
              v-lowercase :hint="$t('login.username')" :placeholder="$t('login.username')"
              :rules="[v=>!!v||$t('error.required')]" />
            <!-- v => validEmail(v) || $t('error.email') -->
          </div>
          <div class="q-pl-md q-pr-md q-pt-md">
            <q-input v-model.trim="form.password" :type="passwordType"
              :dense="$store.getters.dense.input" :hint="$t('login.password')"
              :placeholder="$t('login.password')" @keyup.native="checkCapslock"
              @blur="capsTooltip = false" :rules="[v=>!!v||$t('error.required')]"
              class="capsTooltip">
              <template v-slot:append>
                <q-icon v-if="passwordType === 'password'" name="visibility_off"
                  @click="passwordType = 'text'" class="cursor-pointer" />
                <q-icon v-else name="visibility" @click="passwordType = 'password'"
                  class="cursor-pointer" />
                <q-tooltip v-model="capsTooltip" :no-parent-event="true" :offset="[10, 10]"
                  content-class="bg-indigo">
                  Caps lock
                </q-tooltip>
              </template>
            </q-input>
          </div>
          <div class="q-pl-xs q-pr-md q-pt-md">
            <q-checkbox v-model="form.remember" :label="$t('login.remember')" />
          </div>
        </q-card-section>
        <!-- <q-separator dark inset /> -->
        <q-card-actions align="right">
          <q-btn type="submit" flat :dense="$store.getters.dense.button" color="blue"
            :label="$t('login.login')" :loading="$store.state.loading.post"
            @click.prevent="onSubmit">
            <!-- <q-tooltip>{{$t('global.add')}}</q-tooltip> -->
          </q-btn>
          <!-- <q-btn flat>Action 2</q-btn> -->
        </q-card-actions>
      </q-card>
    </q-form>
  </div>
</template>

<script>
import * as api from '@/api/auth'
import * as apiUserSetting from '@/api/user-setting'
import * as routers from '@/router'
export default {
  data() {
    return {
      form: {
        username: '',
        password: '',
        remember: false
      },
      passwordType: 'password',
      capsTooltip: false,
      redirect: undefined,
      otherQuery: {}
    }
  },
  methods: {
    checkCapslock({ shiftKey, key } = {}) {
      if (key && key.length === 1) {
        if (shiftKey && (key >= 'a' && key <= 'z') || !shiftKey && (key >= 'A' && key <= 'Z')) {
          this.capsTooltip = true
        } else {
          this.capsTooltip = false
        }
      }
      if (key === 'CapsLock' && this.capsTooltip === true) {
        this.capsTooltip = false
      }
    },
    validEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return re.test(email)
    },
    onSubmit() {
      this.$refs.form.validate().then(valid => {
        if (valid) {
          api.login(this.form).then((x) => {
            if (x) {
              this.$store.dispatch('auth/login', x)
                .then(() => {
                  routers.router.addRoutes(this.$store.state.auth.routes, { replace: true })
                }).then(() => {
                  // Set user setting
                  apiUserSetting.get().then(x => {
                    this.$store.dispatch('userSetting/set', x)
                    this.$q.dark.set(this.$store.getters.darkMode)
                  })
                })
                .then(() => {
                  this.$router.push({ path: this.redirect }).catch((e) => { })
                })
            }
          })
        }
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
  },
  watch: {
    $route: {
      handler: function (route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  }
}
</script>

<style>
</style>
