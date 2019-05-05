'use strict'

const path = require('path')
const express = require('express')
const Listener = require('./lib/listener')

function createApp(params = {}) {
  const app = express()
  const listener = new Listener(params)
  
  app.use(express.urlencoded({ extended: false }))
  app.get('/*', (req, res, next) => {
    listener.get(req, res, next)
  })

  return app
}

function loadConfig() {
  const configPath = process.argv.pop()
  const configFileName = path.resolve(__dirname, configPath)
  return require(configFileName)
}

if (module.parent) {
  module.exports = createApp
} else {
  let params
  try {
    params = loadConfig()
  } catch (err) {
    console.error(err)
    return
  }

  const app = createApp(params)
  app.listen(params.port || 8080, () => {
    console.info('Server started')
  })
}
