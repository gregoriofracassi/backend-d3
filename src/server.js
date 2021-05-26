import express from "express"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import authorsRoutes from "./authors/index.js"
import { join } from "path"
import postsRoutes from "./blogPosts/index.js"
import filesRoutes from "./files/index.js"
import { getCurrentFolderPath } from "./lib/fs-tools.js"
import {
  badRequestErrorHandler,
  notFoundErrorHandler,
  forbiddenErrorHandler,
  catchAllErrorHandler,
} from "./errorHandlers.js"

const server = express()

const port = process.env.PORT || 3001

const corsOptions = {
  origin: function (origin, next) {
    if (whitelist.includes(origin)) {
      next(null, true)
    } else {
      next(new Error("Origin is not supported!"))
    }
  },
}

const whitelist = [process.env.FRONTEND_DEV_URL, process.env.FRONTEND_CLOUD_URL]

const publicFolderPath = join(
  getCurrentFolderPath(import.meta.url),
  "../public"
)

// *********MIDDLEWARES*********
server.use(express.static(publicFolderPath))
server.use(express.json())
server.use(cors(corsOptions))

// ********ROUTES*********
server.use("/authors", authorsRoutes)
server.use("/posts", postsRoutes)

// ********ERROR MIDDLEWARES**********
server.use(badRequestErrorHandler)
server.use(notFoundErrorHandler)
server.use(forbiddenErrorHandler)
server.use(catchAllErrorHandler)

console.table(listEndpoints(server))

server.listen(port, () => {
  console.log("Server listening on port ", port)
})
