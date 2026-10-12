const http = require('http');

let counterHome = 0;
let counterAbout = 0;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (req.url === '/') {
    counterHome++;
    res.statusCode = 200;
    res.end(`
      <h1>Главная страница</h1>
      <p>Просмотров: ${counterHome}</p>
      <a href="/about">Перейти на страницу About</a>
    `);
  } else if (req.url === '/about') {
    counterAbout++;
    res.statusCode = 200;
    res.end(`
      <h1>Страница About</h1>
      <p>Просмотров: ${counterAbout}</p>
      <a href="/">Перейти на главную</a>
    `);
  } else {
    res.statusCode = 404;
    res.end(`
      <h1>404 — Страница не найдена</h1>
      <a href="/">Вернуться на главную</a>
    `);
  }
});

server.listen(3000, () => {
  console.log('Сервер запущен на http://localhost:3000');
});
