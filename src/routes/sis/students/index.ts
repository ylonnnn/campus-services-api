import { SISRouter } from "../router";
import { StudentRouter } from "./router";

SISRouter.use("/students", StudentRouter);
