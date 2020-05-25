import './utils/prototypes';
import './config';

// Appliction
// import http from "http"
import Appliction from './services/app';
import http from 'http';
// var server=http.createServer(function(req,res){
//   res.end('test');
// });
const server = new Appliction();
server.start(process.env.PORT || 8001);
// const app = new Appliction();
// const server = http.createServer(app.start(process.env.PORT || 8001));

// -----------------------------------------------------------------------------
// When SIGINT is received (i.e. Ctrl-C is pressed), shutdown services
// -----------------------------------------------------------------------------
// process.on('SIGINT', () => {
//   console.log('SIGINT received ...');
//   console.log('Shutting down the server');
//   server.close(() => {
//     console.log('Server has been shutdown');
//     console.log('Exiting process ...');
//     process.exit(0);
//   });
// });
