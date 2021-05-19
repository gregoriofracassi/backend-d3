import express from "express"
import fs from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import uniqid from "uniqid"

const authorRouter = express.Router()

const filePath = fileURLToPath(import.meta.url)
const currentFolderPath = dirname(filePath)
const authorsJSONPath = join(currentFolderPath, "authors.json")

const parentFolder = dirname(currentFolderPath)
const blogPostsfolder = join(parentFolder, "blogPosts")
const blogPostJsonPath = join(blogPostsfolder, "blogPosts.json")

authorRouter.get("/", (req, res) => {
  const authorsBuffer = fs.readFileSync(authorsJSONPath)
  const authors = JSON.parse(authorsBuffer)
  res.send(authors)
})

authorRouter.post("/", (req, res) => {
  console.log(req.body)
  const newAuthor = { ...req.body, _id: uniqid() }
  const authors = JSON.parse(fs.readFileSync(authorsJSONPath))
  authors.push(newAuthor)
  fs.writeFileSync(authorsJSONPath, JSON.stringify(authors))
  res.status(201).send(newAuthor)
})

authorRouter.get("/:id", (req, res) => {
  const authors = JSON.parse(fs.readFileSync(authorsJSONPath))
  const author = authors.find((a) => a._id === req.params.id)
  res.send(author)
})

authorRouter.get("/:id/blogPosts", (req, res) => {
  console.log("getting autor posts")
  const authors = JSON.parse(fs.readFileSync(authorsJSONPath))
  const posts = JSON.parse(fs.readFileSync(blogPostJsonPath))
  console.log(posts)
  const author = authors.find((a) => a._id === req.params.id)
  const filteredPosts = posts.filter((p) => p.author.name === author.name)
  res.send(filteredPosts)
})

authorRouter.put("/:id", (req, res) => {
  const authors = JSON.parse(fs.readFileSync(authorsJSONPath))
  const remainingAuthors = authors.filter(
    (author) => author._id !== req.params.id
  )
  console.log(authors)
  const updatedAuthor = { ...req.body, _id: req.params.id }
  remainingAuthors.push(updatedAuthor)
  fs.writeFileSync(authorsJSONPath, JSON.stringify(remainingAuthors))
  res.send(updatedAuthor)
})

authorRouter.delete("/:id", (req, res) => {
  const authors = JSON.parse(fs.readFileSync(authorsJSONPath))
  const remainingAuthors = authors.filter(
    (author) => author._id !== req.params.id
  )
  fs.writeFileSync(authorsJSONPath, JSON.stringify(remainingAuthors))
  res.status(204).send()
})

export default authorRouter
