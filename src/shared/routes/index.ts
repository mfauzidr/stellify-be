import { Router } from "express";

import idolGroupsRouter from "../../modules/idol_groups/idol_groups.router";
import membersRouter from "src/modules/members/members.router";

import { globalErrorHandler } from "../../middlewares/error.middlwware";
import { requestLogger } from "../../middlewares/requestLogger.middleware";
import eventsRouter from "src/modules/events/events.router";
import chekiRouter from "src/modules/cheki/cheki.router";

const router = Router();

router.use("/idol-groups", idolGroupsRouter);
router.use("/members", membersRouter);
router.use("/events", eventsRouter)
router.use("/cheki-packages", chekiRouter)

router.use(requestLogger);
router.use(globalErrorHandler);

export default router;
