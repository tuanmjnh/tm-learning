// Configuration for your app
// https://quasar.dev/quasar-cli/quasar-conf-js
let path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = function(ctx) {
  return {
    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://quasar.dev/quasar-cli/cli-documentation/boot-files
    boot: [
      'prototypes',
      'i18n',
      'middleware',
      // 'axios',
      'moment',
      'directive',
      'filter'
    ],

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-css
    css: ['app.scss'],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v4',
      // 'fontawesome-v5',
      // 'eva-icons',
      // 'themify',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font', // optional, you are not bound to it
      'material-icons' // optional, you are not bound to it
    ],

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-framework
    framework: {
      // iconSet: 'ionicons-v4', // Quasar icon set
      // lang: 'de', // Quasar language pack

      // Possible values for "all":
      // * 'auto' - Auto-import needed Quasar components & directives
      //            (slightly higher compile time; next to minimum bundle size; most convenient)
      // * false  - Manually specify what to import
      //            (fastest compile time; minimum bundle size; most tedious)
      // * true   - Import everything from Quasar
      //            (not treeshaking Quasar; biggest bundle size; convenient)
      all: 'auto',

      components: [],
      directives: [],
      // Dark Mode
      // config: {
      //   dark: 'auto' // or Boolean true/false
      // },
      // Quasar plugins
      plugins: ['Notify', 'AppFullscreen', 'Dialog'],
      config: {
        // loadingBar: {
        //   color: 'purple'
        //   // size: '10px',
        //   // position: 'top'
        // },
        notify: {
          position: 'top',
          timeout: 5000,
          color: 'blue-grey',
          textColor: 'white',
          actions: [{ icon: 'close', color: 'white' }]
        }
      }
    },

    // https://quasar.dev/quasar-cli/cli-documentation/supporting-ie
    supportIE: true,

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-build
    build: {
      scopeHoisting: true,
      vueRouterMode: 'history',
      // showProgress: false,
      // gzip: true,
      // analyze: true,
      // preloadChunks: false,
      // extractCSS: false,
      publicPath: '/learning/',
      // distDir: '/Application/portal-vue-quasar',
      // files: [
      //   { from: './statics', to: './' }
      //   // Other files/folders here...
      // ],
      // https://quasar.dev/quasar-cli/cli-documentation/handling-webpack
      extendWebpack(cfg) {
        cfg.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /node_modules/,
          options: {
            formatter: require('eslint').CLIEngine.getFormatter('stylish')
          }
        });
        cfg.resolve.alias = {
          ...cfg.resolve.alias,
          // Add your own alias like this
          // 'vue$': 'vue/dist/vue.esm.js',
          '@': path.resolve('src')
        };
        cfg.plugins.push(new CopyPlugin([{ from: './statics/', to: '../' }]));
      },
      env: ctx.dev
        ? {
            // so on dev we'll have
            APP_TITLE: JSON.stringify('TM-Learning'),
            API: JSON.stringify('http://localhost:8001/api'),
            API_UPLOAD: JSON.stringify('http://localhost:8001/uploads'),
            API_PUBLIC: JSON.stringify('http://localhost:8001/public'),
            API_FILE_UPLOAD: JSON.stringify(
              'http://localhost:8001/api/file-manager'
            )
          }
        : {
            // and on build (production):
            APP_TITLE: JSON.stringify('TM-Learning'),
            API: JSON.stringify('http://10.17.20.222/tm-learning-backend/api'),
            API_UPLOAD: JSON.stringify(
              'http://10.17.20.222/tm-learning-backend/uploads'
            ),
            API_PUBLIC: JSON.stringify(
              'http://10.17.20.222/tm-learning-backend/public'
            ),
            API_FILE_UPLOAD: JSON.stringify(
              'http://10.17.20.222/tm-learning-backend/api/file-manager'
            )
          }
    },

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-devServer
    devServer: {
      // https: true,
      port: 8000,
      open: false // opens browser window automatically
    },

    // animations: 'all', // --- includes all animations
    // https://quasar.dev/options/animations
    // animations: ['fadeIn', 'fadeOut'],

    // https://quasar.dev/quasar-cli/developing-ssr/configuring-ssr
    ssr: {
      pwa: false
    },

    // https://quasar.dev/quasar-cli/developing-pwa/configuring-pwa
    pwa: {
      // workboxPluginMode: 'InjectManifest',
      // workboxOptions: {}, // only for NON InjectManifest
      manifest: {
        // name: 'Quasar App',
        // short_name: 'Quasar App',
        // description: 'A Quasar Framework app',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            src: 'statics/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    },

    // https://quasar.dev/quasar-cli/developing-cordova-apps/configuring-cordova
    cordova: {
      // id: 'tm-store.quasar',
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // https://quasar.dev/quasar-cli/developing-electron-apps/configuring-electron
    electron: {
      // bundler: 'builder', // or 'packager'

      extendWebpack(cfg) {
        // do something with Electron main process Webpack cfg
        // chainWebpack also available besides this extendWebpack
      },

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration
        // appId: 'tm-store-quasar'
      }
    }
  };
};
