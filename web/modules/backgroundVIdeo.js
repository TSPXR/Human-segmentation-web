const camera_width = 1440;
const camera_height = 2560;
let globalIdx = 1;
// Background video path
const backgroundVideoPath = 'assets/background_videos/';
const backgroundVideo = document.getElementById('backgroundVideo');
backgroundVideo.width = camera_width;
backgroundVideo.height = camera_height;
backgroundVideo.autoplay = true;
backgroundVideo.loop = true;
backgroundVideo.mute = true;
backgroundVideo.setAttribute('crossorigin', 'annonymous');
backgroundVideo.src = backgroundVideoPath + String(globalIdx) + '_BG.webm'; 



// Front video setting
const frontVideoPath = 'assets/front_videos/'
const frontVideo = document.getElementById('frontVideo');
frontVideo.width = camera_width;
frontVideo.height = camera_height;
frontVideo.autoplay = true;
frontVideo.loop = true;
frontVideo.mute = true;
frontVideo.setAttribute('crossorigin', 'annonymous');
frontVideo.filter = 
frontVideo.src = frontVideoPath + String(globalIdx) + '_front.webm';


function setVideoIdx(idx){
    globalIdx = idx;
    backgroundVideo.src = backgroundVideoPath + String(globalIdx) + '_BG.webm'; 

    if (idx <= 3 ){
       frontVideo.src = frontVideoPath + String(globalIdx) + '_front.webm'; 
    }
    else{
        frontVideo.src = undefined;
    }
}

export{setVideoIdx, backgroundVideo, frontVideo}