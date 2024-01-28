import express from "express";
import {
  getEdit,
  postEdit,
  logout,
  see,
  getChangePassword,
  postChangePassword,
  startGithubLogin,
  finishGithubLogin,
  startKakaoLogin,
  finishKakaoLogin,
} from "../controllers/userController";
import { avatarUpload, protectorMiddleware } from "../middlewares";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
userRouter
  .route("/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(avatarUpload.single("avatar"), postEdit);
userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);
userRouter.get("/github/start", startGithubLogin);
userRouter.get("/github/finish", finishGithubLogin);
userRouter.get("/kakaotalk/start", startKakaoLogin);
userRouter.get("/kakaotalk/finish", finishKakaoLogin);
userRouter.get("/:id([0-9a-f]{24})", see);

export default userRouter;
