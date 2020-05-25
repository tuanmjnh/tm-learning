import fakeLayout from '@/layouts/fake-layout';
export const constant = [
  {
    path: '',
    redirect: 'dashboard',
    meta: { hidden: true, constant: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    meta: { title: 'dashboard', icon: 'dashboard', constant: true },
    component: () => import('@/views/dashboard')
  },
  {
    path: '/profile',
    name: 'profile',
    meta: {
      title: 'profile',
      icon: 'assignment_ind',
      hidden: true,
      constant: true
    },
    component: () => import('@/views/profile'),
    children: [
      {
        path: 'information',
        name: 'profile-information',
        meta: { title: 'information', icon: 'assignment', constant: true },
        component: () => import('@/views/profile/information')
      },
      {
        path: 'security',
        name: 'profile-security',
        meta: { title: 'security', icon: 'security', constant: true },
        component: () => import('@/views/profile/security')
      },
      {
        path: 'setting',
        name: 'profile-setting',
        meta: { title: 'user_setting', icon: 'settings', constant: true },
        component: () => import('@/views/profile/setting')
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    meta: { title: 'login', icon: 'login', hidden: true, constant: true },
    component: () => import('@/views/login')
  }
];

export const dynamic = [
  {
    path: '/exams',
    name: 'exams',
    meta: { title: 'exams', icon: 'school' },
    component: () => import('@/views/exams/index'),
    children: [
      {
        path: 'review',
        name: 'exams-review',
        meta: { title: 'review', icon: 'poll', hidden: true },
        component: () => import('@/views/exams/review')
      }
    ]
  },
  {
    path: '/library',
    name: 'library',
    meta: { title: 'library', icon: 'local_library' },
    component: fakeLayout,
    children: [
      {
        path: 'exercises',
        name: 'library-exercises',
        meta: {
          title: 'libraryExercises',
          icon: 'library_books',
          noCache: true,
          flag: 1
        },
        component: () => import('@/views/exercises/index'),
        children: [
          {
            path: 'list',
            name: 'library-exercises-list',
            meta: {
              title: 'list',
              icon: 'list',
              hidden: true,
              noCache: true,
              flag: 1
            },
            component: () => import('@/views/exercises/index')
          },
          {
            path: 'add',
            name: 'library-exercises-add',
            meta: { title: 'add', icon: 'playlist_add', hidden: true },
            component: () => import('@/views/exercises/add')
          },
          {
            path: 'edit/:?id',
            name: 'library-exercises-edit',
            meta: {
              title: 'edit',
              icon: 'edit',
              hidden: true,
              noCache: true,
              activeMenu: 'library-exercises/list'
            },
            hidden: true,
            component: () => import('@/views/exercises/add')
          },
          {
            path: 'trash',
            name: 'library-exercises-trash',
            meta: {
              title: 'trash',
              icon: 'delete_sweep',
              hidden: true,
              noCache: true,
              flag: 0
            },
            component: () => import('@/views/exercises/index')
          },
          {
            path: 'report',
            name: 'library-exercises-report',
            meta: { title: 'report', icon: 'pie_chart', hidden: true },
            component: () => import('@/views/exercises/report')
          }
        ]
      },
      {
        path: 'question',
        name: 'library-question',
        meta: {
          title: 'libraryQuestion',
          icon: 'help',
          noCache: true,
          flag: 1
        },
        component: () => import('@/views/questions/index'),
        children: [
          {
            path: 'list',
            name: 'library-question-list',
            meta: {
              title: 'list',
              icon: 'list',
              hidden: true,
              noCache: true,
              flag: 1
            },
            component: () => import('@/views/questions/index')
          },
          {
            path: 'add',
            name: 'library-question-add',
            meta: { title: 'add', icon: 'playlist_add', hidden: true },
            component: () => import('@/views/questions/add')
          },
          {
            path: 'edit/:?id',
            name: 'library-question-edit',
            meta: {
              title: 'edit',
              icon: 'edit',
              hidden: true,
              noCache: true,
              activeMenu: 'library/question/list'
            },
            hidden: true,
            component: () => import('@/views/questions/add')
          },
          {
            path: 'trash',
            name: 'library-question-trash',
            meta: {
              title: 'trash',
              icon: 'delete_sweep',
              hidden: true,
              noCache: true,
              flag: 0
            },
            component: () => import('@/views/questions/index')
          }
        ]
      },
      {
        path: 'category',
        name: 'category-question',
        meta: {
          title: 'libraryCategory',
          icon: 'category',
          noCache: true,
          flag: 1,
          type: 'question'
        },
        component: () => import('@/views/category/index'),
        children: [
          {
            path: 'list',
            name: 'category-question-list',
            meta: {
              title: 'list',
              icon: 'list',
              hidden: true,
              noCache: true,
              flag: 1
            },
            component: () => import('@/views/category/index')
          },
          {
            path: 'add',
            name: 'category-question-add',
            meta: { title: 'add', icon: 'playlist_add', hidden: true },
            component: () => import('@/views/category/add')
          },
          {
            path: 'edit/:?id',
            name: 'category-question-edit',
            meta: {
              title: 'edit',
              icon: 'edit',
              hidden: true,
              noCache: true,
              activeMenu: 'library/category/list'
            },
            hidden: true,
            component: () => import('@/views/category/add')
          },
          {
            path: 'trash',
            name: 'category-question-trash',
            meta: {
              title: 'trash',
              icon: 'delete_sweep',
              hidden: true,
              noCache: true,
              flag: 0
            },
            component: () => import('@/views/category/index')
          }
        ]
      }
    ]
  },
  {
    path: '/manager',
    name: 'manager',
    redirect: 'manager-users',
    meta: { title: 'manager', icon: 'security' },
    component: fakeLayout,
    children: [
      {
        path: 'users',
        name: 'manager-users',
        meta: { title: 'users', icon: 'account_box' },
        component: () => import('@/views/users/index'),
        children: [
          {
            path: 'list',
            name: 'manager-users-view',
            meta: { title: 'list', hidden: true, noCache: true, flag: 1 },
            component: () => import('@/views/users/index')
          },
          {
            path: 'add',
            name: 'manager-users-add',
            meta: { title: 'add', hidden: true },
            component: () => import('@/views/users/add')
          },
          {
            path: 'edit/:?id',
            name: 'manager-users-edit',
            meta: {
              title: 'edit',
              hidden: true,
              noCache: true,
              activeMenu: '/users/list'
            },
            component: () => import('@/views/users/add')
          },
          {
            path: 'trash',
            name: 'manager-users-trash',
            meta: { title: 'trash', hidden: true, noCache: true, flag: 0 },
            component: () => import('@/views/users/index')
          }
        ]
      },
      {
        path: 'roles',
        name: 'manager-roles',
        meta: { title: 'roles', icon: 'verified_user' },
        component: () => import('@/views/roles/index'),
        children: [
          {
            path: 'list',
            name: 'manager-roles-view',
            meta: { title: 'list', hidden: true, noCache: true, flag: 1 },
            component: () => import('@/views/roles/index')
          },
          {
            path: 'add',
            name: 'manager-roles-add',
            meta: { title: 'add', hidden: true },
            component: () => import('@/views/roles/add')
          },
          {
            path: 'edit/:?id',
            name: 'manager-roles-edit',
            meta: {
              title: 'edit',
              hidden: true,
              noCache: true,
              activeMenu: '/roles/list'
            },
            component: () => import('@/views/roles/add')
          },
          {
            path: 'trash',
            name: 'manager-roles-trash',
            meta: { title: 'trash', hidden: true, noCache: true, flag: 0 },
            component: () => import('@/views/roles/index')
          }
        ]
      },
      {
        path: 'types',
        name: 'manager-types',
        meta: { title: 'types', icon: 'scatter_plot' },
        component: () => import('@/views/types/index'),
        children: [
          {
            path: 'list',
            name: 'manager-types-view',
            meta: { title: 'list', hidden: true, noCache: true, flag: 1 },
            component: () => import('@/views/types/index')
          },
          {
            path: 'add',
            name: 'manager-types-add',
            meta: { title: 'add', hidden: true },
            component: () => import('@/views/types/add')
          },
          {
            path: 'edit/:?id',
            name: 'manager-types-edit',
            meta: {
              title: 'edit',
              hidden: true,
              noCache: true,
              activeMenu: '/types/list'
            },
            component: () => import('@/views/types/add')
          },
          {
            path: 'trash',
            name: 'manager-types-trash',
            meta: { title: 'trash', hidden: true, noCache: true, flag: 0 },
            component: () => import('@/views/types/index')
          }
        ]
      }
    ]
  }
];

// export const exception = [];
// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  constant.push({
    path: '*',
    name: '404',
    constant: true,
    meta: { title: 'error404', icon: '404', hidden: true },
    component: () => import('@/pages/error404')
  });
}

export default constant;
