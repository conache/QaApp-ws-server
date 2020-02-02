var jwt = require('jsonwebtoken');
var socketIO = require('socket.io');
var fs = require('fs');

var io = null;
var socketObjects = {}

init = function (server) {
  io = socketIO.listen(server);

  io.on('connection', (socket) => {
    io.use(authorize);
  });
}

authorize = function ( socket, next ){
  if( !socket.handshake.query.token ){
    socket.disconnect('unauthorized');
  }
  token = socket.handshake.query.token
  const cert_pub = fs.readFileSync(__dirname + '/secrets/jwt-rsa-public.pem');

  jwt.verify(token, cert_pub, { algorithms: ['RS256']}, function(err, decoded) {           
      if (err) {
        socket.disconnect('unauthorized');
      } else {
          socketObjects[decoded.email] = socket;
          socketObjects[decoded.email].on('disconnect', () => {
            console.log(`${decoded.email} disconnected`);
            delete socketObjects[decoded.email];

            console.log("Connected users");
            console.log(Object.keys(socketObjects));
          });
          socketObjects[decoded.email].emit('authorized');

          console.log("Connected users");
          console.log(Object.keys(socketObjects));
      }
  });
  
  next();
}

sendNotification = function (message) {
  const receivers = message.users || [];
  console.log("Send notification:");
  console.log(message);
  receivers.forEach(email => {
    if (socketObjects.hasOwnProperty(email)) {
      console.log(`Sending notification to ${email}`);
      socketObjects[email].emit("notification", message.notification);
    }
  })
}

module.exports = {
  init,
  authorize,
  sendNotification
};
