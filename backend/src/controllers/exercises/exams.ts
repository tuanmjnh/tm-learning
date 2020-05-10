import moment from 'moment';
import Logger from '../../services/logger';
import Pagination from '../../utils/pagination';
import { Types, startSession } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { getIp, getUserAgent } from '../../utils/request';
import { MExams } from '../../models/exercises/exams';
import { MExercises } from '../../models/exercises';
import { MQuestion } from '../../models/questions';
import { MUser } from '../../models/users';

class ExamsController {
  public path = 'exams';
  public get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conditions = {} as any;
      if (req.query.filter) conditions.$text = { $search: req.query.filter };
      if (req.query.flag) conditions.flag = parseInt(req.query.flag.toString());
      conditions.$expr = {
        $and: [{ $eq: ['$exercise', req.query.exercise] }, { $eq: ['$startBy', req.verify._id] }],
      };
      const countDocuments = await MExams.where(conditions as any).countDocuments();
      const qry = MExams.aggregate([
        { $match: conditions },
        {
          $sort: {
            [(req.query.sortBy as string) || 'startAt']: -1,
          } as any,
        },
      ]);
      const page = parseInt(req.query.page as string);
      const rowsPerPage = parseInt(req.query.rowsPerPage as string);
      if (page && rowsPerPage) qry.skip((page - 1) * rowsPerPage).limit(rowsPerPage);
      const rs = await qry.exec();
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
          MExams.findById(req.query._id, (e, rs) => {
            if (e) return res.status(500).send(e);
            return res.status(200).json(rs);
          });
        } else {
          return res.status(500).send('invalid');
        }
      }
    } catch (e) {
      return res.status(500).send('invalid');
    }
  };

  public exist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      MExams.findOne(req.query, (e, rs) => {
        if (e) return res.status(200).json(null);
        return res.status(200).json(rs);
      });
    } catch (e) {
      return res.status(200).json(null);
    }
  };

  public getAttr = async (req: Request, res: Response, next: NextFunction) => {
    try {
      MExams.distinct(req.query.key ? 'attr.key' : 'attr.value', null, (e, rs) => {
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

  public getExercies = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conditions = {} as any;
      if (req.query.filter) conditions.$text = { $search: req.query.filter };
      conditions.flag = 1;
      const dateNow = moment().toISOString();
      conditions.startAt = { $lt: dateNow };
      conditions.endAt = { $gte: dateNow };
      conditions.users = { $in: req.verify.code };
      const countDocuments = await MExercises.where(conditions as any).countDocuments();
      const qry = MExercises.aggregate([
        { $match: conditions },
        // get type of exercises
        {
          $lookup: {
            from: 'types',
            let: { qtype: { $toString: '$type' } },
            as: 'types',
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$key', 'exercises_type'] }, { $eq: ['$code', '$$qtype'] }],
                  },
                },
              },
              { $project: { _id: 0, typeName: '$name' } },
            ],
          },
        },
        // get total test
        {
          $lookup: {
            from: 'exams',
            // localField: '_id',
            // foreignField: 'exercise',
            as: 'exams',
            let: { id: { $toString: '$_id' } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$exercise', '$$id'] }, { $eq: ['$startBy', req.verify._id] }],
                  },
                },
              },
              { $project: { _id: 1, result: 1 } },
            ],
          },
        },
        // get eligible
        // {
        //   $lookup: {
        //     from: 'exams',
        //     as: 'eligibleExams',
        //     let: { id: { $toString: '$_id' } },
        //     pipeline: [
        //       {
        //         $match: {
        //           $expr: {
        //             $and: [
        //               { $eq: ['$exercise', '$$id'] },
        //               { $eq: ['$startBy', req.verify._id] },
        //               { $eq: ['$result', 1] },
        //             ],
        //           },
        //         },
        //       },
        //       { $project: { _id: 1 } },
        //     ],
        //   },
        // },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                { $arrayElemAt: ['$types', 0] },
                // { $arrayElemAt: ['$eligibleExams', 0] },
                '$$ROOT',
              ],
            },
          },
        },
        {
          $addFields: {
            numberLeft: { $subtract: ['$numberTest', { $size: '$exams' }] },
          },
        },
        {
          $project: {
            types: 0,
            users: 0,
            questions: 0,
            // exams: 0,
            // correct: 0,
            // point: 0,
            // answerType: {$size: '$correct'}
          },
        },
        {
          $sort: {
            [(req.query.sortBy as string) || 'startAt']: -1,
          } as any,
        },
      ]);
      const page = parseInt(req.query.page as string);
      const rowsPerPage = parseInt(req.query.rowsPerPage as string);
      if (page && rowsPerPage) qry.skip((page - 1) * rowsPerPage).limit(rowsPerPage);
      const rs = await qry.exec();
      return res.status(200).json({ rowsNumber: countDocuments, data: rs });
    } catch (e) {
      console.log(e);
      return res.status(500).send('invalid');
    }
  };

  public getQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.query.key) return res.status(500).send('invalid');
      const exercise = await MExercises.findById({ _id: req.query.key }, 'questions');
      if (!exercise) return res.status(500).send('invalid');
      const conditions = {
        // key: req.query.key,
        _id: { $in: exercise.questions },
      };
      const countDocuments = await MQuestion.where(conditions as any).countDocuments();
      const qry = MQuestion.aggregate([
        { $match: conditions },
        {
          $addFields: {
            correctLength: { $size: '$correct' },
            answersSelect: null,
          },
        },
        {
          $project: {
            types: 0,
            correct: 0,
            point: 0,
          },
        },
        {
          $sort: {
            [(req.query.sortBy as string) || 'orders']: req.query.descending === 'true' ? -1 : 1,
          } as any,
        },
      ]);
      const page = parseInt(req.query.page as string);
      const rowsPerPage = parseInt(req.query.rowsPerPage as string);
      if (page && rowsPerPage) qry.skip((page - 1) * rowsPerPage).limit(rowsPerPage);
      const rs = await qry.exec();
      return res.status(200).json({ rowsNumber: countDocuments, data: rs });
    } catch (e) {
      console.log(e);
      return res.status(500).send('invalid');
    }
  };

  public getReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.query.key) return res.status(500).send('invalid');
      const exercise = await MExercises.findById({ _id: req.query.key }, 'users');
      if (!exercise) return res.status(500).send('invalid');
      // const users = await MUser.find({ username: { $in: exercise.users } } as any);
      // console.log(users);
      // return res.status(200).json([]);
      const conditions = { username: { $in: exercise.users } };
      const countDocuments = await MUser.where(conditions as any).countDocuments();
      const qry = MUser.aggregate([
        { $match: conditions },
        {
          $project: {
            types: 0,
          },
        },
        {
          $lookup: {
            from: 'exams',
            as: 'exams',
            let: { id: { $toString: '$_id' } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$startBy', '$$id'] }],
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  startAt: 1,
                  endAt: 1,
                  totalQuestion: 1,
                  totalCorrect: 1,
                  totalWrong: 1,
                  result: 1,
                  flag: 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            _id: 0,
            username: 1,
            fullName: 1,
            gender: 1,
            avatar: 1,
            address: 1,
            dateBirth: 1,
            email: 1,
            personNumber: 1,
            exams: 1,
          },
        },
        {
          $sort: {
            [(req.query.sortBy as string) || 'username']: req.query.descending === 'true' ? -1 : 1,
          } as any,
        },
      ]);
      const page = parseInt(req.query.page as string);
      const rowsPerPage = parseInt(req.query.rowsPerPage as string);
      if (page && rowsPerPage) qry.skip((page - 1) * rowsPerPage).limit(rowsPerPage);
      const rs = await qry.exec();
      return res.status(200).json({ rowsNumber: countDocuments, data: rs });
    } catch (e) {
      console.log(e);
      return res.status(500).send('invalid');
    }
  };

  public post = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body || !Object.keys(req.body).length) {
        return res.status(500).send('invalid');
      }
      const questions = await MQuestion.find({ key: req.body.exercise }).countDocuments();
      const data = new MExams({
        startAt: new Date(),
        // endAt: ,
        startBy: req.verify._id,
        startIp: getIp(req),
        // userAgent: getUserAgent(req),
        exercise: req.body.exercise,
        totalQuestion: questions,
        selected: null,
        // totalCorrect: { type: Number, default: 0 },
        // totalWrong: { type: Number, default: 0 },
        flag: 1,
      });
      data.save((e, rs) => {
        if (e) return res.status(500).send(e);
        // Push logs
        Logger.set(req, this.path, rs._id, 'insert');
        return res.status(200).json(rs);
      });
    } catch (e) {
      console.log(e);
      return res.status(500).send('invalid');
    }
  };

  public put = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // if (!req.params.id) return res.status(500).send('Incorrect Id!')
      if (!req.body || !Object.keys(req.body).length) return res.status(500).send('invalid');
      const exam = await MExams.findById(req.body._id);
      if (!exam) return res.status(500).send('invalid');
      const exercise = await MExercises.findById(exam.exercise);
      if (!exercise) return res.status(500).send('invalid');
      const questions = await MQuestion.find({ key: exam.exercise });
      for await (const e of questions) {
        const item = req.body.questions.find((x) => x._id.toString() === e._id.toString());
        if (item) {
          if (!Array.isArray(item.answers)) item.answers = [item.answers];
          item.correct = e.correct;
          if (item.answers.sort().toString() === e.correct.sort().toString()) {
            exam.totalCorrect++;
          } else {
            exam.totalWrong++;
          }
        }
      }
      exam.endAt = new Date();
      exam.questions = req.body.questions;
      exam.result = exam.totalCorrect >= exercise.eligible ? 1 : 0;
      exam.flag = 2;
      const rs = await MExams.updateOne(
        { _id: req.body._id },
        {
          $set: {
            endAt: exam.endAt,
            totalCorrect: exam.totalCorrect,
            totalWrong: exam.totalWrong,
            questions: exam.questions,
            result: exam.result,
            flag: exam.flag,
          },
        },
      );
      // Push logs
      Logger.set(req, this.path, rs._id, 'update');
      if (!rs) return res.status(500).send('invalid');
      return res.status(200).json(exam);
    } catch (e) {
      return res.status(500).send('invalid');
    }
  };

  public patch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rs = { success: [] as string[], error: [] as string[] };
      for await (const _id of req.body._id) {
        const x = await MExams.findById(_id);
        if (x) {
          const _x = await MExams.updateOne({ _id }, { $set: { flag: x.flag === 1 ? 0 : 1 } });
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
        MExams.deleteOne({ _id: req.params._id }, (e: any) => {
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
export default new ExamsController();
