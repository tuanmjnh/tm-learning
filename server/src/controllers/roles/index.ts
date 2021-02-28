import Logger from "../../services/logger";
import { Types } from "mongoose";
import { Request, Response, NextFunction } from "express";
import { getIp } from "../../utils/request";
import { MRole } from "../../models/roles";

class RolesController {
  public path = "roles";
  public get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conditions = {
        $and: [{ flag: req.query.flag ? req.query.flag : 1 }],
      };
      if (req.query.filter) {
        conditions.$and.push({
          $or: [
            { key: new RegExp(req.query.filter as string, "i") },
            { name: new RegExp(req.query.filter as string, "i") },
          ],
        } as any);
      }
      if (!req.query.sortBy) req.query.sortBy = "level";
      const countDocuments = await MRole.where(
        conditions as any
      ).countDocuments();
      const options = {
        skip:
          (parseInt(req.query.page as string) - 1) *
          parseInt(req.query.rowsPerPage as string),
        limit: parseInt(req.query.rowsPerPage as string),
        sort: {
          [(req.query.sortBy as string) || "level"]:
            req.query.descending === "true" ? -1 : 1,
        }, // 1 ASC, -1 DESC
      };
      MRole.find(conditions as any, null, options, (e, rs) => {
        if (e) return res.status(500).send(e);
        // if (!rs) return res.status(404).send('No data exist!')
        return res.status(200).json({ rowsNumber: countDocuments, data: rs });
      });
    } catch (e) {
      return res.status(500).send("invalid");
    }
  };

  public find = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query._id) {
        if (Types.ObjectId.isValid(req.query._id as string)) {
          MRole.findById(req.query._id, (e, rs) => {
            if (e) return res.status(500).send(e);
            return res.status(200).json(rs);
          });
        } else {
          return res.status(500).send("invalid");
        }
      } else {
        MRole.findOne({ key: req.query.key as string }, (e, rs) => {
          if (e) return res.status(500).send(e);
          return res.status(200).json(rs);
        });
      }
    } catch (e) {
      return res.status(500).send("invalid");
    }
  };

  public post = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (
        !req.body ||
        Object.keys(req.body).length < 1 ||
        req.body.key.length < 1 ||
        req.body.name.length < 1
      ) {
        return res.status(500).send("invalid");
      }
      const x = await MRole.findOne({ key: req.body.key });
      if (x) return res.status(501).send("exist");
      req.body.created = { at: new Date(), by: req.verify._id, ip: getIp(req) };
      const data = new MRole(req.body);
      // data.validate()
      data.save((e, rs) => {
        if (e) return res.status(500).send(e);
        // Push logs
        Logger.set(req, this.path, rs._id, "insert");
        return res.status(201).json(rs);
      });
    } catch (e) {
      return res.status(500).send("invalid");
    }
  };

  public put = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // if (!req.params.id) return res.status(500).send('Incorrect Id!')
      if (!req.body || Object.keys(req.body).length < 1)
        return res.status(500).send("invalid");
      if (Types.ObjectId.isValid(req.body._id)) {
        MRole.updateOne(
          { _id: req.body._id },
          {
            $set: {
              name: req.body.name,
              desc: req.body.desc,
              level: req.body.level,
              color: req.body.color,
              routes: req.body.routes,
            },
          },
          undefined,
          (e, rs) => {
            // { multi: true, new: true },
            if (e) return res.status(500).send(e);
            // Push logs
            Logger.set(req, this.path, rs._id, "update");
            return res.status(202).json(rs);
          }
        );
      } else {
        return res.status(500).send("invalid");
      }
    } catch (e) {
      return res.status(500).send("invalid");
    }
  };

  public patch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rs = { success: [] as string[], error: [] as string[] };
      for await (const _id of req.body._id) {
        const x = await MRole.findById(_id);
        if (x) {
          const _x = await MRole.updateOne(
            { _id },
            { $set: { flag: x.flag === 1 ? 0 : 1 } }
          );
          if (_x.nModified) {
            rs.success.push(_id);
            // Push logs
            Logger.set(req, this.path, _id, x.flag === 1 ? "lock" : "unlock");
          } else rs.error.push(_id);
        }
      }
      return res.status(203).json(rs);

      // req.body.id.forEach(async e => {
      //   if (Types.ObjectId.isValid(e)) {
      //     const x = await MRole.findById(e)
      //     if (x) {
      //       MRole.updateOne({ _id: req.params.id }, { $set: { flag: req.body.flag } }, (e, rs) => {
      //         if (e) return res.status(500).send(e)
      //         if (!rs) return res.status(404).send('no_exist')
      //         return res.status(202).json(rs)
      //       })
      //     }
      //     return res.status(202).json(req.body.id)
      //   } else {
      //     return res.status(500).send('invalid')
      //   }
      // })
    } catch (e) {
      return res.status(500).send("invalid");
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (Types.ObjectId.isValid(req.params._id)) {
        MRole.deleteOne({ _id: req.params._id }, undefined, (e: any) => {
          if (e) return res.status(500).send(e);
          // Push logs
          Logger.set(req, this.path, req.params._id, "delete");
          return res.status(204).json(true);
        });
      } else {
        return res.status(500).send("invalid");
      }
    } catch (e) {
      return res.status(500).send("invalid");
    }
  };
}
export default new RolesController();
