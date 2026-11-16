const express = require('express')
const fs = require('fs')
const path = require('path')
const https = require('https')

const app = express()
const PORT = 3005

// 允许同目录页面跨域读取数据
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*')
  next()
})

// 接口：返回 db.json 中的 poems 数组
app.get('/api/poems', (req, res) => {
  const filePath = path.join(__dirname, 'db.json')
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('读 db.json 出错：', err)
      return res.status(500).json({ msg: '读取数据失败' })
    }
    try {
      const json = JSON.parse(data)
      res.json(json.poems)
    } catch (parseErr) {
      console.error('JSON 解析错误：', parseErr)
      res.status(500).json({ msg: 'db.json 格式错误' })
    }
  })
})

// 图片代理：gitee 对外链有防盗链，服务端带上合法 Referer 取回图片再转发给页面
app.get('/img/:name', (req, res) => {
  const name = req.params.name
  if (!/^[\w.-]+$/.test(name)) {
    return res.status(400).send('图片名不合法')
  }
  const target = 'https://gitee.com/wangyao_jsj/project2024_01/raw/master/img/' + name

  // gitee 的 raw 地址会 302 跳到真实文件，需要手动跟随重定向
  function follow(url, hops) {
    const lib = url.startsWith('https:') ? https : require('http')
    lib.get(url, {
      headers: { 'Referer': 'https://gitee.com/', 'User-Agent': 'Mozilla/5.0' }
    }, (up) => {
      const redirect = [301, 302, 303, 307, 308].indexOf(up.statusCode) > -1
      if (redirect && up.headers.location && hops < 4) {
        up.resume()
        const next = new URL(up.headers.location, url).href
        return follow(next, hops + 1)
      }
      if (up.statusCode !== 200) {
        console.error('图片获取失败：', url, up.statusCode)
        res.status(up.statusCode).end()
        return
      }
      res.set('Content-Type', up.headers['content-type'] || 'image/jpeg')
      res.set('Cache-Control', 'public, max-age=86400')
      up.pipe(res)
    }).on('error', (err) => {
      console.error('图片请求出错：', err.message)
      res.status(502).send('图片获取失败')
    })
  }

  follow(target, 0)
})

// 一并托管上一级目录，这样 http://localhost:3005/poems.html 也能直接打开
app.use(express.static(path.join(__dirname, '..')))

const server = app.listen(PORT, () => {
  console.log(`数据服务器已启动：http://localhost:${PORT}/api/poems`)
  console.log(`页面地址：http://localhost:${PORT}/poems.html`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`端口 ${PORT} 已被占用，请先关闭占用该端口的程序`)
  } else {
    console.error('启动服务失败：', err)
  }
})
