import express from "express"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import authorsRoutes from "./authors/index.js"

const server = express()

const port = 3001

server.use(express.json())
server.use(cors())

server.use("/authors", authorsRoutes)

console.table(listEndpoints(server))

server.listen(port, () => {
  console.log("Server listening on port ", port)
})
