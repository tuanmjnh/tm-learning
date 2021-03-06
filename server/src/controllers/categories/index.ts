import Logger from "../../services/logger";
import Pagination from "../../utils/pagination";
import { Types } from "mongoose";
import { Request, Response, NextFunction } from "express";
import { getIp } from "../../utils/request";
import { MCategory } from "../../models/categories";

class CategoriesController {
  public path = "categories";
  public get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conditions = {
        $and: [{ flag: req.query.flag ? req.query.flag : 1 }],
      };
      if (req.query.type) conditions.$and.push({ type: req.query.type } as any);
      else conditions.$and.push({ type: "product" } as any);
      if (req.query.filter) {
        // conditions.$and.push({
        //   $or: [{ title: new RegExp(req.query.filter, 'i') }],
        // });
        conditions.$and.push({ $text: { $search: req.query.filter } } as any);
      }
      if (!req.query.sortBy) req.query.sortBy = "orders";
      const countDocuments = await MCategory.where(
        conditions as any
      ).countDocuments();
      const options = {
        // skip: (parseInt(req.query.page) - 1) * parseInt(req.query.rowsPerPage),
        // limit: parseInt(req.query.rowsPerPage),
        sort: {
          [(req.query.sortBy as string) || "orders"]:
            req.query.descending === "true" ? -1 : 1,
        }, // 1 ASC, -1 DESC
      };
      MCategory.find(conditions as any, null, options, (e, rs) => {
        if (e) return res.status(500).send(e);
        // if (!rs) return res.status(404).send('No data exist!')
        // console.log(rs)
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
          MCategory.findById(req.query._id, (e, rs) => {
            if (e) return res.status(500).send(e);
            // if (!rs) return res.status(404).send('no_exist');
            return res.status(200).json(rs);
          });
        } else {
          return res.status(500).send("invalid");
        }
      } else {
        MCategory.findOne({ key: req.query.key }, (e, rs) => {
          if (e) return res.status(500).send(e);
          // if (!rs) return res.status(404).send('no_exist');
          return res.status(200).json(rs);
        });
      }
    } catch (e) {
      return res.status(500).send("invalid");
    }
  };

  public exist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      MCategory.findOne(req.query, (e, rs) => {
        if (e) return res.status(200).json(false);
        return res.status(200).json(rs ? true : false);
      });
    } catch (e) {
      return res.status(200).json(false);
    }
  };

  public getAttr = async (req: Request, res: Response, next: NextFunction) => {
    try {
      MCategory.distinct(
        req.query.key ? "attr.key" : "attr.value",
        undefined,
        (e, rs: any) => {
          if (e) return res.status(500).send(e);
          if (req.query.filter)
            rs = rs.filter((x) =>
              new RegExp(req.query.filter as string, "i").test(x)
            );
          const countDocuments = rs.length;
          const page = parseInt(req.query.page as string);
          const rowsPerPage = parseInt(req.query.rowsPerPage as string);
          if (req.query.page && req.query.rowsPerPage)
            rs = Pagination.get(rs, page, rowsPerPage);
          return res.status(200).json({ rowsNumber: countDocuments, data: rs });
        }
      );
    } catch (e) {
      return res.status(500).send("invalid");
    }
  };

  public post = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body || Object.keys(req.body).length < 1) {
        return res.status(500).send("invalid");
      }
      const x = await MCategory.findOne({ code: req.body.code });
      console.log(x);
      if (x) return res.status(501).send("exist");
      req.body.created = { at: new Date(), by: req.verify._id, ip: getIp(req) };
      const data = new MCategory(req.body);
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
      if (!req.body || Object.keys(req.body).length < 1) {
        return res.status(500).send("invalid");
      }
      const x = await MCategory.findOne({
        _id: { $nin: [req.body._id] },
        code: req.body.code,
      });
      if (x) return res.status(501).send("exist");
      if (Types.ObjectId.isValid(req.body._id)) {
        MCategory.updateOne(
          { _id: req.body._id },
          {
            $set: {
              type: req.body.type,
              dependent: req.body.dependent,
              level: req.body.level,
              title: req.body.title,
              code: req.body.code,
              desc: req.body.desc,
              content: req.body.content,
              url: req.body.url,
              images: req.body.images,
              quantity: req.body.quantity,
              position: req.body.position,
              tags: req.body.tags,
              icon: req.body.icon,
              color: req.body.color,
              meta: req.body.meta,
              start_at: req.body.start_at,
              end_at: req.body.end_at,
              orders: req.body.orders,
              flag: req.body.flag,
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

  public updateOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // if (!req.params.id) return res.status(500).send('Incorrect Id!')
      if (!req.body || Object.keys(req.body).length < 1 || !req.body._id) {
        return res.status(500).send("invalid");
      }
      if (!req.body.dependent) req.body.dependent = null;
      if (Types.ObjectId.isValid(req.body._id)) {
        MCategory.updateOne(
          { _id: req.body._id },
          {
            $set: {
              dependent: req.body.dependent,
              level: req.body.level,
              orders: req.body.orders,
            },
          },
          undefined,
          (e, rs) => {
            // { multi: true, new: true },
            if (e) return res.status(500).send(e);
            // Push logs
            // logs.push(req, { user_id: verify._id, collection: 'roles', collection_id: req.body._id, method: 'update' })
            return res.status(202).json(rs);
          }
        );
      } else {
        return res.status(500).send("invalid");
      }
    } catch (e) {
      return res.status(500).send("inval`i`d");
    }
  };

  public patch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rs = { success: [] as string[], error: [] as string[] };
      for await (const _id of req.body._id) {
        const x = await MCategory.findById(_id);
        if (x) {
          const _x = await MCategory.updateOne(
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
    } catch (e) {
      return res.status(500).send("invalid");
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (Types.ObjectId.isValid(req.params._id)) {
        MCategory.deleteOne({ _id: req.params._id }, undefined, (e: any) => {
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
export default new CategoriesController();
