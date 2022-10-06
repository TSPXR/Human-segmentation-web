import * as camera_util from "./camera.js";
// import {flipCanvasHorizontal} from "./drawMask.js";
// import * as backgroundPlayer from './backgroundAr.js';

// VideoElemet의 너비
let width = 1440;
// VideoElement의 높이
let height = 2560;


const videoElement = document.getElementById('video');
// camera_util.getCamera(videoElement);
console.log(videoElement)





const rotateCanvas = document.getElementById("rotate_canvas");
let rotateCanvasContext = rotateCanvas.getContext("2d");
// rotateCanvas.width = width;
// rotateCanvas.height = height;



// reset transforms if any

// rotateCanvasContext.translate(rotateCanvas.width / 2, rotateCanvas.height / 2);   // to center

// rotateCanvasContext.rotate(90*Math.PI/180);
// rotateCanvasContext.translate(800, 0); // translate to rectangle center       

// rotateCanvasContext.restore();
videoElement.addEventListener('canplaythrough', render_video);

async function render_video(){

    // rotateCanvasContext.drawImage(videoElement, width, height);
    
    console.log('render');
    
    // rotateCanvasContext.drawImage(videoElement,-width/3, -1800);
    rotateCanvasContext.drawImage(videoElement, width, height);
    
    
    // rotateCanvasContext.rotate((Math.PI/180)*45);
    
    
    
    
    
// rotateCanvasContext.translate(-rotateCanvas.width / 2, -rotateCanvas.height / 2); // and back
// rotateCanvasContext.setTransform(1,0,0,1,0,0);


    await requestAnimationFrame(render_video);
    
    
}

// window.onload = camera_util.getCamera(videoElement);

// 페이지를 로드하면 실행 (구성요소들 초기화)
window.onload = () => {
    console.log('on load')
    // canvas.width = width;
    // canvas.height = height;
    camera_util.getCamera(videoElement);
}