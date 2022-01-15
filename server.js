const http = require('http'),
  url = require('url'),
  fs = require('fs');

http.createServer((request, response) => {
  let addr = request.url,
    q = url.parse(addr, true),
    filepath = '';

  fs.appendFile('log.txt', 'Requested URL: ' + addr + ', Timestamp: ' + new Date() + '\n\n', (err) => {
    if (err) {
      console.log (err);
    } else {
      console.log('Log Success')
    }
  })

  if (q.pathname.includes('documentation')) {
    filePath = 'documentation.html';
  } else {
    filePath = 'index.html';
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      throw err;
    }

    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.write(data);
    response.end();
  });

}).listen(8080);

console.log('My test server is running on Port 8080');
