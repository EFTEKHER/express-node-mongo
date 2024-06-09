const http = require('http');
const server = http.createServer();


const port = 1000;

server.listen(port,()=>{
    console.log(`server listening on port ${port}`);
    
});