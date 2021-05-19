import express from "express"
import fs from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import uniqid from "uniqid"
import { bodyValidator } from "./validation.js"
import { validationResult } from "express-validator"
import createError from "http-errors"

const postsJsonPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "blogPosts.json"
)

const getPosts = () => {
  const content = fs.readFileSync(postsJsonPath)
  return JSON.parse(content) // I'm getting back the actual array
}

const writePosts = (content) =>
  fs.writeFileSync(postsJsonPath, JSON.stringify(content))

const postsRouter = express.Router()

postsRouter.get("/", (req, res, next) => {
  try {
    const posts = getPosts()
    if (req.query.name) {
      const filteredPosts = books.filter(
        (book) => book.hasOwnProperty("title") && book.title === req.query.title
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

postsRouter.get("/:postId", (req, res, next) => {
  try {
    const posts = getPosts()
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

postsRouter.post("/", bodyValidator, (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      next(createError(400, { errorList: errors }))
    } else {
      const posts = getPosts()
      const newPost = { ...req.body, _id: uniqid(), createdAt: new Date() }
      posts.push(newPost)
      writePosts(posts)

      res.status(201).send({ id: newPost._id })
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

postsRouter.put("/:postId", (req, res, next) => {
  try {
    const posts = getPosts()
    const remainingPosts = posts.filter((p) => p._id !== req.params.postId)

    const modifiedPost = {
      ...req.body,
      _id: req.params.postId,
      modifiedAt: new Date(),
    }

    remainingPosts.push(modifiedPost)
    writePosts(remainingPosts)
    res.send(modifiedPost)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

postsRouter.delete("/:postId", (req, res, next) => {
  try {
    const posts = getPosts()
    const remainingPosts = posts.filter((p) => p._id !== req.params.postId)

    writePosts(remainingPosts)
    res.status(204).send()
  } catch (error) {
    console.log(error)
    next(error)
  }
})

export default postsRouter
