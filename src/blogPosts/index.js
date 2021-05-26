import express from "express"
import uniqid from "uniqid"
import { bodyValidator } from "./validation.js"
import { validationResult } from "express-validator"
import createError from "http-errors"
import { getPosts, writePosts } from "../lib/fs-tools.js"
import multer from "multer"
import { writeAuthorImg, writePostCover } from "../lib/fs-tools.js"
import { generatePDFStream } from "../lib/pdf.js"
import { pipeline } from "stream"

const postsRouter = express.Router()

postsRouter.get("/", async (req, res, next) => {
  try {
    const posts = await getPosts()
    if (req.query.title) {
      //try to validate params and get req with them
      const filteredPosts = posts.filter(
        (post) => post.hasOwnProperty("title") && post.title === req.query.title
      )
      res.send(filteredPosts)
    } else {
      res.send(posts)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

postsRouter.get("/:postId", async (req, res, next) => {
  try {
    const posts = await getPosts()
    const post = posts.find((p) => p._id === req.params.postId)
    if (post) {
      res.send(post)
    } else {
      next(createError(404, "Post with this id doesnt exist!"))
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

postsRouter.post("/", bodyValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      next(createError(400, { errorList: errors }))
    } else {
      const posts = await getPosts()
      const newPost = {
        ...req.body,
        _id: uniqid(),
        createdAt: new Date(),
        comments: [],
      }
      posts.push(newPost)
      await writePosts(posts)

      res.status(201).send({ id: newPost._id })
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

postsRouter.put("/:postId", bodyValidator, async (req, res, next) => {
  try {
    const posts = await getPosts()
    const remainingPosts = posts.filter((p) => p._id !== req.params.postId)

    const modifiedPost = {
      ...req.body,
      _id: req.params.postId,
      modifiedAt: new Date(),
    }

    remainingPosts.push(modifiedPost)
    await writePosts(remainingPosts)
    res.send(modifiedPost)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

postsRouter.delete("/:postId", async (req, res, next) => {
  try {
    const posts = await getPosts()
    const remainingPosts = posts.filter((p) => p._id !== req.params.postId)

    await writePosts(remainingPosts)
    res.status(204).send(remainingPosts)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

postsRouter.post("/:id/comments", async (req, res, next) => {
  try {
    const posts = await getPosts()
    const post = posts.find((p) => p._id === req.params.id)
    const comments = post.comments
    const newComment = { ...req.body, createdAt: new Date() }
    comments.push(newComment)
    const remainPosts = posts.filter((p) => p._id !== req.params.id)
    post.comments = comments
    remainPosts.push(post)
    await writePosts(remainPosts)

    res.send(remainPosts)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

postsRouter.get("/:id/comments", async (req, res, next) => {
  try {
    const posts = await getPosts()
    const post = posts.find((p) => p._id === req.params.id)

    res.send(post.comments)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

postsRouter.post(
  "/:id/uploadCover",
  multer().single("cover"),
  async (req, res, next) => {
    try {
      console.log("trying to upload")
      const posts = await getPosts()
      const post = posts.find((p) => p._id === req.params.id)
      await writePostCover(req.file.originalname, req.file.buffer)
      post.cover = `http://localhost:3001/img/postCover/${req.file.originalname}`
      const remainPosts = posts.filter((p) => p._id !== req.params.id)
      remainPosts.push(post)
      await writePosts(remainPosts)
      res.send()
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
)

postsRouter.get("/:id/pdfDownload", async (req, res, next) => {
  try {
    const source = generatePDFStream("pollo")
    const destination = res
    res.setHeader("Content-Disposition", "attachment; filename=export.pdf")
    pipeline(source, destination, (err) => next(err))
  } catch (error) {
    next(error)
  }
})

export default postsRouter
