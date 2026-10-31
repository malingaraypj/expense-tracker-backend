require("module-alias/register");

const config = require("@/config/env");
const connectDB = require("@/config/db");
const app = require("@/app");

// Connect to Database
connectDB();

app.listen(config.port, () => {
  console.log(
    `Server running in ${config.nodeEnv} mode on port ${config.port}`,
  );
});
