import { AppRouter } from "../../ExpressApp";

import { AuthRouter } from "./auth";

AppRouter.use("/auth", AuthRouter);
