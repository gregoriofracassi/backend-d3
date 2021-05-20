import express from "express"
import { writeAuthorImg, writePostCover } from "../lib/fs-tools.js"
import multer from "multer"

const filesRouter = express.Router()

filesRouter.post(
  "/userImg/upload",
  multer().single("avatar"),
  async (req, res, next) => {
    try {
      console.log("trying to upload")
      await writeAuthorImg(req.file.originalname, req.file.buffer)
      res.send()
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
)

filesRouter.post(
  "/postCover/upload",
  multer().single("cover"),
  async (req, res, next) => {
    try {
      console.log("req.file.originalname")
      await writePostCover(req.file.originalname, req.file.buffer)
      res.send()
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
)

export default filesRouter
