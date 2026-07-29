import { Router, type IRouter } from "express";
import healthRouter from "./health";
import seaLevelAnomaliesRouter from "./sea-level-anomalies";

const router: IRouter = Router();

router.use(healthRouter);
router.use(seaLevelAnomaliesRouter);

export default router;
