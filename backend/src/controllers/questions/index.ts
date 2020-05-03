import moment from 'moment';
import Logger from '../../services/logger';
import Pagination from '../../utils/pagination';
import { Types, startSession } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { getIp } from '../../utils/request';
import { MQuestion } from '../../models/questions';
import { MQuestionImport } from '../../models/questions/import';

class QuestionsController {
  public path = 'questions';
  public get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conditions = { $and: [{ flag: req.query.flag ? req.query.flag : 1 }] };
      if (req.query.filter) {
        conditions.$and.push({ content: { $search: req.query.filter } } as any);
      }
      if (req.query.categories) {
        conditions.$and.push({ categories: { $in: [req.query.categories] } } as any);
      }
      if (!req.query.sortBy) req.query.sortBy = 'orders';
      const countDocuments = await MQuestion.where(conditions as any).countDocuments();
      const rs = await MQuestion.aggregate([
        {
          $lookup: {
            from: 'types',
            let: { qkind: { $toString: '$kind' } },
            as: 'kinds',
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$key', 'question_kind'] }, { $eq: ['$code', '$$qkind'] }],
                  },
                },
              },
              { $project: { _id: 0, kindName: '$name' } },
            ],
          },
        },
        // { $unwind: '$kinds' }, // $unwind used for getting data in object or for one record only
        {
          $lookup: {
            from: 'types',
            let: { qlevel: { $toString: '$level' } },
            as: 'levels',
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$key', 'question_level'] }, { $eq: ['$code', '$$qlevel'] }],
                  },
                },
              },
              { $project: { _id: 0, levelName: '$name' } },
            ],
          },
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                { $arrayElemAt: ['$levels', 0] },
                { $arrayElemAt: ['$kinds', 0] },
                '$$ROOT',
              ],
            },
          },
        },
        // { $unwind: '$levels' }, // $unwind used for getting data in object or for one record only
        {
          $project: {
            kinds: 0,
            // first: { $arrayElemAt: ['$levels', 0] },
            // last: { $arrayElemAt: ['$kinds', 0] },
          },
        },
      ])
        .match(conditions)
        .skip((parseInt(req.query.page as string) - 1) * parseInt(req.query.rowsPerPage as string))
        .limit(parseInt(req.query.rowsPerPage as string))
        .sort({
          [(req.query.sortBy as string) || 'orders']: req.query.descending === 'true' ? -1 : 1,
        }) // 1 ASC, -1 DESC
        .exec();
      return res.status(200).json({ rowsNumber: countDocuments, data: rs });
    } catch (e) {
      console.log(e);
      return res.status(500).send('invalid');
    }
  };

  public find = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query._id) {
        if (Types.ObjectId.isValid(req.query._id as string)) {
          MQuestion.findById(req.query._id, (e, rs) => {
            if (e) return res.status(500).send(e);
            return res.status(200).json(rs);
          });
        } else {
          return res.status(500).send('invalid');
        }
      } else if (req.query.key) {
        MQuestion.find({ key: req.query.key } as any, (e, rs) => {
          if (e) return res.status(500).send(e);
          return res.status(200).json(rs);
        });
      }
    } catch (e) {
      return res.status(500).send('invalid');
    }
  };

  public exist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      MQuestion.findOne(req.query, (e, rs) => {
        if (e) return res.status(200).json(null);
        return res.status(200).json(rs);
      });
    } catch (e) {
      return res.status(200).json(null);
    }
  };

  public getAttr = async (req: Request, res: Response, next: NextFunction) => {
    try {
      MQuestion.distinct(req.query.key ? 'attr.key' : 'attr.value', null, (e, rs) => {
        if (e) return res.status(500).send(e);
        if (req.query.filter)
          rs = rs.filter((x) => new RegExp(req.query.filter as string, 'i').test(x));
        const countDocuments = rs.length;
        if (req.query.page && req.query.rowsPerPage)
          rs = Pagination.get(
            rs,
            parseInt(req.query.page as string),
            parseInt(req.query.rowsPerPage as string),
          );
        return res.status(200).json({ rowsNumber: countDocuments, data: rs });
      });
    } catch (e) {
      return res.status(500).send('invalid');
    }
  };

  public post = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body || Object.keys(req.body).length < 1) {
        return res.status(500).send('invalid');
      }
      // const x = await MQuestion.findOne({ code: req.body.code });
      // if (x) return res.status(501).send('exist');
      req.body.created = { at: new Date(), by: req.verify._id, ip: getIp(req) };
      const data = new MQuestion(req.body);
      // data.validate()
      data.save((e, rs) => {
        if (e) return res.status(500).send(e);
        // Push logs
        Logger.set(req, this.path, rs._id, 'insert');
        return res.status(201).json(rs);
      });
    } catch (e) {
      return res.status(500).send('invalid');
    }
  };

  public import = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body || !req.body.length) {
      return res.status(500).send('invalid');
    }
    const session = await startSession();
    session.startTransaction();
    try {
      const rs = { success: [] as number[], error: [] as number[] };
      let index = 0;
      const importData = new MQuestionImport({
        code: parseInt(moment().format('YYYYMMDDHHmmssms')),
        total: req.body.length,
        createdAt: new Date(),
        createdBy: req.verify._id,
        createdIp: getIp(req),
      });
      const importSave = await importData.save();
      for await (const e of req.body) {
        index = index + 1;
        e.key = importSave._id;
        const item = new MQuestion(e);
        const itemSave = await item.save();
        if (itemSave) rs.success.push(index);
        else rs.error.push(index);
      }
      return res.status(201).json(rs);
    } catch (e) {
      console.log(e);
      await session.abortTransaction();
      session.endSession();
      return res.status(500).send('invalid');
    }
  };

  public put = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // if (!req.params.id) return res.status(500).send('Incorrect Id!')
      if (!req.body || Object.keys(req.body).length < 1) return res.status(500).send('invalid');
      if (Types.ObjectId.isValid(req.body._id)) {
        MQuestion.updateOne(
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
          (e, rs) => {
            // { multi: true, new: true },
            if (e) return res.status(500).send(e);
            // Push logs
            Logger.set(req, this.path, rs._id, 'update');
            return res.status(202).json(rs);
          },
        );
      } else {
        return res.status(500).send('invalid');
      }
    } catch (e) {
      return res.status(500).send('invalid');
    }
  };

  public patch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rs = { success: [] as string[], error: [] as string[] };
      for await (const _id of req.body._id) {
        const x = await MQuestion.findById(_id);
        if (x) {
          const _x = await MQuestion.updateOne({ _id }, { $set: { flag: x.flag === 1 ? 0 : 1 } });
          if (_x.nModified) {
            rs.success.push(_id);
            // Push logs
            Logger.set(req, this.path, _id, x.flag === 1 ? 'lock' : 'unlock');
          } else rs.error.push(_id);
        }
      }
      return res.status(203).json(rs);
    } catch (e) {
      return res.status(500).send('invalid');
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (Types.ObjectId.isValid(req.params._id)) {
        MQuestion.deleteOne({ _id: req.params._id }, (e: any) => {
          if (e) return res.status(500).send(e);
          // Push logs
          Logger.set(req, this.path, req.params._id, 'delete');
          return res.status(204).json(true);
        });
      } else {
        return res.status(500).send('invalid');
      }
    } catch (e) {
      return res.status(500).send('invalid');
    }
  };
}
export default new QuestionsController();
