import { flag } from './server.flags.js';
import { downloadImage } from './capture.js'

const guideContainer = document.querySelector('.guide-container');
const captureBtnContainer = document.querySelector('.btn-container');
const captureBtn = document.querySelector('#capture-btn');
const downloadIcon = document.querySelector('#download-icon');
const categoryContainer = document.querySelector('.category-container');
const previewSlide = document.querySelector('#preview-slider');

let preview = null;
let previewImg = null;
let clickFunc = null;


function setPreviewLayer(imgBase64) {
    if (!preview) {
        guideContainer.style.height = '80%';
        captureBtnContainer.style.height = '20%';

        preview = document.createElement('div');
        preview.style.position = 'abosolute';
        // preview.style.backgroundColor = '#ccc';
        preview.style.display = 'none';
        preview.style.justifyContent = 'center';
        preview.style.alignItems = 'center';
        preview.style.zIndex = '2';

        previewImg = new Image();
        preview.appendChild(previewImg);
        previewImg.style.position = 'absolute';
        //previewImg.style.width = '95%';
        previewImg.style.height = `${guideContainer.clientHeight * 0.9}px`;
        
        previewImg.onload = () => {
            clickFunc = () => {
                downloadImage(imgBase64);
            }
            previewSlide.style.display = 'none';
            categoryContainer.style.display = 'none';
            captureBtn.style.backgroundColor = '#FFF';
            captureBtn.parentElement.style.bottom = `${(captureBtnContainer.clientHeight - captureBtn.parentElement.clientHeight) / 2}px`;
            preview.style.display = 'flex';
            downloadIcon.style.display = 'block';
        };

        guideContainer.appendChild(preview);
    }

    previewImg.src = imgBase64;
}

function connectServer() {
    const wss = new WebSocket('wss://park-tdl.tspxr.ml:5555');
    // const wss = new WebSocket('wss://127.0.0.1:5555');

    wss.onmessage = (msg) => {
        const jsonData = JSON.parse(msg.data);

        switch(jsonData.flag) {
            case flag.SEND_IMAGE_FLAG:
                setPreviewLayer(jsonData.data);
                wss.close();
                break;
        }
    };

    wss.onopen = () => {
        wss.send(JSON.stringify({
            'flag' : flag.CLIENT_FLAG
        }));
        console.log('connect successfully!');
    };

    wss.onclose = () => {
        console.log('disconneted')
    };

    wss.onerror = () => {
        console.log('error occured! failed to connect server.')
    };

    return {
        sendCaptureMsg: () => {
            wss.send(JSON.stringify({
                'flag' : flag.GET_IMAGE_FLAG
            }));
        },
        changeFrameMsg: (frameNum) => {
            wss.send(JSON.stringify({
                'flag' : flag.CHANGE_FRAME_FLAG,
                'data': frameNum
            }));
        },
    } 
}

function changeCategory(element) {
    const categories = document.querySelectorAll(".category");

    categories.forEach((category) => {
        category.classList.remove("category-selected");
    });

    element.classList.add("category-selected");
}

function changeSlide(element) {
    const slides = document.querySelectorAll(".slide");

    slides.forEach((slide) => {
        slide.classList.remove("selected");
    });

    element.classList.add("selected");
}

window.onload = () => {
    const server = connectServer();
    const categories = document.querySelectorAll(".category");
    const slides = document.querySelectorAll('.slide');

    categories.forEach((category) => {
        category.addEventListener('click', () => {
            changeCategory(category);
        })
    })

    slides.forEach((slide) => {
        slide.addEventListener('click', () => {
            changeSlide(slide);
            server.changeFrameMsg(slide.id);
        })
    })

    clickFunc = () => {
        captureBtn.style.backgroundColor = '#FF3333';
        server.sendCaptureMsg();

        // setTimeout(() => {
        //     captureBtn.style.backgroundColor = '#CCC';
        // }, 1000);

        const guide = document.querySelector('.guide');
        const inner = guide.querySelector('p');
        inner.innerHTML = '잠시만 기다려주세요...';

        clickFunc = () => {
            console.log('Please Wait...')
        }
    }

    captureBtn.addEventListener('click', () => {
        clickFunc();
    });
}