/**
 *  @author XHI-NM <jeong.chiseo@tsp-xr.com>
 *  @description
 *  Capture function for augmented reality (video/canvas element)
 */

import { flag } from './server.flags.js';

const captureCanvas = document.createElement('canvas');
const captureContext = captureCanvas.getContext('2d');
const frameConfigPath = './assets/img/frame.json';

let frameConfig = null;
let captureButton = null;
let container = null;
let sendButton = null;
let qrButton = null;
let qrLayer = null;

let wss = null;
let previousImage = null;

function connectCaptureServer(layerList, width, height, effect) {
    wss = new WebSocket('wss://park-tdl.tspxr.ml:5555');
    // const wss = new WebSocket('wss://192.168.0.43:5503');

    wss.onmessage = (msg) => {
        const jsonData = JSON.parse(msg.data);

        switch(jsonData.flag){
            case flag.GET_IMAGE_FLAG:
    
                effect.countDown().then(() => {
                    effect.playEffect().then(() => {
                        getCaptureImage(layerList, width, height).then((imgBase64) => {
                            if (imgBase64) {
                                previousImage = imgBase64;
                                wss.send(JSON.stringify({
                                    'flag': flag.SEND_IMAGE_FLAG,
                                    'data': imgBase64
                                }));
                            }
                        })
                    })
                });
                break;
            case flag.CHANGE_FRAME_FLAG:
                const idx = String(jsonData.data);
                window.changeFrame(idx);
                break;
        }
    };

    wss.onopen = () => {
        wss.send(JSON.stringify({ 'flag' : flag.CAMERA_SERVER_FLAG }));
        console.log('connect successfully!');
    };

    wss.onclose = () => {
        console.log('disconneted')
    };

    wss.onerror = () => {
        console.log('error occured! failed to connect server.')
    };

    return wss;
}

function sendImage() {
    wss.send(JSON.stringify({
        'flag' : flag.SEND_IMAGE_FLAG,
        'data' : previousImage
    }));
}

function getCurrentDate() {
    const current = new Date();
    const year = current.getFullYear();
    const month = ('0' + (current.getMonth() + 1)).slice(-2);
    const day = ('0' + current.getDate()).slice(-2);
    const hh = ('0' + current.getHours()).slice(-2); 
    const mm = ('0' + current.getMinutes()).slice(-2);
    const ss = ('0' + current.getSeconds()).slice(-2); 
    const dateString = `${year}${month}${day}_${hh}-${mm}-${ss}`;

    return dateString;
}

function downloadImage(imageURL, imageName=null) {
    let dataURL = imageURL.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
    dataURL = dataURL.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=Capture.png');
    
    const link = document.createElement('a');

    if (imageName) {
        link.download = str(imageName);
    } else {
        link.download = `${getCurrentDate()}.png`;
    }
    link.href = dataURL;
    console.log(link)
    link.click();
}

function getCaptureImage(layerList, width, height) {
    return new Promise( (resolve) => {
        captureCanvas.width = width;
        captureCanvas.height = height;

        try {
            layerList.forEach( (layer, idx) => {
                captureContext.drawImage(layer, 0, 0, width, height);
                if (idx == 1) {
                    captureContext.filter = 'none';
                }
            });

            const imgBase64 = captureCanvas.toDataURL('image/png', 1.0);

            downloadImage(imgBase64);

            resolve(imgBase64)
        } catch (err) {
            console.error(err);
            resolve(null);
        }
    })
}

