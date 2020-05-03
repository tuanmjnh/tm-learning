<template>
  <q-card flat bordered :style="$q.platform.is.mobile ? { width: '100%' } : { minWidth: '800px' }">
    <q-toolbar>
      <q-avatar :icon="$route.meta.icon" size="50px" />
      <q-toolbar-title>
        {{ this.item ? $t("global.update") : $t("global.add") }}
        <span class="text-weight-bold">{{ $t("route.question") }}</span>
      </q-toolbar-title>
      <q-btn flat round dense icon="close" v-close-popup
        :disable="loadingAdd || loadingDrafts ? true : false">
        <q-tooltip v-if="!$q.platform.is.mobile">{{
          $t("global.cancel")
        }}</q-tooltip>
      </q-btn>
    </q-toolbar>
    <q-separator />
    <q-form ref="form">
      <q-card-actions v-if="item" align="right">
        <q-btn flat type="submit" :dense="$store.getters.dense.button" color="amber"
          icon="offline_pin" :label="$t('global.update')" :loading="loadingAdd"
          @click.prevent="onSubmit">
          <!-- <q-tooltip>{{$t('global.add')}}</q-tooltip> -->
        </q-btn>
      </q-card-actions>
      <q-card-actions v-else align="right">
        <q-btn flat type="submit" :dense="$store.getters.dense.button" color="blue"
          icon="check_circle" :label="$t('global.add')" :loading="loadingAdd"
          :disable="loadingDrafts" @click.prevent="onSubmit(1)">
          <!-- <q-tooltip>{{$t('global.add')}}</q-tooltip> -->
        </q-btn>
        <q-btn flat type="submit" :dense="$store.getters.dense.button" color="amber" icon="receipt"
          :label="$t('global.drafts')" :loading="loadingDrafts" :disable="loadingAdd"
          @click.prevent="onSubmit(0)">
          <!-- <q-tooltip>{{$t('global.drafts')}}</q-tooltip> -->
        </q-btn>
      </q-card-actions>
      <q-card-section>
        <div class="row q-gutter-xs">
          <div class="col-12">
            <select-category :categories="categories" :selected.sync="form.categories"
              data-key="_id" :dense="$store.getters.dense.input"
              :labelTitle="$t('category.title_question')" :labelSelect="$t('category.select')"
              :labelClose="$t('global.cancel')" @on-selected="onSelectCategory" />
          </div>
        </div>
        <div class="row q-gutter-xs">
          <div class="col-5">
            <q-select v-model="kind" input-debounce="200" :dense="$store.getters.dense.input"
              :options="kinds" :label="$t('question.kind')" option-value="code"
              :option-label="opt=>opt.name.toHtml()" :rules="[v=>!!v||$t('error.required')]">
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  <q-item-section>
                    <q-item-label v-html="scope.opt.name" />
                    <q-item-label v-if="scope.opt.desc" caption>{{`${scope.opt.desc}`}}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">{{$t('table.no_data')}}</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <q-space />
          <div class="col-5">
            <q-select v-model="level" input-debounce="200" :dense="$store.getters.dense.input"
              :options="levels" :label="$t('question.level')" option-value="code"
              :option-label="opt=>opt.name.toHtml()" :rules="[v=>!!v||$t('error.required')]">
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  <q-item-section>
                    <q-item-label v-html="scope.opt.name" />
                    <q-item-label v-if="scope.opt.desc" caption>{{`${scope.opt.desc}`}}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">{{$t('table.no_data')}}</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>
        <div class="row q-gutter-xs">
          <div class="col">
            <q-editor v-model="form.content" min-height="5rem" :placeholder="$t('question.content')"
              :rules="[v=>!!v||$t('error.required')]" />
          </div>
        </div>
        <div class="row q-gutter-xs q-mt-sm">
          <div class="col-12">
            <q-input v-model.trim="answer" :dense="$store.getters.dense.input" autogrow
              :label="$t('question.answerInput')">
              <template v-slot:append>
                <q-btn round dense flat icon="add" color="blue" size="sm"
                  @click.prevent="onAddAnswer">
                  <q-tooltip v-if="!$q.platform.is.mobile">{{$t('global.add')}}</q-tooltip>
                </q-btn>
              </template>
            </q-input>
          </div>
        </div>
        <div class="row q-gutter-xs q-mt-sm">
          <div class="col-12">
            {{$t('question.answers')}}
            <span class="material-icons text-warning">help
              <q-tooltip>{{$t('question.answerHelper')}}</q-tooltip>
            </span>
          </div>
          <div class="col-12">
            <div class="row q-pb-sm" v-for="(e,i) in form.answers" :key="i">
              <q-checkbox v-model="form.correct" :val="i" dense :label="`${i+1}. ${e}`" color="blue"
                class="q-pr-sm q-field--error" />
              <span class="material-icons text-negative cursor-pointer"
                @click="onRemoveAnswer(i)">clear</span>
            </div>
            <div class="q-field__bottom row items-start q-field__bottom--animated">
              <div class="q-field__messages col">
                <div>Thông tin không được bỏ trống</div>
              </div>
            </div>
          </div>
        </div>
        <div class="row q-gutter-xs">
          <div class="col">
            {{form.correct}}
          </div>
        </div>
        <q-separator class="q-mt-md" />
        <div class="row q-gutter-xs">
          <div class="col">
            <tm-tags :data.sync="form.tags" :dense="$store.getters.dense.input"
              :labelTitle="$t('global.keyword')+':'" :labelBtnAdd="$t('global.add')"
              :labelInput="$t('global.tags')" btnIcon="add" btnColor="blue" tagsColor="primary"
              tagsTextColor="white" :labelConfirmTitle="$t('message_box.confirm')"
              :labelConfirmContent="$t('message_box.delete')"
              :labelWarningTitle="$t('message_box.warning')"
              :labelWarningContent="$t('error.required')"></tm-tags>
          </div>
        </div>
      </q-card-section>
    </q-form>
  </q-card>
