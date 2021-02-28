import moment from "moment";
import Logger from "../../services/logger";
import Pagination from "../../utils/pagination";
import { Types, startSession } from "mongoose";
import { Request, Response, NextFunction } from "express";
import { getIp, getUserAgent } from "../../utils/request";
import { MExercises } from "../../models/exercises";
import { MQuestion } from "../../models/questions";

class ExercisesController {
  public path = "exercises";
  public get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conditions = {} as any;
      if (req.query.filter) {
        conditions.$text = { $search: req.query.filter };
      }
      const flag = req.query.flag as string;
      conditions.flag = parseInt(flag) || 1;
      const countDocuments = await MExercises.where(
        conditions as any
      ).countDocuments();
      const rs = await MExercises.aggregate([
        { $match: conditions },
        {
          $lookup: {
            from: "types",
            let: { qtype: { $toString: "$type" } },
            as: "types",
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$key", "exercises_type"] },
                      { $eq: ["$code", "$$qtype"] },
                    ],
                  },
                },
              },
              { $project: { _id: 0, typeName: "$name" } },
            ],
          },
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [{ $arrayElemAt: ["$types", 0] }, "$$ROOT"],
            },
          },
        },
        {
          $project: {
            types: 0,
          },
        },
      ])
        .skip(
          (parseInt(req.query.page as string) - 1) *
            parseInt(req.query.rowsPerPage as string)
        )
        .limit(parseInt(req.query.rowsPerPage as string))
        .sort({
          [(req.query.sortBy as string) || "orders"]:
            req.query.descending === "true" ? -1 : 1,
        }) // 1 ASC, -1 DESC
        .exec();
      return res.status(200).json({ rowsNumber: countDocuments, data: rs });
    } catch (e) {
      console.log(e);
      return res.status(500).send("invalid");
    }
  };

  public find = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query._id) {
        if (Types.ObjectId.isValid(req.query._id as string)) {
          MExercises.findById(req.query._id, (e, rs) => {
            if (e) return res.status(500).send(e);
            return res.status(200).json(rs);
          });
        } else {
          return res.status(500).send("invalid");
        }
      }
    } catch (e) {
      return res.status(500).send("invalid");
    }
  };

  public exist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      MExercises.findOne(req.query, (e, rs) => {
        if (e) return res.status(200).json(null);
        return res.status(200).json(rs);
      });
    } catch (e) {
      return res.status(200).json(null);
    }
  };

  public getAttr = async (req: Request, res: Response, next: NextFunction) => {
    try {
      MExercises.distinct(
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
    if (!req.body || Object.keys(req.body).length < 1) {
      return res.status(500).send("invalid");
    }
    const session = await startSession();
    session.startTransaction();
    try {
      // const x = await MExercises.findOne({ code: req.body.code });
      // if (x) return res.status(501).send('exist');
      const rs = { success: [] as number[], error: [] as number[] };
      const questions = req.body.questions;
      req.body.createdAt = new Date();
      req.body.createdBy = req.verify._id;
      req.body.createdIp = getIp(req);
      // console.log(req.body.createdIp);
      // req.body.userAgent = getUserAgent(req);
      req.body.startAt = moment(req.body.startAt, "DD/MM/YYYY HH:mm:00");
      req.body.endAt = moment(req.body.endAt, "DD/MM/YYYY HH:mm:00");
      req.body.totalQuestion = questions.length;
      req.body.questions = [];
      // Save Exercises
      const data = new MExercises(req.body);
      // data.validate()
      const dataSave = await data.save();
      // Save Questions
      let index = 0;
      const questionsExercises: any[] = [];
      for await (const e of questions) {
        index = index + 1;
        e.key = dataSave._id;
        const item = new MQuestion(e);
        const itemSave = await item.save();
        if (itemSave) {
          rs.success.push(index);
          questionsExercises.push(itemSave._id);
        } else rs.error.push(index);
      }
      await MExercises.updateOne(
        { _id: dataSave._id },
        {
          $set: {
            questions: questionsExercises,
          },
        }
      );
      // Push logs
      Logger.set(req, this.path, dataSave._id, "insert");
      return res.status(201).json({ data: dataSave, result: rs });
    } catch (e) {
      console.log(e);
      await session.abortTransaction();
      session.endSession();
      return res.status(500).send({ error: e, ip: req.ip });
    }
  };

  public put = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // if (!req.params.id) return res.status(500).send('Incorrect Id!')
      if (!req.body || Object.keys(req.body).length < 1)
        return res.status(500).send("invalid");
      if (Types.ObjectId.isValid(req.body._id)) {
        MExercises.updateOne(
          { _id: req.body._id },
          {
            $set: {
              categories: req.body.categories,
              kind: req.body.kind,
              level: req.body.level,
              point: req.body.point,
              content: req.body.content,
              answers: req.body.answers,
              correct: req.body.correct,
              tags: req.body.tags,
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
      return res.status(500).send(e);
    }
  };

  public patch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rs = { success: [] as string[], error: [] as string[] };
      for await (const _id of req.body._id) {
        const x = await MExercises.findById(_id);
        if (x) {
          const _x = await MExercises.updateOne(
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
      return res.status(500).send(e);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (Types.ObjectId.isValid(req.params._id)) {
        MExercises.deleteOne({ _id: req.params._id }, undefined, (e: any) => {
          if (e) return res.status(500).send(e);
          // Push logs
          Logger.set(req, this.path, req.params._id, "delete");
          return res.status(204).json(true);
        });
      } else {
        return res.status(500).send("invalid");
      }
    } catch (e) {
      return res.status(500).send(e);
    }
  };
}
export default new ExercisesController();
