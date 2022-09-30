function flipCanvasHorizontal(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
  }

function convertCanvasToGrayscale(canvas){
    var tmp = document.createElement('canvas');
    tmp.width = canvas.width;
    tmp.height = canvas.height;
    var tmpctx = tmp.getContext('2d');

    // conversion
    tmpctx.globalCompositeOperation="source-over";  // default composite value
    tmpctx.fillStyle="#FFFFFF";
    tmpctx.fillRect(0,0,canvas.width,canvas.height);
    tmpctx.globalCompositeOperation="luminosity";
    tmpctx.drawImage(canvas,0,0);

    // write converted back to canvas
    var ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation="source-over";
    ctx.drawImage(tmp, 0, 0);
}

function convertGrayscaleCanvasToBlackNWhite(canvas){
    var ctx = canvas.getContext('2d');

    // in case the grayscale conversion is to bulky for ya
    // darken the canvas bevore further black'nwhite conversion
    //for(var i=0;i<3;i++){
    //    ctx.globalCompositeOperation = 'multiply';
    //    ctx.drawImage(canvas, 0, 0);
    //}

    ctx.globalCompositeOperation = 'color-dodge';
    ctx.fillStyle = "rgba(253, 253, 253, 1)";
    ctx.beginPath();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fill();
    ctx.globalCompositeOperation = 'color-dodge';
    ctx.fillStyle = "rgba(253, 253, 253, 1)";
    ctx.beginPath();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fill();
}

function getBlendedImageWithBlackNWhite(canvasimage, canvasbw){
    var tmp = document.createElement('canvas');
    tmp.width = canvasimage.width;
    tmp.height = canvasimage.height;

    var tmpctx = tmp.getContext('2d');

    tmpctx.globalCompositeOperation = 'source-over';
    tmpctx.drawImage(canvasimage, 0, 0);

    // multiply means, that every white pixel gets replaced by canvasimage pixel
    // and every black pixel will be left black
    tmpctx.globalCompositeOperation = 'multiply';
    tmpctx.drawImage(canvasbw, 0, 0);

    return tmp;
}

function invertCanvas(canvas){
    var ctx = canvas.getContext("2d");

    ctx.globalCompositeOperation = 'difference';
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.beginPath();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fill();
}


export { convertCanvasToGrayscale, convertGrayscaleCanvasToBlackNWhite, getBlendedImageWithBlackNWhite, flipCanvasHorizontal}