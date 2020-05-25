export default {
  // sidebar: state => state.app.sidebar,
  routes: state => state.auth.constant_routes.concat(state.auth.routes),
  languages: state => state.app.languages,
  genders: state => state.app.genders,
  // User setting
  // userSetting: state => state.userSetting.data,
  language: state => state.userSetting.data.language,
  font: state => state.userSetting.data.font,
  dense: state => state.userSetting.data.dense,
  darkMode: state => state.userSetting.data.darkMode,
  format: state => state.userSetting.data.format
  // device: state => state.app.device,
  // useLogs: state => state.app.useLogs,
  // visitedViews: state => state.tagsView.visitedViews,
  // cachedViews: state => state.tagsView.cachedViews,
  // // token: state => state.user.token,
  // // avatar: state => state.user.avatar,
  // // name: state => state.user.name,
  // // introduction: state => state.user.introduction,
  // // roles: state => state.user.roles,
  // permission_routes: state => state.permission.routes,
  // errorLogs: state => state.errorLog.logs,
  // roles: state => state.roles.items,
  // authUser: state => {
  //   // if (state.auth.user.phoneNumber) state.auth.user.phoneNumber = state.auth.user.phoneNumber.replace(`+${state.auth.user.phoneRegion}`, '')
  //   return state.auth.user
  // }
};
