import * as routers from '@/router';
import store from '@/store';
import * as auth from '@/api/auth';
import * as userSetting from '@/api/user-setting';
import NProgress from 'nprogress'; // progress bar
import '@/css/nprogress.css'; // progress bar style

NProgress.configure({
  showSpinner: false,
  easing: 'ease',
  speed: 200,
  trickle: true,
  trickleSpeed: 200,
  minimum: 0.08
}); // NProgress Configuration

const whiteList = ['/login']; // no redirect whitelist
routers.router.beforeEach(async (to, from, next) => {
  // start progress bar
  NProgress.start();

  const token = store.state.auth.token;
  if (token) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' });
      NProgress.done();
    } else {
      // determine whether the user has obtained his permission roles through getInfo
      if (store.state.auth.user && store.state.auth.routes) {
        // console.log('a')
        next();
      } else {
        try {
          // get user info
          const data = await auth.checkToken();
          if (!data.user) store.dispatch('auth/logout'); // || !data.routes.length
          // if (!store.state.userSetting.data) {
          //   const us = await userSetting.get()
          //   store.dispatch('userSetting/set', us)
          // }
          store
            .dispatch('auth/login', { user: data.user, routes: data.routes })
            .then(
              routers.router.addRoutes(store.state.auth.routes, {
                replace: true
              })
            )
            .then(next(to.path)); // next({ ...to, replace: true })
        } catch (err) {
          // console.log(err)
          // remove token and go to login page to re-login
          await store.dispatch('auth/logout');
          // Message.error(error || 'Has Error')
          // console.log(err)
          next(`/login?redirect=${to.path}`);
          // stop progress bar
          NProgress.done();
        }
      }
      // // Check is added routes
      // if (store.state.auth.isAddRouter) {
      //   store.commit('auth/SET_IS_ADD_ROUTER', false)
      //   // dynamically add accessible routes
      //   // console.log(store.state.auth.routes)
      //   // console.log(store.getters.routes)
      //   routers.router.addRoutes(store.state.auth.routes, { replace: true })
      //   // add exception routes
      //   // routers.router.addRoutes(routers.exception, { replace: true })

      //   // hack method to ensure that addRoutes is complete
      //   // set the replace: true, so the navigation will not leave a history record
      //   next({ ...to, replace: true })
      //   // next({ replace: true })
      // }
    }
  } else {
    // has no token
    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next();
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`);
      NProgress.done();
    }
  }
});

routers.router.afterEach(() => {
  // finish progress bar
  NProgress.done();
});
