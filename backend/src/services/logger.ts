import { ILogger, MLogger } from '../models/logger';
import { getIp, getUserAgent } from '../utils/request';
// console.log(ip.get(req), req.headers['user-agent'])

class Logger {
  public set = async (request: any, name: string, id: any, action: string) => {
    try {
      if (!!process.env.LOGGER) return;
      const logger = {
        userId: request.verify._id,
        collName: name,
        collId: id,
        method: action,
        userAgent: getUserAgent(request),
        at: new Date(),
        ip: getIp(request),
      };
      const data = new MLogger(logger);
      // data.validate()
      data.save((e, rs) => {
        if (e) return false;
        return true;
      });
    } catch (e) {
      console.log(e);
    }
  };
  public setOne = async (logger: ILogger | any) => {
    try {
      // const data = new Model({
      //   c: logger.collection_name,
      //   cid: logger.collection_id,
      //   method: logger.method,
      //   at: new Date(),
      //   by: logger.user_id, // mongoose.Schema.Types.ObjectId(by)
      //   ip: logger.ip,
      //   com: req.headers['user-agent'],
      // });
      const data = new MLogger(logger);
      // data.validate()
      data.save((e, rs) => {
        if (e) return false;
        return true;
      });
    } catch (e) {
      console.log(e);
    }
  };
}
export default new Logger();
