import dotenv from "dotenv";
import path from "path";

import app from "./ExpressApp";

dotenv.config();

const PORT = process.env.PORT! || 4000;

import "./routes";

app.get("/", (_, res) => {
    res.sendFile(path.resolve("src/test/index.html"));
});

app.listen(PORT, (err) => {
    if (err) console.log(`An error ocurred: ${err}`);
    else console.log(`Listening on port: ${PORT}`);
});