function createCaptureButton(containerElement, layerList, width, height) {
    if (!captureButton) {
        container = containerElement;
        const buttonContainer = document.createElement('div');

        captureButton = document.createElement('div');
        captureButton.id = 'capture-btn';
        captureButton.style.position = 'absolute';
        captureButton.style.backgroundColor = '#FF0000';
        captureButton.style.width = '25px';
        captureButton.style.height = '25px';
        captureButton.style.borderRadius = '25px';
        captureButton.style.margin = '10px';
        captureButton.style.bottom = 0;
        captureButton.style.right = 0;
        captureButton.style.zIndex = '1000';

        sendButton = document.createElement('div');
        sendButton.id = 'send-btn';
        sendButton.style.position = 'absolute';
        sendButton.style.backgroundColor = '#2222FF';
        sendButton.style.width = '25px';
        sendButton.style.height = '25px';
        sendButton.style.borderRadius = '25px';
        sendButton.style.margin = '10px';
        sendButton.style.bottom = 0;
        sendButton.style.right = '30px';
        sendButton.style.zIndex = '1000';

        qrButton = document.createElement('img');
        qrButton.src = './assets/img/qr/connect.png';
        qrButton.style.position = 'absolute';
        qrButton.style.width = '25px';
        qrButton.style.height = '25px';
        qrButton.style.margin = '10px';
        qrButton.style.bottom = 0;
        qrButton.style.right = '60px';
        qrButton.style.zIndex = '1000';

        buttonContainer.appendChild(captureButton);
        buttonContainer.appendChild(sendButton);
        buttonContainer.appendChild(qrButton);
        container.prepend(buttonContainer);
    }

    const effect = createCaptureEffect(containerElement);
    connectCaptureServer(layerList, width, height, effect);

    captureButton.addEventListener('click', (event) => {
        effect.playEffect().then(() => {
            getCaptureImage(layerList, width, height).then( (imgBase64) => {
                if (imgBase64) {
                    previousImage = imgBase64;
                    wss.send(JSON.stringify({
                        'flag': flag.SEND_IMAGE_FLAG,
                        'data': imgBase64
                    }));
                }
            });
        })
    });

    sendButton.addEventListener('click', (event) => {
        if (previousImage) {
            sendImage();
        }
    });

    qrButton.addEventListener('click', () => {
        showQRLayer();
    });

    container.addEventListener('click', () => {
        showQRLayer();
    })
}

function showQRLayer() {
    if (!qrLayer) {
        qrLayer = document.createElement('div');
        qrLayer.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
        qrLayer.style.position = 'absolute';
        qrLayer.style.width = '100%';
        qrLayer.style.height = '100%';
        qrLayer.style.display = 'flex';
        qrLayer.style.justifyContent = 'center';
        qrLayer.style.alignItems = 'center';
        qrLayer.style.flexDirection = 'column';
        qrLayer.style.zIndex = '1000';

        const qrContainer = document.createElement('div');
        qrContainer.style.position = 'absolute';
        qrContainer.style.display = 'flex';
        qrContainer.style.flexDirection = 'row';
        qrContainer.style.justifyContent = 'center';
        qrContainer.style.alignItems = 'center';
        qrContainer.style.paddingBottom = '80px'

        const wifi = document.createElement('img');
        wifi.src = './assets/img/qr/wifi.png';
        wifi.style.width = `40%`;

        const connect = document.createElement('img');
        connect.src = './assets/img/qr/connect.png';
        connect.style.width = `40%`;
        connect.style.paddingLeft = '20px';

        const help = document.createElement('div');
        help.style.position = 'absolute';
        help.style.width = '85%';
        help.style.color = '#FFF';
        help.style.textAlign = 'center';
        help.style.fontSize = '20px';
        help.style.fontFamily = 'NanumSquare';
        help.style.paddingTop = '200px'

        help.innerHTML = '좌측 QR을 통해 WiFi 먼저 접속하신 후<br>우측 QR로 접속해주세요';

        qrContainer.appendChild(wifi);
        qrContainer.appendChild(connect);
        qrLayer.appendChild(qrContainer);
        qrLayer.appendChild(help);

        container.prepend(qrLayer);
    } else {
        qrLayer.parentElement.removeChild(qrLayer);
        qrLayer = null;
    }
}

