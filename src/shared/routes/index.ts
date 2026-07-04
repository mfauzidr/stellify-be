import { Router } from "express";

import idolGroupsRouter from "../../modules/idol_groups/idol_groups.router";

import { globalErrorHandler } from "../../middlewares/error.middlwware";
import { requestLogger } from "../../middlewares/requestLogger.middleware";

const router = Router();

router.use("/idol-groups", idolGroupsRouter);

router.use(requestLogger);
router.use(globalErrorHandler);

export default router;
