import Cookies from 'js-cookie';
import { Get, Set, GetAll } from '@/i18n';
import { i18n } from '@/boot/i18n';

const state = {
  sidebar: {
    opened: Cookies.get('sidebarStatus')
      ? !!+Cookies.get('sidebarStatus')
      : true,
    withoutAnimation: false
  },
  device: 'desktop',
  languages: GetAll(),
  sizes: [
    { key: 'md', value: 14 },
    { key: 'lg', value: 18 },
    { key: 'sm', value: 12 },
    { key: 'xs', value: 10 }
  ],
  language: Get(),
  font: {
    size: Cookies.get('size') || 'md',
    family:
      '"Roboto", "-apple-system", "Helvetica Neue", Helvetica, Arial, sans-serif',
    color: '#6b6b6b',
    line_height: 1.5
  },
  dense: {
    form: true,
    button: false,
    input: true,
    table: true,
    menu: false
  },
  format: {
    date: 'DD/MM/YYYY',
    time: 'hh:mm:ss'
  },
  darkMode:
    (Cookies.get('darkMode') &&
      Cookies.get('darkMode').toLowerCase() === 'true') ||
    false,
  genders: [
    { id: 1, code: 'male' },
    { id: 2, code: 'female' },
    { id: 3, code: 'unknown' }
  ]
};

const mutations = {
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened;
    state.sidebar.withoutAnimation = false;
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1);
    } else {
      Cookies.set('sidebarStatus', 0);
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set('sidebarStatus', 0);
    state.sidebar.opened = false;
    state.sidebar.withoutAnimation = withoutAnimation;
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device;
  },
  SET_LANGUAGE: (state, value) => {
    state.language = value;
    i18n.locale = value;
    Set(value);
  },
  SET_FONT: (state, value) => {
    state.font = value;
    Cookies.set('font', JSON.stringify(state.font));
    document.body.style.fontSize = `${state.font.size}px`;
  },
  SET_DENSEN: (state, value) => {
    state.dense = value;
    Cookies.set('dense', JSON.stringify(state.dense));
  },
  SET_FORMAT: (state, value) => {
    state.format = value;
    Cookies.set('format', JSON.stringify(state.format));
  },
  SET_DARK_MODE: (state, value) => {
    state.darkMode = value;
    Cookies.set('darkMode', value);
  }
};

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR');
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation);
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