</template>

<script>
import { axiosApi, axiosApiDebonce } from '@/utils/http-client'; // questions
import normalize from '@/utils/search'
import tmTags from '@/components/tm-tags'
import selectCategory from '@/views/category/components/select-category'
export default {
  components: { selectCategory, tmTags },
  props: {
    dialog: { type: Boolean, default: true },
    items: { type: Array, default: () => [] },
    item: { type: Object, default: () => { } },
    categories: { type: Array, default: null },
    kinds: { type: Array, default: null },
    levels: { type: Array, default: null }
  },
  data() {
    return {
      loadingAdd: false,
      loadingDrafts: false,
      tabs: 'main',
      kind: null,
      level: null,
      answer: '',
      form: {},
      default: {
        categories: null,
        kind: 1,
        level: 1,
        content: '',
        answers: [],
        correct: [],
        tags: null,
        order: 1,
        flag: 1
      }
    }
  },
  watch: {
    dialog: {
      handler(val) {
        this.reset()
        if (this.item) {
          this.form = { ...this.item }
          if (!this.form.content) this.form.content = ''
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    onSelectCategory(item) {
      if (!item.children || !item.children.length) {
        this.form.categories = [item._id]
      }
    },
    onAddAnswer() {
      if (this.answer) {
        this.form.answers.push(this.answer.toUpperCaseFirst())
        this.answer = ''
      }
    },
    onRemoveAnswer(index) {
      this.$q.dialog({
        title: this.$t('message_box.confirm'),
        message: this.$t('message_box.delete'),
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.form.answers.splice(index, 1)
        this.form.correct = []
      })
      // const x = this.form.correct.indexOf(index)
      // if (x > -1) this.form.correct.splice(x, 1)
    },
    onSubmit(action) {
      this.$refs.form.validate().then(valid => {
        if (valid) {
          if (this.item) {
            this.loadingAdd = true
            axiosApi.put('questions', this.form).then((x) => {
              if (x.ok) {
                const index = this.items.indexOf(this.item)
                if (index > -1) this.items.splice(index, 1, this.form)
              }
            }).finally(() => {
              this.loadingAdd = false
            })
          } else {
            this.form.flag = action
            if (action) this.loadingAdd = true
            else this.loadingDrafts = true
            axiosApi.post('questions', this.form).then((x) => {
              this.items.push(x)
            }).finally(() => {
              this.loadingAdd = false
              this.loadingDrafts = false
              this.reset()
            })
          }
        }
      })
    },
    reset() {
      new Promise((resolve, reject) => {
        this.form = { ...this.default }
        resolve()
      }).then(() => {
        if (this.$refs.form) this.$refs.form.resetValidation()
      })
    }
  }
}
</script>

<style>
</style>
