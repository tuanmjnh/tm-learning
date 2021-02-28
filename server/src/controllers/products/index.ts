import Logger from "../../services/logger";
import Pagination from "../../utils/pagination";
import { Types } from "mongoose";
import { Request, Response, NextFunction } from "express";
import { getIp } from "../../utils/request";
import { MProduct } from "../../models/products";

class ProductsController {
  public path = "products";
  public get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conditions = {
        $and: [{ flag: req.query.flag ? req.query.flag : 1 }],
      };
      if (req.query.filter) {
        // conditions.$and.push({
        //   $or: [
        //     { title: new RegExp(search.normalize(req.query.filter), 'i') },
        //     { code: new RegExp(search.normalize(req.query.filter), 'i') },
        //     { origin: new RegExp(search.normalize(req.query.filter), 'i') }
        //   ]
        // })
        conditions.$and.push({ $text: { $search: req.query.filter } } as any);
      }
      if (req.query.categories)
        conditions.$and.push({
          categories: { $in: [req.query.categories] },
        } as any);
      if (!req.query.sortBy) req.query.sortBy = "orders";
      const countDocuments = await MProduct.where(
        conditions as any
      ).countDocuments();
      const options = {
        skip:
          (parseInt(req.query.page as string) - 1) *
          parseInt(req.query.rowsPerPage as string),
        limit: parseInt(req.query.rowsPerPage as string),
        sort: {
          [(req.query.sortBy as string) || "orders"]:
            req.query.descending === "true" ? -1 : 1,
        }, // 1 ASC, -1 DESC
      };
      MProduct.find(conditions as any, null, options, (e, rs) => {
        if (e) return res.status(500).send(e);
        // if (!rs) return res.status(404).send('No data exist!')
        return res.status(200).json({ rowsNumber: countDocuments, data: rs });
      });
    } catch (e) {
      console.log(e);
      return res.status(500).send("invalid");
    }
  };

  public find = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query._id) {
        if (Types.ObjectId.isValid(req.query._id as string)) {
          MProduct.findById(req.query._id, (e, rs) => {
            if (e) return res.status(500).send(e);
            return res.status(200).json(rs);
          });
        } else {
          return res.status(500).send("invalid");
        }
      } else {
        MProduct.findOne({ code: req.query.code as string }, (e, rs) => {
          if (e) return res.status(500).send(e);
          return res.status(200).json(rs);
        });
      }
    } catch (e) {
      return res.status(500).send("invalid");
    }
  };

  public exist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      MProduct.findOne(req.query, (e, rs) => {
        if (e) return res.status(200).json(null);
        return res.status(200).json(rs);
      });
    } catch (e) {
      return res.status(200).json(null);
    }
  };

  public getAttr = async (req: Request, res: Response, next: NextFunction) => {
    try {
      MProduct.distinct(
        req.query.key ? "attr.key" : "attr.value",
        undefined,
        (e, rs: any) => {
          if (e) return res.status(500).send(e);
          if (req.query.filter)
            rs = rs.filter((x) =>
              new RegExp(req.query.filter as string, "i").test(x)
            );
          const countDocuments = rs.length;
          if (req.query.page && req.query.rowsPerPage)
            rs = Pagination.get(
              rs,
              parseInt(req.query.page as string),
              parseInt(req.query.rowsPerPage as string)
            );
          return res.status(200).json({ rowsNumber: countDocuments, data: rs });
        }
      );
    } catch (e) {
      return res.status(500).send("invalid");
    }
  };

  public post = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (
        !req.body ||
        Object.keys(req.body).length < 1 ||
        !req.body.title ||
        !req.body.code ||
        req.body.categories.length < 1
      ) {
        return res.status(500).send("invalid");
      }
      const x = await MProduct.findOne({ code: req.body.code });
      if (x) return res.status(501).send("exist");
      req.body.created = { at: new Date(), by: req.verify._id, ip: getIp(req) };
      const data = new MProduct(req.body);
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
        // const product: IProduct = {
        //   categories: req.body.categories,
        //   title: req.body.title as string,
        //   code: req.body.code as string,
        //   desc: req.body.desc as string,
        //   content: req.body.content as string,
        //   images: req.body.images as string[],
        //   quantity: parseInt(req.body.quantity),
        //   price: parseInt(req.body.price),
        //   price_discount: parseInt(req.body.price_discount),
        //   price_import: parseInt(req.body.price_import),
        //   price_export: parseInt(req.body.price_export),
        //   price_unit: req.body.price_unit as string,
        //   unit: req.body.unit as string,
        //   origin: req.body.origin as string,
        //   date: req.body.date as string,
        //   pin: req.body.pin as string[],
        //   tags: req.body.tags as string[],
        //   attr: req.body.attr as any[],
        //   meta: req.body.meta as any[],
        //   // start_at: req.body.start_at,
        //   // end_at: req.body.end_at,
        //   order: parseInt(req.body.order),
        //   flag: parseInt(req.body.flag),
        // };
        MProduct.updateOne(
          { _id: req.body._id },
          {
            $set: {
              categories: req.body.categories,
              title: req.body.title,
              code: req.body.code,
              desc: req.body.desc,
              content: req.body.content,
              images: req.body.images,
              quantity: parseInt(req.body.quantity),
              price: parseInt(req.body.price),
              price_discount: parseInt(req.body.price_discount),
              price_import: parseInt(req.body.price_import),
              price_export: parseInt(req.body.price_export),
              price_unit: req.body.price_unit,
              unit: req.body.unit,
              origin: req.body.origin,
              date: req.body.date,
              pin: req.body.pin,
              tags: req.body.tags,
              attr: req.body.attr,
              meta: req.body.meta,
              // start_at: req.body.start_at,
              // end_at: req.body.end_at,
              order: parseInt(req.body.order),
              flag: parseInt(req.body.flag),
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
        const x = await MProduct.findById(_id);
        if (x) {
          const _x = await MProduct.updateOne(
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
        MProduct.deleteOne({ _id: req.params._id }, undefined, (e: any) => {
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
export default new ProductsController();
