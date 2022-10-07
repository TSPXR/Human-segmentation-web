
function preprocess(videoElement){
    const inputImageTensor = tf.expandDims(tf.cast(tf.browser.fromPixels(videoElement), 'float32'), 0);
    const resizedImage = tf.image.resizeBilinear(inputImageTensor, [640, 360]);
    const normalizedImage = tf.div(resizedImage, 255);

    return normalizedImage
}

export {preprocess}