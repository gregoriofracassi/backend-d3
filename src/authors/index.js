import express from "express"
import fs from "fs"
import uniqid from "uniqid"
import createError from "http-errors"
import { getAuthors, writeAuthors } from "../lib/fs-tools.js"
import multer from "multer"
import { writeAuthorImg, writePostCover } from "../lib/fs-tools.js"

const authorRouter = express.Router()

authorRouter.get("/", async (req, res, next) => {
  try {
    const authors = await getAuthors()
    res.send(authors)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

authorRouter.post("/", async (req, res, next) => {
  try {
    const authors = await getAuthors()
    const newAuthor = { ...req.body, _id: uniqid(), createdAt: new Date() }
    authors.push(newAuthor)
    await writeAuthors(authors)

    res.status(201).send({ _id: newAuthor._id })
  } catch (error) {
    console.log(error)
    next(error)
  }
})

authorRouter.get("/:id", async (req, res, next) => {
  try {
    const authors = await getAuthors()
    const author = authors.find((a) => a._id === req.params.id)
    if (author) {
      res.send(author)
    } else {
      next(createError(404, "Author with this id not found"))
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

authorRouter.put("/:id", async (req, res, next) => {
  try {
    const authors = await getAuthors()
    const remainAuthors = authors.filter((a) => a._id !== req.params.id)

    const modifiedAuthor = {
      ...req.body,
      _id: req.params.id,
      modifiedAt: new Date(),
    }
    remainAuthors.push(modifiedAuthor)
    await writeAuthors(remainAuthors)
    res.send(modifiedAuthor)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

authorRouter.delete("/:id", async (req, res, next) => {
  try {
    const authors = await getAuthors()
    const remainAuthors = authors.filter((a) => a._id !== req.params.id)

    await writeAuthors(remainAuthors)
    res.status(204).send(remainAuthors)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

authorRouter.post(
  "/:id/uploadAvatar",
  multer().single("avatar"),
  async (req, res, next) => {
    try {
      console.log("trying to upload")
      const authors = await getAuthors()
      const author = authors.find((a) => a._id === req.params.id)
      await writeAuthorImg(req.file.originalname, req.file.buffer)
      author.img = `http://localhost:3001/img/authors/${req.file.originalname}`
      const remainAuthors = authors.filter((a) => a._id !== req.params.id)
      remainAuthors.push(author)
      await writeAuthors(remainAuthors)
      res.send()
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
)

export default authorRouter
