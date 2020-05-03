import Cookies from 'js-cookie';
import { Get, Set, GetAll } from '@/i18n';
import { i18n } from '@/boot/i18n';
const name = 'user-setting';
const state = {
  data: Cookies.get(name)
    ? JSON.parse(Cookies.get(name))
    : {
        language: 'vi-VN',
        darkMode: false,
        dense: {
          form: true,
          button: true,
          input: true,
          table: true,
          menu: false
        },
        format: {
          date: 'DD/MM/YYYY',
          time: 'hh:mm:ss a'
        },
        font: {
          size: 'md',
          family:
            '"Roboto", "-apple-system", "Helvetica Neue", Helvetica, Arial, sans-serif',
          color: '#6b6b6b'
        }
      }
};

const mutations = {
  SET: (state, data) => {
    state.data = data;
    //
    i18n.locale = state.data.language;
    document.body.style.fontSize = `${state.data.font.size}px`;
    document.body.style.fontFamily = state.data.font.family;
    document.body.style.color = state.data.font.color;
    Cookies.set(name, JSON.stringify(state.data));
  },
  SET_DARK_MODE: (state, value) => {
    state.data.darkMode = value;
    Cookies.set(name, JSON.stringify(state.data));
  },
  SET_LANGUAGE: (state, value) => {
    state.data.language = value;
    i18n.locale = state.data.language;
    Cookies.set(name, JSON.stringify(state.data));
  },
  SET_FONT: (state, { key, value }) => {
    if (key === 'size') {
      state.data.font.size = parseInt(value);
      document.body.style.fontSize = `${state.data.font.size}px`;
    } else if (key === 'family') {
      state.data.font.family = value;
      document.body.style.fontFamily = state.data.font.family;
    } else if (key === 'color') {
      state.data.font.color = value;
      document.body.style.color = state.data.font.color;
    } // else if (key === 'line_height') {
    //   state.data.font.line_height = value
    //   document.body.style.lineHeight = state.data.font.line_height
    // }
    Cookies.set(name, JSON.stringify(state.data));
  },
  SET_FORMAT: (state, { key, value }) => {
    if (key === 'date') state.data.format.date = value;
    else if (key === 'time') state.data.format.time = value;
    Cookies.set(name, JSON.stringify(state.data));
  },
  SET_DENSE: (state, { key, value }) => {
    if (key === 'form') state.data.dense.form = value;
    else if (key === 'button') state.data.dense.button = value;
    else if (key === 'input') state.data.dense.input = value;
    else if (key === 'table') state.data.dense.table = value;
    else if (key === 'menu') state.data.dense.menu = value;
    Cookies.set(name, JSON.stringify(state.data));
  }
};

const actions = {
  set({ commit }, data) {
    if (data) commit('SET', data);
    // // LANGUAGE
    // commit('SET_LANGUAGE', data.language)
    // // FONT
    // commit('SET_FONT', { key: 'size', value: data.font.size })
    // commit('SET_FONT', { key: 'family', value: data.font.family })
    // commit('SET_FONT', { key: 'color', value: data.font.color })
    // // FORMAT
    // commit('SET_FORMAT', { key: 'date', value: data.format.date })
    // commit('SET_FORMAT', { key: 'time', value: data.format.time })
    // // DENSE
    // commit('SET_DENSE', { key: 'form', value: data.dense.form })
    // commit('SET_DENSE', { key: 'button', value: data.dense.button })
    // commit('SET_DENSE', { key: 'input', value: data.dense.input })
    // commit('SET_DENSE', { key: 'table', value: data.dense.table })
    // commit('SET_DENSE', { key: 'menu', value: data.dense.menu })
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
