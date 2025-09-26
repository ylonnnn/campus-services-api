import { AppRouter } from "../../ExpressApp";

import { UserRouter } from "./router";

AppRouter.use("/users", UserRouter);
