import Vue from 'vue';
import VueRouter from 'vue-router';
import fakeLayout from '@/layouts/fake-layout';
import * as routes from './routes';

Vue.use(VueRouter);

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

const createRouter = () =>
  new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes: routes.constant,
    // Leave these as is and change from quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE, // history require service support
    base: process.env.VUE_ROUTER_BASE
  });

export const router = createRouter();

// router.addRoutes(routes.demo)
// export default function(/* { store, ssrContext } */) {
//   const Router = new VueRouter({
//     scrollBehavior: () => ({ x: 0, y: 0 }),
//     routes,

//     // Leave these as is and change from quasar.conf.js instead!
//     // quasar.conf.js -> build -> vueRouterMode
//     // quasar.conf.js -> build -> publicPath
//     mode: process.env.VUE_ROUTER_MODE, // history require service support
//     base: process.env.VUE_ROUTER_BASE
//   })

//   return Router
// }

// export const constant = routes.constant
// export const exception = routes.exception

// Check has router
export const hasRouter = (route, isname = true) => {
  if (isname) {
    const matched = router.resolve({ name: route }).resolved.matched;
    if (matched.length > 0) return matched;
    else return null;
  } else {
    const resolved = router.resolve(route).resolved;
    // console.log(resolved)
    // const match = this.$router.match('/manager/users/add')
    if (resolved.name === '404') return null;
    else return resolved;
  }
};
router.has = hasRouter;

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher; // reset router
}

export function addRoutes(routers) {
  routers = routers.filter(x => {
    if (!router.includes(x.name)) return x;
  });
  router.addRoutes(routers);
}

// Load view dynamic
function loadView(view) {
  return () => import(`@/views/${view}`);
}
// Generate routes dynamic
export function generateRoutes(authRoutes, dynamic) {
  const rs = [];
  dynamic = dynamic || routes.dynamic;
  for (const _e of dynamic) {
    let e = { ..._e };
    if (authRoutes.includes(e.name)) {
      // if (e.component === 'layout') e.component = fakeLayout;
      // else e.component = loadView(e.component);
      // if (e.meta && e.meta.length > 0) {
      //   var tmp = [...e.meta];
      //   e.meta = {};
      //   for (let meta of tmp) e.meta[meta.key] = meta.value;
      // }
      if (e.children) e.children = generateRoutes(authRoutes, e.children);
      rs.push(e);
    }
  }
  return rs;
}

export default router;
