import { SHA256 } from '../../utils/crypto';
import { MUser } from '../../models/users';
import { IRole, MRole } from '../../models/roles';
import { IRoute } from '../../models/routes';
import * as middleware from '../../services/middleware';
import { Request, Response, NextFunction } from 'express';
import { constantUsers, constantRoutes } from '../../config/common';

class AuthController {
  public path = 'auth';
  // public router = Router();
  // constructor() {
  //   this.initRoutes();
  // }
  // private initRoutes() {
  //   this.router
  //     .route(this.path)
  //     .get(this.authToken)
  //     .post(this.authLogin);
  // }
  private generateRoutesChildren = (routes: IRoute[], rolesRoutes: string[]) => {
    const rs: IRoute[] = [];
    routes.forEach((e: IRoute) => {
      if (rolesRoutes.indexOf(e.name) >= 1) rs.push(e);
      else {
        if (e.children) {
          const tmp = this.generateRoutes(e.children, rolesRoutes, null);
          if (tmp.length > 0) {
            e.children = tmp;
            rs.push(e);
          }
        }
      }
    });
    return rs;
  };
  private generateRoutes = (routes: IRoute[], rolesRoutes: string[], dependent: string | null) => {
    const rs: IRoute[] = [];
    try {
      const children = routes.filter((x) => x.dependent !== null);
      routes.forEach((e) => {
        const _dependent = e.dependent ? e.dependent.toString() : null;
        if (rolesRoutes.indexOf(e.name) >= 0 && _dependent === dependent) {
          const child = this.generateRoutes(children, rolesRoutes, e._id.toString());
          if (child.length > 0) e.children = child;
          rs.push(e);
        }
        // if (rolesRoutes.indexOf(e.name) >= 0 && e.parents !== null) {
        //   const x = routes.find(x => x._id.toString() === e.parents)
        //   if (x) {
        //     helpers.pushIfNotExist(x.children, e)
        //     helpers.pushIfNotExist(rs, x)
        //   }
        // }
      });
    } catch (e) {
      console.log(e);
    }
    return rs;
  };
  private getAuthRoutes = async (authRoles: any) => {
    // Roles
    const roles = await MRole.find({ _id: { $in: authRoles } }).sort({ level: 1 });
    const authRoutes: string[] = [];
    roles.forEach((e: IRole) => {
      // helpers.pushIfNotExist(authRoutes, e.routes);
      authRoutes.pushIfNotExist(e.routes);
    });
    // // Routes
    // const routes = await MRoute.find({ flag: 1 }).sort({ dependent: 1, orders: 1 });
    // // console.log(routes)
    // return this.generateRoutes(routes, authRoutes, null);
    return authRoutes;
  };
  private getConstantRoutes = async () => {
    const routes = await MRole.distinct('routes');
    return constantRoutes.pushIfNotExist(routes);
  };
  public get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // constant account
      let rs: any = constantUsers.find((x) => x._id === req.verify._id);
      let routes: string[] = [];
      // database account
      if (rs) {
        routes = await this.getConstantRoutes();
      } else {
        rs = await MUser.findOne({ _id: req.verify._id });
        if (!rs) return res.status(402).json({ msg: 'token_invalid' });
        // Routes
        routes = await this.getAuthRoutes(rs.roles);
      }
      return res.status(200).json({ user: rs, routes });
      // return res.status(200).json({ data: req.verify._id as any });
    } catch (e) {
      console.log(e);
      return res.status(500).send('invalid');
    }
  };

  public post = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // check req data
      if (!req.body.username || !req.body.password)
        return res.status(404).json({ msg: 'no_exist' });
      // constant account
      let rs: any = constantUsers.find(
        (x) =>
          x.username === req.body.username && x.password === SHA256(req.body.password + x.salt),
      );
      let routes: string[] = [];
      if (rs) {
        routes = await this.getConstantRoutes();
      } else {
        // throw new Error('wrong')
        rs = await MUser.findOne({ username: req.body.username });
        // console.log(rs)
        // not exist username
        if (!rs) return res.status(502).json({ msg: 'no_exist' });
        // check password
        if (rs.password !== SHA256(req.body.password + rs.salt))
          return res.status(503).json({ msg: 'no_exist' });
        // check lock
        if (!rs.enable) return res.status(504).json({ msg: 'locked' });
        // Routes
        routes = await this.getAuthRoutes(rs.roles);
        // Update last login
        await MUser.updateOne(
          { _id: rs._id },
          {
            $set: {
              lastLogin: new Date(),
            },
          },
        );
      }
      // Token
      const token = middleware.sign({ _id: rs._id, code: rs.username });
      if (rs) return res.status(200).json({ token, user: rs, routes });
      else return res.status(401).json({ msg: 'wrong' });
    } catch (e) {
      return res.status(500).send('invalid');
    }
  };
}

export default new AuthController();
