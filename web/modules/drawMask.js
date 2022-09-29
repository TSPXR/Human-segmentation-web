
function renderImageDataToCanvas(image, canvas) {

  }

function renderImageDataToOffScreenCanvas(image, canvas) {
    renderImageDataToCanvas(image, canvas);

    return canvas;
}

function drawMask(context, videoElement, maskImage) {
    
    // canvas.width = 1280;
    // canvas.height = 720;

    // const ctx = canvas.getContext('2d');
    const ctx = context;

    ctx.save();
    // if (flipHorizontal) {
    //     flipCanvasHorizontal(canvas);
    // }

    ctx.drawImage(videoElement, 0, 0);

    ctx.globalAlpha = 1.0;
    if (maskImage) {

        // canvas.width = videoElement.width;
        // canvas.height = videoElement.height;
        // const ctx = canvas.getContext('2d');
        const ctx = context;
      
        ctx.putImageData(videoElement, 0, 0);

        
        // TODO
        // const blurredMask = drawAndBlurImageOnOffScreenCanvas(
        //     mask, maskBlurAmount, CANVAS_NAMES.blurredMask);
        ctx.drawImage(maskImage, 0, 0, width, height);
    }
    ctx.restore();
}

export {drawMask}