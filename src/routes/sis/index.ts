import { AppRouter } from "../../ExpressApp";

import { SISRouter } from "./router";

AppRouter.use("/sis", SISRouter);

import "./courses";
import "./programs";
import "./students";
