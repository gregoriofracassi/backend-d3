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
import PostModel from "./schema.js"

const postsRouter = express.Router()

postsRouter.get("/", async (req, res, next) => {
  try {
    const posts = await PostModel.find()
    res.send(posts)
  } catch (error) {
    console.log(error)
    next(createError(500, "An error occurred while getting post"))
  }
})

postsRouter.post("/", async (req, res, next) => {
  try {
    const newPost = new PostModel(req.body)
    const response = await newPost.save()
    res.status(201).send(response._id)
  } catch (error) {
    console.log(error)
    if (error.name === "ValidationError") {
      next(createError(400, error))
    } else {
      next(createError(500, error))
    }
  }
})

postsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id
    const post = await PostModel.findById(id)
    if (post) {
      res.send(post)
    } else {
      next(createError(404, `Post ${req.params.id} not found`))
    }
  } catch (error) {
    console.log(error)
    next(createError(500, "An error occurred while getting post"))
  }
})

postsRouter.put("/:id", async (req, res, next) => {
  try {
    const post = await PostModel.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    })
    if (post) {
      res.send(post)
    } else {
      next(createError(404, `Post ${req.params.id} not found`))
    }
  } catch (error) {
    console.log(error)
    next(createError(500, "An error occurred while modifying post"))
  }
})

postsRouter.delete("/:id", async (req, res, next) => {
  try {
    const post = await PostModel.findByIdAndDelete(req.params.id)
    if (post) {
      res.status(204).send(`Succesfully deleted post ${req.params.id}`)
    } else {
      next(createError(404, `Post ${req.params.id} not found`))
    }
  } catch (error) {
    console.log(error)
    next(createError(500, "An error occurred while deleting the post"))
  }
})

// postsRouter.post("/:id/comments", async (req, res, next) => {
//   try {
//     const posts = await getPosts()
//     const post = posts.find((p) => p._id === req.params.id)
//     const comments = post.comments
//     const newComment = { ...req.body, createdAt: new Date() }
//     comments.push(newComment)
//     const remainPosts = posts.filter((p) => p._id !== req.params.id)
//     post.comments = comments
//     remainPosts.push(post)
//     await writePosts(remainPosts)

//     res.send(remainPosts)
//   } catch (error) {
//     console.log(error)
//     next(error)
//   }
// })

// postsRouter.post("/", bodyValidator, async (req, res, next) => {
//   try {
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//       next(createError(400, { errorList: errors }))
//     } else {
//       const posts = await getPosts()
//       const newPost = {
//         ...req.body,
//         _id: uniqid(),
//         createdAt: new Date(),
//         comments: [],
//       }
//       posts.push(newPost)
//       await writePosts(posts)

//       res.status(201).send({ id: newPost._id })
//     }
//   } catch (error) {
//     console.log(error)
//     next(error)
//   }
// })

// postsRouter.get("/:id/comments", async (req, res, next) => {
//   try {
//     const posts = await getPosts()
//     const post = posts.find((p) => p._id === req.params.id)

//     res.send(post.comments)
//   } catch (error) {
//     console.log(error)
//     next(error)
//   }
// })

// postsRouter.post(
//   "/:id/uploadCover",
//   multer().single("cover"),
//   async (req, res, next) => {
//     try {
//       console.log("trying to upload")
//       const posts = await getPosts()
//       const post = posts.find((p) => p._id === req.params.id)
//       await writePostCover(req.file.originalname, req.file.buffer)
//       post.cover = `http://localhost:3001/img/postCover/${req.file.originalname}`
//       const remainPosts = posts.filter((p) => p._id !== req.params.id)
//       remainPosts.push(post)
//       await writePosts(remainPosts)
//       res.send()
//     } catch (error) {
//       console.log(error)
//       next(error)
//     }
//   }
// )

// postsRouter.get("/:id/pdfDownload", async (req, res, next) => {
//   const posts = await getPosts()
//   const post = posts.find((p) => p._id === req.params.id)
//   try {
//     const source = generatePDFStream(post)
//     const destination = res
//     res.setHeader("Content-Disposition", "attachment; filename=export.pdf")
//     pipeline(source, destination, (err) => next(err))
//   } catch (error) {
//     next(error)
//   }
// })

export default postsRouter
