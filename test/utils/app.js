import bodyParser from 'body-parser'
import express from 'express'

export default function() {
  const app = express()
  app.use(bodyParser.json())
  return app
}
