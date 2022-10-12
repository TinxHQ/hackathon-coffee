const http = require('http');
const fs = require('fs').promises;
const PORT = 8080;

const requestListener = function (req, res) {
  fs.readFile(__dirname + "/routes.html")
    .then(contents => {
      res.setHeader("Content-Type", "text/html");
      res.writeHead(200);
      res.end(contents);
    })
}

const server = http.createServer(requestListener);
server.listen(PORT);
console.log(`HTTP Server running on port ${PORT}`);
