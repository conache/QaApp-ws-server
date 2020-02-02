const express = require('express');
const http = require('http');
var app = express();
var socketHandler = require('./socketHandler');
var sqsConsumer = require('./sqsConsumer');
const port = 8080;

const server = http.createServer(app);

server.listen(port);
server.on('listening', () => {
    console.log( `Started listening on port ${port}`);
})


// -- SQS Consumer

sqsConsumer.init();

// -- sockets

socketHandler.init(server);