function createCaptureEffect(containerElement) {
    let captureEffectCanvas = document.querySelector('#capture-effect');

    if (!captureEffectCanvas) {
        captureEffectCanvas = document.createElement('canvas');
        captureEffectCanvas.id = 'capture-effect';
        captureEffectCanvas.style.position = 'absolute';
        captureEffectCanvas.style.zIndex = '1000';
        captureEffectCanvas.style.display = 'none';
        const captureEffectContext = captureEffectCanvas.getContext('2d');
        const triangleCanvas = document.createElement('canvas');
        const triangleContext = triangleCanvas.getContext('2d');
        const polygon_sides = 10;
        const vertices = Array(polygon_sides).fill(null);
        const angle_increment = Math.PI * 2 / polygon_sides;
        const exterior_angle = angle_increment;

        const count = document.createElement('div');
        count.style.position = 'absolute';
        count.style.width = '100%';
        count.style.height = '100%';
        count.style.color = '#FFF'
        count.style.display = 'none';
        count.style.justifyContent = 'center';
        count.style.alignItems = 'center';
        count.style.textAlign = 'center';
        count.style.fontSize = '15em';
        count.style.zIndex = '9999';
    
        let center_x;
        let center_y;
        let radius = 100;
        let longestSide;
    
        const setVertices = () => {
            for (let i = 0; i < polygon_sides; i++) {
                const x = center_x + radius * Math.cos(angle_increment * i);
                const y = center_y - radius * Math.sin(angle_increment * i);
                
                vertices[i] = { x, y };
            }
        }
    
        const updateTriangle = () => {
            const gradient = triangleContext.createLinearGradient(0, 0, triangleCanvas.width, 0);
            gradient.addColorStop(0, '#222');
            gradient.addColorStop(0.3, '#000');
            triangleContext.fillStyle = gradient;
            
            triangleContext.strokeStyle = '#444';
            
            triangleContext.clearRect(0, 0, triangleCanvas.width, triangleCanvas.height);
            
            triangleContext.moveTo(0, 0);
            triangleContext.lineTo(triangleCanvas.width, 0);
            triangleContext.lineTo(
                triangleCanvas.width * Math.cos(exterior_angle),
                triangleCanvas.height * Math.sin(exterior_angle)
            );
            triangleContext.closePath();
            triangleContext.fill();
            triangleContext.stroke();
        }
    
        const placeTriangle = (vertex, i) => {  
            captureEffectContext.save();
            captureEffectContext.translate(vertex.x, vertex.y);
            captureEffectContext.rotate(-Math.PI / 2 - exterior_angle / 2 - exterior_angle * i);
            captureEffectContext.drawImage(triangleCanvas, 0, 0);
            captureEffectContext.restore();
        }
    
        const draw = () => {
            captureEffectContext.clearRect(0, 0, captureEffectCanvas.width, captureEffectCanvas.height);
            
            vertices.forEach((vertex, i) => {
                placeTriangle(vertex, i);
            });
        }
    
        const setSize = () => {
            captureEffectCanvas.width = window.innerWidth;
            captureEffectCanvas.height = window.innerHeight;
            center_x = captureEffectCanvas.width / 2;
            center_y = captureEffectCanvas.height / 2;
            longestSide = Math.max(captureEffectCanvas.width, captureEffectCanvas.height);
            triangleCanvas.width = longestSide;
            triangleCanvas.height = longestSide;
            updateTriangle();
        }
    
        const playEffect = () => {
            return new Promise((resolve) => {
                const width = captureEffectCanvas.width;
                const step = 160;
                let current = width;
    
                radius = width;
                setVertices();
                draw();
    
                captureEffectCanvas.style.display = 'block';
    
                const closeEffect = setInterval(() => {
                    if (current <= 0) {
                        clearInterval(closeEffect);
    
                        current = 0;
    
                        const openEffect = setInterval(() => {
                            if (current >= width) {
                                clearInterval(openEffect);        
                                captureEffectCanvas.style.display = 'none';
                                resolve();
                            }
            
                            radius = current * 0.75 <= width ? current * 0.75 : width;
            
                            setVertices();
                            draw();
                            current += step;
                        }, 1)
                    }
    
                    radius = current * 0.75 >= 0 ? current * 0.75 : 0;
    
                    setVertices();
                    draw();
                    current -= step;
                }, 1);
            })
        }

        const countDown = (time=3) => {
            count.innerHTML = '';
            let current = time;

            return new Promise((resolve) => {
                count.style.display = 'flex';
                const start = setInterval(() => {
                    if (current < 1) {
                        clearInterval(start);
                        count.style.display = 'none';
                        resolve();
                    }
                    count.innerHTML = String(current);
                    current -= 1;
                }, 1000);
            });
        }

        const init = () => {
            setSize();
            setVertices();
            draw();
    
            containerElement.prepend(count);
            containerElement.prepend(captureEffectCanvas);
        
            window.addEventListener('resize', () => {
                setSize();
                setVertices();
                draw();
            });
        }

        init();
        return { 'playEffect': playEffect, 'countDown': countDown };
    }
}

export { getCaptureImage, downloadImage, createCaptureButton }