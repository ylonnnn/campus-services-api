import { SISRouter } from "../router";
import { ProgramRouter } from "./router";

SISRouter.use("/programs", ProgramRouter);
