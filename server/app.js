const path = require('path');
const express = require('express');
const ejs = require('ejs');
// const createProxyMiddleware = require("http-proxy-middleware");
const app = express();
const port = 3001;

app.use('/',express.static(path.join(__dirname, 'dist'), { index: false }));

ejs.delimiter = '$';
app.engine('html', ejs.__express);
app.set('views', path.join(__dirname, 'dist'));
app.set('view engine', 'html');



app.get('/', function (req, res) {
  res.render('index', { title: 'Hey', message: 'Hello there!' })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
