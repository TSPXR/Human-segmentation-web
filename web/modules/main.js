import * as camera_util from "./camera.js";
// import {flipCanvasHorizontal} from "./drawMask.js";
// import * as backgroundPlayer from './backgroundAr.js';
import * as backgroundVideo from './backgroundVIdeo.js';

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


const model = await tf.loadGraphModel('assets/segmentation_model_bak/model.json');

/* VideoElement에서 Segmentation model이 분할한 이미지를 합성하여 렌더링할 Canvas*/
const canvas = document.getElementById("render_area");
canvas.width = width; // VideoElement width
canvas.height = height; // VideoElement height

let context = canvas.getContext('2d');
context.width = width;
context.height = height;

/* Segmentation model 출력 결과를 그릴 mask*/
const maskCanvas = document.getElementById("render_mask");

/* VideoElemet */
const videoElement = document.getElementById('video');
videoElement.addEventListener('canplaythrough', render_video);


async function render_video(){
    tf.engine().startScope()
    let date1 = new Date();

    /* tensorflow segmentation 연산 부분*/
    const inputImageTensor = tf.expandDims(tf.cast(tf.browser.fromPixels(videoElement), 'float32'), 0);
    const resizedImage = tf.image.resizeBilinear(inputImageTensor, [640, 360]);
    const normalizedImage = tf.div(resizedImage, 255);

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
    
    tf.dispose(inputImageTensor);
    tf.dispose(resizedImage);
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
// window.onload = () => {
//     console.log('on load')
//     camera_util.getCamera(videoElement);
// }