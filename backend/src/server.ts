import app from "./app";
import { ensureAdmin } from "./modules/auth/auth.service";
import "dotenv/config";

const env = {
  PORT: process.env.PORT ?? "3002",
};

(async () => {
  await ensureAdmin(); // ensures the default admin user exists

  app.listen(Number(env.PORT), () => {
    console.log(`🚀 Backend running on port ${env.PORT}`);
  });
})();