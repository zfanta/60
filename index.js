const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const Router = require('@koa/router')
const path = require('path')
const filenamify = require('filenamify')
const iconvLite = require('iconv-lite')

const app = new Koa()
const router = new Router()

let request
let timer

router.post('/', ctx => {
  request = ctx.request.body

  timer = setTimeout(() => {
    request = undefined
  }, 60 * 1000)

  ctx.status = 201
})

router.get('/', ctx => {
  if (request === undefined) {
    ctx.status = 404
    return
  }

  const data = Buffer.from(request.data, 'base64')

  const extname = path.extname(request.filename)
  const filename = iconvLite.decode(
    iconvLite.encode(filenamify(request.filename), 'UTF-8'),
    'ISO-8859-1'
  )

  let body = data
  if (extname === '.txt') {
    body = `<html><body><pre>${data}</pre></body></html>`
  } else {
    ctx.set('Content-Disposition', `inline; filename="${filename}"`)
  }

  ctx.body = body

  request = undefined
  clearTimeout(timer)
})

app.use(bodyParser({
  jsonLimit: '100mb',
}))
app.use(router.routes()).use(router.allowedMethods())

app.listen(3001)
