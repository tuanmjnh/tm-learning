import { Router } from 'express';
import RoutesController from '../controllers/routes';
import UsersController from '../controllers/users';
import UserSettingController from '../controllers/users/settings';
import RolesController from '../controllers/roles';
import AuthController from '../controllers/auth';
import TypesController from '../controllers/types';
import FileManagerController from '../controllers/file-manager';
import CategoryController from '../controllers/categories';
import QuestionsController from '../controllers/questions';
import ExercisesController from '../controllers/exercises';
import ExamsController from '../controllers/exercises/exams';
import NewsController from '../controllers/news';
import ProductsController from '../controllers/products';
import ProductImportsController from '../controllers/warehouse/imports';
import ProductExportsController from '../controllers/warehouse/exports';
import ProductReportsController from '../controllers/warehouse/reports';
import TestController from '../controllers/test';
export class Routes {
  public router = Router();
  private mapRouter = (controller) => {
    const route = this.router.route(`/${controller.path}`);
    if (controller.get) route.get(controller.get);
    if (controller.post) route.post(controller.post);
    if (controller.put) route.put(controller.put);
    if (controller.patch) route.patch(controller.patch);
    if (controller.delete) route.delete(controller.delete);
    // Extras
    if (controller.find) this.router.route(`/${controller.path}/find`).get(controller.find);
    if (controller.exist) this.router.route(`/${controller.path}/exist`).get(controller.exist);
    if (controller.getKey) this.router.route(`/${controller.path}/get-key`).get(controller.getKey);
    if (controller.getMeta)
      this.router.route(`/${controller.path}/get-meta`).get(controller.getMeta);
    if (controller.import) this.router.route(`/${controller.path}/import`).post(controller.import);
    if (controller.updateOrder)
      this.router.route(`/${controller.path}/update-order`).put(controller.updateOrder);
    // Extras users
    if (controller.verified)
      this.router.route(`/${controller.path}/verified`).post(controller.verified);
    if (controller.resetPassword)
      this.router.route(`/${controller.path}/reset-password`).post(controller.resetPassword);
    if (controller.changePassword)
      this.router.route(`${controller.path}/change-password`).post(controller.changePassword);
  };
  constructor() {
    this.mapRouter(RoutesController);
    this.mapRouter(UsersController);
    this.router.route(`/${UsersController.path}/finds`).post(UsersController.finds);
    this.mapRouter(UserSettingController);
    this.mapRouter(RolesController);
    this.mapRouter(AuthController);
    this.mapRouter(TypesController);
    this.mapRouter(CategoryController);
    this.mapRouter(QuestionsController);
    this.mapRouter(ExercisesController);
    this.mapRouter(ExamsController);
    this.router.route(`/${ExamsController.path}/get-exercies`).get(ExamsController.getExercies);
    this.router.route(`/${ExamsController.path}/get-questions`).get(ExamsController.getQuestions);
    this.router.route(`/${ExamsController.path}/get-report`).get(ExamsController.getReport);
    this.mapRouter(NewsController);
    this.mapRouter(ProductsController);
    this.mapRouter(ProductImportsController);
    this.mapRouter(ProductExportsController);

    // FileManager Controller
    this.mapRouter(FileManagerController);
    this.router
      .route(`/${FileManagerController.path}/directories`)
      .get(FileManagerController.getDirectories);
    this.router.route(`/${FileManagerController.path}/files`).get(FileManagerController.getFiles);

    // ProductReports Controller
    this.router.route(`/${ProductReportsController.path}`).get(ProductReportsController.date);
    this.router
      .route(`/${ProductReportsController.path}/weekly`)
      .get(ProductReportsController.weekly);
    this.router.route(`${ProductReportsController.path}/month`).get(ProductReportsController.month);
    this.router
      .route(`/${ProductReportsController.path}/quarter`)
      .get(ProductReportsController.quarter);
    this.router.route(`${ProductReportsController.path}/year`).get(ProductReportsController.year);
    this.router
      .route(`/${ProductReportsController.path}/five-year`)
      .get(ProductReportsController.fiveYear);

    // Test Controller
    this.mapRouter(TestController);
  }
}
export default Routes;
