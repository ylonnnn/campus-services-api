import { AppRouter } from "../../ExpressApp";

import { UserRouter } from "./users";

AppRouter.use("/users", UserRouter);
