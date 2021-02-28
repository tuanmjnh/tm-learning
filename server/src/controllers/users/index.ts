import Logger from "../../services/logger";
import { Types, startSession } from "mongoose";
import { Request, Response, NextFunction } from "express";
import { getIp } from "../../utils/request";
import { MUser } from "../../models/users";
import { SHA256, NewGuid } from "../../utils/crypto";
import { isBoolean } from "../../utils/validate";

class UsersController {
  public path = "users";
  public get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conditions = {
        $and: [{ enable: req.query.enable ? req.query.enable : true }],
      };
      if (req.query.filter) {
        conditions.$and.push({
          $or: [
            { email: new RegExp(req.query.filter as string, "i") },
            { full_name: new RegExp(req.query.filter as string, "i") },
            { person_number: new RegExp(req.query.filter as string, "i") },
            { phone: new RegExp(req.query.filter as string, "i") },
          ],
        } as any);
      }
      if (!req.query.sortBy) req.query.sortBy = "email";
      const countDocuments = await MUser.where(
        conditions as any
      ).countDocuments();
      const options = {
        skip:
          (parseInt(req.query.page as string) - 1) *
          parseInt(req.query.rowsPerPage as string),
        limit: parseInt(req.query.rowsPerPage as string),
        sort: {
          [(req.query.sortBy as string) || "email"]:
            req.query.descending === "true" ? -1 : 1,
        }, // 1 ASC, -1 DESC
      };
      MUser.find(conditions as any, null, options, (e: any, rs: any) => {
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
          MUser.findById(req.query._id, (e, rs) => {
            if (e) return res.status(500).send(e);
            return res.status(200).json(rs);
          });
        } else {
          return res.status(500).send("invalid");
        }
      } else if (req.query.username) {
        MUser.findOne({ username: req.query.username as string }, (e, rs) => {
          if (e) return res.status(500).send(e);
          return res.status(200).json(rs);
        });
      } else if (req.query.users) {
        MUser.where({ $in: { username: req.query.users } } as any, (e, rs) => {
          if (e) return res.status(500).send(e);
          return res.status(200).json(rs);
        });
      }
    } catch (e) {
      return res.status(500).send("invalid");
    }
  };

  public finds = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.users) {
        let rs: any[] = [];
        const qry = MUser.aggregate([
          {
            $match: {
              $and: [{ username: { $in: req.body.users } }, { enable: true }],
            },
          },
          {
            $project: {
              password: 0,
              // exams: 0,
              // correct: 0,
              // point: 0,
              // answerType: {$size: '$correct'}
            },
          },
          {
            $sort: {
              [(req.query.sortBy as string) || "username"]:
                req.query.descending === "true" ? -1 : 1,
            } as any,
          },
        ]);
        rs = await qry.exec();
        if (rs) return res.status(200).json(rs);
        return res.status(200).json([]);
      }
      return res.status(200).json([]);
    } catch (e) {
      console.log(e);
      return res.status(500).send("invalid");
    }
  };

  public post = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body || Object.keys(req.body).length < 1 || !req.body.username) {
        return res.status(500).send("invalid");
      }
      const x = await MUser.findOne({ username: req.body.username });
      if (x) return res.status(501).send("exist");
      const password = req.body.password
        ? req.body.password
        : NewGuid().split("-")[0];
      req.body.salt = NewGuid("n");
      req.body.password = SHA256(password + req.body.salt);
      req.body.created = { at: new Date(), by: req.verify._id, ip: getIp(req) };
      const data = new MUser(req.body);
      // data.validate()
      data.save((e: any, rs: any) => {
        if (e) return res.status(500).send(e);
        rs.password = password;
        // Push logs
        Logger.set(req, this.path, rs._id, "insert");
        return res.status(201).json(rs);
      });
    } catch (e) {
      return res.status(500).send("invalid");
    }
  };

  public import = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body || !req.body.length) return res.status(500).send("invalid");
    const session = await startSession();
    session.startTransaction();
    try {
      const rs = { success: [] as number[], error: [] as number[] };
      let i = 0;
      for await (const e of req.body) {
        i++;
        const x = await MUser.findOne({ username: e.username });
        if (x) {
          rs.error.push(i);
          continue;
        }
        e.salt = NewGuid("n");
        e.password = SHA256(e.password + e.salt);
        e.created = { at: new Date(), by: req.verify._id, ip: getIp(req) };
        const item = new MUser(e);
        const itemSave = await item.save();
        if (itemSave) rs.success.push(i);
        else rs.error.push(i);
      }
      return res.status(201).json(rs);
    } catch (e) {
      console.log(e);
      await session.abortTransaction();
      session.endSession();
      return res.status(500).send("invalid");
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body && !Array.isArray(req.body))
        return res.status(500).send("invalid");
      if (req.body.length < 1) return res.status(500).send("Empty data!");
      const data: any[] = [];
      req.body.forEach((e) => {
        data.push(new MUser(e));
      });
      MUser.create(data)
        .then((rs) => {
          return res.status(201).json(rs);
        })
        .catch((e) => {
          return res.status(500).send(e);
        });
    } catch (e) {
      return res.status(500).send("invalid");
    }
  };

  public insertOne = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.body) return res.status(500).send("invalid");
      const data = new MUser(req.body);
      // data.validate();
      MUser.collection.insertOne(data, (e: any, rs: any) => {
        if (e) return res.status(500).send(e);
        // Push logs
        Logger.set(req, this.path, rs._id, "insert");
        return res.status(200).json(rs);
      });
    } catch (e) {
      return res.status(500).send("invalid");
    }
  };

  public put = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // if (!req.body._id) return res.status(500).send('invalid')
      if (!req.body || Object.keys(req.body).length < 1)
        return res.status(500).send("invalid");
      if (Types.ObjectId.isValid(req.body._id)) {
        MUser.updateOne(
          { _id: req.body._id },
          {
            $set: {
              group: req.body.group,
              fullName: req.body.fullName,
              email: req.body.email,
              phone: req.body.phone,
              personNumber: req.body.personNumber,
              region: req.body.region,
              avatar: req.body.avatar,
              note: req.body.note,
              dateBirth: req.body.dateBirth,
              gender: req.body.gender,
              address: req.body.address,
              roles: req.body.roles,
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

  public resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (Types.ObjectId.isValid(req.body._id)) {
        // Find user by id
        const x = await MUser.findById(req.body._id);
        if (!x) return res.status(404).send("no_exist");
        // Generate password
        const password = NewGuid().split("-")[0];
        MUser.updateOne(
          { _id: req.body._id },
          {
            $set: {
              password: SHA256(password + x.salt),
              lastChangePass: new Date(),
            },
          },
          undefined,
          (e: any, rs: any) => {
            if (e) return res.status(500).send(e);
            // Push logs
            Logger.set(req, this.path, rs._id, "reset-password");
            res.status(206).json({ password });
          }
        );
      } else {
        return res.status(500).send("invalid");
      }
    } catch (e) {
      return res.status(500).send("invalid");
    }
  };

  public changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Find user by id
      const user = await MUser.findOne({ _id: req.verify._id });
      if (!user) return res.status(404).send("no_exist");
      // check password
      if (user.password !== SHA256(req.body.oldPassword + user.salt))
        return res.status(505).json({ msg: "wrong_password" });
      // set new password
      MUser.updateOne(
        { _id: req.verify._id },
        {
          $set: {
            password: SHA256(req.body.newPassword + user.salt),
            lastChangePass: new Date(),
          },
        },
        undefined,
        (e, rs) => {
          if (e) return res.status(500).send(e);
          // Push logs
          Logger.set(req, this.path, user._id, "change-password");
          res.status(202).json(true);
        }
      );
    } catch (e) {
      return res.status(500).send("invalid");
    }
  };

  public patch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rs = { success: [] as string[], error: [] as string[] };
      for await (const _id of req.body._id) {
        // if (!validate.isBoolean(req.body.disabled)) {
        //   rs.error.push(id)
        //   continue
        // }
        const x = await MUser.findById(_id);
        if (x) {
          const _x = await MUser.updateOne(
            { _id },
            { $set: { enable: x.enable === true ? false : true } }
          );
          if (_x.nModified) {
            rs.success.push(_id);
            // Push logs
            Logger.set(req, this.path, _id, x.enable ? "lock" : "unlock");
          } else rs.error.push(_id);
        }
      }
      return res.status(203).json(rs);
      // if (!validate.isBoolean(req.body.disabled)) return res.status(500).send('invalid')
      // if (Types.ObjectId.isValid(req.params.id)) {
      //   MUser.updateOne({ _id: req.params.id }, { $set: { disabled: req.body.disabled } }, (e, rs) => {
      //     if (e) return res.status(500).send(e)
      //     if (!rs) return res.status(404).send('no_exist')
      //     return res.status(203).json(rs)
      //   })
      // } else {
      //   return res.status(500).send('invalid')
      // }
    } catch (e) {
      return res.status(500).send("invalid");
    }
  };

  public verified = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isBoolean(req.body.verified)) return res.status(500).send("invalid");
      if (Types.ObjectId.isValid(req.body._id)) {
        MUser.updateOne(
          { _id: req.body._id },
          { $set: { verified: req.body.verified } },
          undefined,
          (e, rs) => {
            if (e) return res.status(500).send(e);
            // Push logs
            Logger.set(req, this.path, req.params._id, "verified");
            return res.status(205).json(rs);
          }
        );
      } else {
        return res.status(500).send("invalid");
      }
    } catch (e) {
      return res.status(500).send("invalid");
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (Types.ObjectId.isValid(req.params._id)) {
        MUser.deleteOne({ _id: req.params._id }, undefined, (e: any) => {
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
export default new UsersController();
