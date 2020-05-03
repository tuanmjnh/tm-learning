import './utils/prototypes';
import './config';

// Appliction
// import http from "http"
import Appliction from './services/app';
// var server=http.createServer(function(req,res){
//   res.end('test');
// });
const server = new Appliction();
server.Start(process.env.PORT || 8001);
