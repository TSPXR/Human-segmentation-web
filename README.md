# Human-segmentation-web
Web browser based Human segmentation 

# Dependency
python 3.10.4

>>>  Node.js sudo npm install package_name
sudo npm install express

sudo npm install cors --save

sudo npm install ejs

sudo npm install ws

sudo npm install three

threejs 설치 안될때 (현재 패키지내에 포함됨)


sudo npm cache clean

sudo npm install -g n
sudo n stable
sudo npm install three
vsocde extension code runner live server

https://itnext.io/promise-loading-with-three-js-78a6297652a5


/*
    두 개의 비디오 소스와 캔버스 이미지를 합성
    최종 합성 결과물 (Canvas) ->  drawAllCanvas 
        
        * 최종 합성 결과물 레이어 계층
          -> / 배경 비디오 / 캔버스 (사람, 배경 분할) / 전경 비디오
        

        backgroundVideo.backgroundVideo -> 경로 : ./web/modules/backgroundVideo.js   / 배경 비디오
        backgroundVideo.frontVideo      -> 경로 : ./web/modules/backgroundVideo.js   / 전경 비디오
        renderAreaCanvas                -> 경로 : ./web/modules/main.js              / 캔버스 (사람, 배경 분할)
        
        

        # width -> 1440;
        # height -> 2560;

        const drawAllCanvas = document.createElement('canvas');
        drawAllCanvas.width = width
        drawAllCanvas.height = height;
        let drawAllContext = drawAllCanvas.getContext('2d');

        drawAllContext.drawImage(backgroundVideo.backgroundVideo, 0, 0, width, height);
        drawAllContext.drawImage( renderAreaCanvas, 0, 0, width, height );
        drawAllContext.filter = "none";
        drawAllContext.drawImage( backgroundVideo.frontVideo, 0, 0, width, height );
*/