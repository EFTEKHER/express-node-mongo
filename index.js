const http = require('http');
const server = http.createServer((req,res)=>{
    console.log(req.url);
    if(req.url==='/')
        {
            res.end('This is a test')
        }
});
const fs = require('fs');


const port = 5000;

const fileRead= fs.readFileSync('./sample.txt','utf-8');
console.log(fileRead);


fs.writeFile('index.txt',"Hello World",()=>{
    console.log('file written')
})
server.listen(port,()=>{
    console.log(`server listening on port ${port}`);

});