var express = require('express');
var app = express();
var cors = require('cors');

let fs = require('fs');
let options = {
    key: fs.readFileSync('./web/self_key.pem'),
    cert: fs.readFileSync('./web/self_cert.pem'),
    requestCert: false,
    rejectUnauthorized: false
};
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(cors());

app.use('/assets', express.static(__dirname + '/assets'));
app.use('/styles', express.static(__dirname + '/styles'));
app.use('/modules', express.static(__dirname + '/modules'));
app.use('/build', express.static('/home/park/park/Human-segmentation-web/node_modules/three/build'));
app.use('/gltf', express.static('/home/park/park/Human-segmentation-web/node_modules/three/'));
var server_port = 5555;
var server = require('https').createServer(options, app);


// app.set('view engine', 'ejs'); // 렌더링 엔진 모드를 ejs로 설정
// app.set('views',  __dirname + '/views');    // ejs이 있는 폴더를 지정

app.get('/', (req, res) => {
  
    res.render(__dirname + "/mainPage.html");    // index.ejs을 사용자에게 전달
})

server.listen(server_port, function() {
  console.log( 'Express server listening on port ' + server.address().port );
});