'use strict'

const Content = require('./content')

class Listener {
  constructor(params) {
    this.content = new Content(params)
  }

  get(req, res, next) {
    const al = req.header('accept-language') || 'en'
    const lang = al.split(',').map(l => l.split(';')[0])
  
    this.content.resolve(req.path, lang)
    .then(result => {
      const { status = null,
              type = 'text/html;charset=UTF-8',
              location,
              content: body } = result
  
      if (location) {
        res.redirect(status || 302, location)
        return
      }
      
      res.status(status || 200).type(type).send(body)
    })
    .catch(next)
  }
}

module.exports = Listener
