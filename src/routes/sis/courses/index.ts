import { SISRouter } from "../router";
import { CourseRouter } from "./router";

SISRouter.use("/courses", CourseRouter);
