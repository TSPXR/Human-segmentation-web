import * as camera_util from "./camera.js";
// import {updateRotationAndPosition} from './backgroundAr.js';
import * as backgroundVideo from './backgroundVIdeo.js';
import * as captureFunc from './capture.js'

/*
    Canvas mask 
    https://stackoverflow.com/questions/24740899/merge-canvas-image-and-canvas-alpha-mask-into-dataurl-generated-png

    bodypix example
    https://github.com/tensorflow/tfjs-models/blob/b5d49c0f5ba2057cc29b40317126c5f182495f96/body-pix/src/output_rendering_util.ts
*/

/*
    ----------------------<<< Global variable >>>----------------------
*/

// VideoElemet의 너비
let width = 1440;
// VideoElement의 높이
let height = 2560;

// Segmentation model input width
let model_width = 360;
let model_height = 640;

// Tensorflow backend 설정 (for GPU)
tf.ENV.set("WEBGL_CPU_FORWARD", true)
// tf.setBackend('webgpu');
tf.setBackend('webgl');

// Tensorflow segmentation model load
// const model = await tf.loadGraphModel('assets/coex_segmentation_model/model.json');
const model = await tf.loadGraphModel('assets/with_raw/model.json');

/* VideoElement에서 Segmentation model이 분할한 이미지를 합성하여 렌더링할 Canvas*/
// 배경 부분은 0으로 처리되어 출력됨
const renderAreaCanvas = document.getElementById("render_area");
renderAreaCanvas.width = width; // VideoElement width
renderAreaCanvas.height = height; // VideoElement height

let renderAreaContext = renderAreaCanvas.getContext('2d');
renderAreaContext.width = width;
renderAreaContext.height = height;
// renderAreaContext.translate(1440, 0);
// renderAreaContext.scale(-1,1);

/* Segmentation model 출력 결과를 그릴 mask*/
const renderMaskCanvas = document.getElementById("render_mask");
renderMaskCanvas.width = model_width; // VideoElement width
renderMaskCanvas.height = model_height; // VideoElement height

/* Background와 Foreground video 변경 시 사용하는 함수*/
// const sendCanvas = document.createElement('canvas');
// sendCanvas.width = 360;
// sendCanvas.height= 640;
// let sendCanvasContext = sendCanvas.getContext('2d');

// const webSocket = new WebSocket('wss://park-tdl.tspxr.ml:7777');

// webSocket.interval = setInterval(() => { // ?초마다 클라이언트로 메시지 전송
//     if (webSocket.readyState === webSocket.OPEN) {
        
//         sendCanvasContext.drawImage(renderAreaCanvas, 0, 0, 1440, 2560, 0, 0, 360, 640);
//         let sendData = sendCanvas.toDataURL('image/jpeg', 0.5)
//         webSocket.send(sendData.split(",")[1]);
        
//     }
// }, 50);

// webSocket.onmessage = function(message){  
//     let recvData = message.data.split(',');

//     let idx = 6
    
//     let center_x = parseInt(recvData[idx-6]);
//     let center_y = parseInt(recvData[idx-5]);
//     let scale = parseFloat(recvData[idx-4]);
//     let x_rot = parseFloat(recvData[idx-3]);
//     let y_rot = parseFloat(recvData[idx-2]);
//     let z_rot = parseFloat(recvData[idx-1]);
    
//     updateRotationAndPosition(0,
//                                 center_x,
//                                 center_y,
//                                 scale,
//                                 x_rot,
//                                 y_rot,
//                                 z_rot);
// }


/* VideoElemet */
const videoElement = document.getElementById('video');
videoElement.addEventListener('canplaythrough', render_video);

backgroundVideo.setVideoIdx(3);
async function render_video(){
    tf.engine().startScope();

    /* tensorflow segmentation 연산 부분*/
    const inputImageTensor = tf.expandDims(tf.cast(tf.browser.fromPixels(videoElement), 'float32'), 0);
    const resizedImage = tf.image.resizeBilinear(inputImageTensor, [model_height, model_width]);
    const normalizedImage = tf.div(resizedImage, 255);

    // const output = await model.execute(normalizedImage).expandDims(3).squeeze(0).mul(255).cast('int32');
    const output = await model.execute(normalizedImage).expandDims(3).squeeze(0).cast('float32');
    // const resizedOutput = tf.image.resizeBilinear(output, [width, height]).squeeze(0).mul(255).cast('int32');
    // const resizedOutput = tf.image.resizeBilinear(output, [width, height]).squeeze(0);

    /* 합성하는 부분 */
    tf.browser.toPixels(output, renderMaskCanvas);
    tf.engine().endScope();

    
    renderAreaContext.clearRect(0, 0, width, height);
    renderAreaContext.filter = "url(#lumToAlpha)";
    // renderAreaContext.drawImage( renderMaskCanvas, 0, 0, width, height );
    renderAreaContext.drawImage(renderMaskCanvas, 0, 0, model_width, model_height, 0, 0, width, height );
    renderAreaContext.filter = "none";
    renderAreaContext.globalCompositeOperation = 'source-in';
    renderAreaContext.drawImage(videoElement, 0, 0, width, height);
    renderAreaContext.globalCompositeOperation = 'source-over';
    await requestAnimationFrame(render_video);
}



console.log('on load')
camera_util.getCamera(videoElement);
window.changeFrame = backgroundVideo.setVideoIdx;

const renderAR = document.querySelector('#render_ar');
const controller = document.querySelector('.controller');
const layer = [backgroundVideo.backgroundVideo, renderAreaCanvas, renderAR, backgroundVideo.frontVideo ];
captureFunc.createCaptureButton(controller, layer, width, height);

window.onload = () => {

} 