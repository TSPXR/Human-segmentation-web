import * as camera_util from "./camera.js";
// import {flipCanvasHorizontal} from "./drawMask.js";
import * as backgroundPlayer from './backgroundAr.js';
import * as tensorOps from './tensorOps.js'
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

tf.ENV.set("WEBGL_CPU_FORWARD", true)
tf.setBackend('webgl');
// tf.setBackend('wsa')
console.log(tf.getBackend()); // tf backend 확인


const model = await tf.loadGraphModel('assets/segmentation_model/model.json');

const canvas = document.getElementById("render_area");
canvas.width = width; // VideoElement width
canvas.height = height; // VideoElement height

let context = canvas.getContext('2d');
context.width = width;
context.height = height;
// context.fillStyle = '#ffffff'; // implicit alpha of 1
// context.fillRect(0, 0, context.canvas.width, context.canvas.height);

// const buffer = document.getElementById('buffer');
// buffer.width = width;
// buffer.height = height;
// const bufferCtx = buffer.getContext( '2d', { willReadFrequently: true } );

const maskCanvas = document.getElementById("render_mask");
let maskContext = maskCanvas.getContext('2d');

// const videoElement = document.querySelector('video');
const videoElement = document.getElementById('video');
// camera_util.getCamera(videoElement);
console.log(videoElement)


videoElement.addEventListener('canplaythrough', render_video);

const backgroundCanvas = document.getElementById('render_background');
let backgroundCanvasContext = backgroundCanvas.getContext('2d');
backgroundCanvasContext.fillStyle = '#3B0B24';
backgroundCanvasContext.fillRect(0, 0, 2560, 1440);



async function render_video(){
    tf.engine().startScope()
    let date1 = new Date();

    /* tensorflow segmentation 연산 부분*/
    const normalizedImage = tensorOps.preprocess(videoElement);
    const output = await model.execute(normalizedImage).expandDims(3);
    const resizedOutput = tf.image.resizeBilinear(output, [width, height]).squeeze(0).mul(255).cast('int32');

    /* 합성하는 부분 */
    tf.browser.toPixels(resizedOutput, maskCanvas);
    context.clearRect(0, 0, width, height);
    context.filter = "url(#lumToAlpha)";
    context.drawImage( maskCanvas, 0, 0, width, height );
    context.filter = "none";
    context.globalCompositeOperation = 'source-in';
    context.drawImage( videoElement, 0, 0, width, height);
    context.globalCompositeOperation = 'source-over';
    
    
    tf.dispose(normalizedImage);
    tf.dispose(output);
    tf.dispose(resizedOutput);

    var date2 = new Date();
    var diff = date2 - date1;
    console.log(diff);
    
 
    tf.engine().endScope()
    await requestAnimationFrame(render_video);
    
    
}

window.onload = camera_util.getCamera(videoElement);

// 페이지를 로드하면 실행 (구성요소들 초기화)
window.onload = () => {
    console.log('on load')
    // canvas.width = width;
    // canvas.height = height;
    camera_util.getCamera(videoElement);
}