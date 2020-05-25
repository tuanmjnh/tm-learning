import Cookies from 'js-cookie';
import * as routers from '@/router';
import { constant } from '@/router/routes';

const state = {
  token: Cookies.get('token') || undefined,
  user: undefined,
  roles: [],
  constant_routes: constant,
  routes: []
};
const mutations = {
  SET_TOKEN(state, value) {
    state.token = value;
    Cookies.set('token', value);
  },
  REMOVE_TOKEN(state) {
    state.token = null;
    Cookies.remove('token');
  },
  SET_USER(state, value) {
    state.user = value;
  },
  SET_ROUTES(state, value) {
    state.routes = value;
  },
  SET_IS_ADD_ROUTER(state, value) {
    state.isAddRouter = value;
  }
};
const actions = {
  login({ commit, rootState }, params) {
    return new Promise((resolve, reject) => {
      if (params.token) commit('SET_TOKEN', params.token);
      if (params.user) commit('SET_USER', params.user);
      if (params.routes) {
        commit('SET_ROUTES', routers.generateRoutes(params.routes));
      }
      resolve(true);
    });
  },
  logout({ commit, rootState }) {
    commit('REMOVE_TOKEN');
    commit('SET_USER', null);
    commit('SET_ROUTES', []);
    routers.resetRouter();
  }
};
export default {
  namespaced: true,
  state,
  mutations,
  actions
};
