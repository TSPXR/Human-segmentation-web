import * as camera_util from "./camera.js";
import {drawMask} from "./drawMask.js";


/*
    Canvas mask 
    https://stackoverflow.com/questions/24740899/merge-canvas-image-and-canvas-alpha-mask-into-dataurl-generated-png

    bodypix example
    https://github.com/tensorflow/tfjs-models/blob/b5d49c0f5ba2057cc29b40317126c5f182495f96/body-pix/src/output_rendering_util.ts
*/



tf.ENV.set("WEBGL_CPU_FORWARD", true)
tf.setBackend('webgl');
// tf.setBackend('wsa')
console.log(tf.getBackend()); // tf backend 확인


const model = await tf.loadGraphModel('assets/segmentation_model/model.json');

const canvas = document.getElementById("render_area");
canvas.width = 1280; // VideoElement width
canvas.height = 720; // VideoElement height

let context = canvas.getContext('2d');
context.width = 1280;
context.height = 720;
context.fillStyle = '#ffffff'; // implicit alpha of 1
context.fillRect(0, 0, context.canvas.width, context.canvas.height);


const backgroundMask = document.getElementById('bg_area');
var bgContext = backgroundMask.getContext('2d');
let testImage = new Image;
testImage.onload = function(){
    bgContext.drawImage(testImage,0,0); // Or at whatever offset you like
};
testImage.src = "http://tigerday.org/wp-content/uploads/2013/04/Siberischer_tiger.jpg";

console.log(testImage)

const maskCanvas = document.getElementById("render_mask");
let maskContext = maskCanvas.getContext('2d');

// const videoElement = document.querySelector('video');
let videoElement = document.getElementById('video');

videoElement.addEventListener('canplaythrough', render_video);
console.log(videoElement.videoWidth, videoElement.videoHeight);
videoElement.width = 1280;
videoElement.height = 720;


// Initialize
camera_util.getCamera(videoElement);


async function render_video(){
    tf.engine().startScope()
    
    let date1 = new Date();
    
    const inputImageTensor = tf.expandDims(tf.cast(tf.browser.fromPixels(videoElement), 'float32'), 0);
    
    const resizedImage = tf.image.resizeBilinear(inputImageTensor, [640, 360]);
    const normalizedImage = tf.div(resizedImage, 255);
    
    // const output = await model.executeAsync(resizedImage);
    const output = await model.execute(normalizedImage).expandDims(3);

    // console.log(output);
    
    // const resizedOutput = tf.image.resizeBilinear(output, [1280, 720]).squeeze(0).mul(255).cast('int32');
    const resizedOutput = tf.image.resizeBilinear(output, [720, 1280]).squeeze(0).cast('float32');

    tf.browser.toPixels(resizedOutput, maskCanvas);
    
    
    context.globalCompositeOperation = 'source-over';
    context.drawImage(maskCanvas, 0, 0);
    
    
    context.globalCompositeOperation = 'multiply'; // multiply , source-in
    context.drawImage(videoElement, 0 , 0);

    
    

    // let invertMask = tf.where(resizedOutput>0, 0, 1);
    // console.log(invertMask)
     
    tf.dispose(inputImageTensor);
    tf.dispose(resizedImage);
    tf.dispose(output);

    var date2 = new Date();
    var diff = date2 - date1;
    console.log(diff);
    
 
    tf.engine().endScope()
    await requestAnimationFrame(render_video);
    
    
}