import { AppRouter } from "../../ExpressApp";

import { AuthRouter } from "./router";

AppRouter.use("/auth", AuthRouter);
