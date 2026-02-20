import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { can } from "../../middlewares/can";
import { createUserSchema, listUsersQuerySchema } from "./users.schemas";
import { createUser, listUsers } from "./users.service";

export const usersRouter = Router();

usersRouter.use(requireAuth);

// Admin only
usersRouter.post("/", can("create", "users"), async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  const user = await createUser(parsed.data);
  res.status(201).json(user);
});

usersRouter.get("/", can("read", "users"), async (req, res) => {
  const parsed = listUsersQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ message: "Invalid query", errors: parsed.error.flatten() });

  const data = await listUsers(parsed.data.role);
  res.json(data);
});
