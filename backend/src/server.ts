import app from "./app";
import { ensureAdmin } from "./modules/auth/auth.service";
import { ensureSeed } from "./seed/ensureSeed";
import "dotenv/config";

const env = {
  PORT: process.env.PORT ?? "3002",
};

(async () => {
  await ensureAdmin();  // existing admin seeding
  await ensureSeed();   // ✅ new full seeding (only if DB empty)

  app.listen(Number(env.PORT), () => {
    console.log(`🚀 Backend running on port ${env.PORT}`);
  });
})();