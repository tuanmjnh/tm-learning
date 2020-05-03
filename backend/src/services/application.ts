import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import session from 'express-session';
import flash from 'express-flash';
import compression from 'compression';
// import lusca from 'lusca';
import { Routes } from '../router';
import * as mongoose from './mongoose';
import middleware from './middleware';

let app: express.Application;
const routes = new Routes();
// Connection MongoDB
mongoose.initialize();
// Create App
app = express();
// Config
// trust proxy ip
app.set('trust proxy', true);
// static public
// app.use(express.static(process.env.PUBLIC_PATH, { maxAge: 31557600000 }))
// app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(`${process.env.BASE_URL}${process.env.PUBLIC_PATH}`, express.static(process.env.PUBLIC_DIR));
app.use(`${process.env.BASE_URL}${process.env.STATIC_PATH}`, express.static(process.env.STATIC_DIR));
app.use(`${process.env.BASE_URL}${process.env.UPLOAD_PATH}`, express.static(process.env.UPLOAD_DIR));
// CORS middleware
app.use(cors());
app.options('*', cors());
// support application/json type post data
app.use(bodyParser.json());
// support application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: false }));
// compression
app.use(compression());
// secret variable
app.set('secret', process.env.SECRET);
// flash
app.use(flash());
// session
// app.use(express.session({ cookie: { maxAge: 60000 } }));
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SECRET,
    // store: new MongoStore({
    //   url: mongoUrl,
    //   autoReconnect: true
    // })
  }),
);
// lusca
// app.use(
// lusca({
// csrf: true,
// csp: {
//   /* ... */
// },
//     xframe: 'SAMEORIGIN',
//     p3p: 'ABCDEF',
//     hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
//     xssProtection: true,
//     nosniff: true,
//     referrerPolicy: 'same-origin',
//   }),
// );
// Error Handler. Provides full stack - remove for production
// if (process.env.NODE_ENV !== 'production') {
//   const errorHandler = require('errorHandler');
//   app.use(errorHandler());
// }

// middleware
app.use(middleware);
/* GET home page. */
app.get(process.env.BASE_URL, (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.end(`TM-MLE Server. version: ${process.env.npm_package_version}`); // process.env.npm_package_version
});
// Mount the router at /api so all its routes start with /api
app.use(`${process.env.BASE_URL}api`, routes.router);

export default app;
