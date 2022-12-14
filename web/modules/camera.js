/**
 *  @author XHI-NM <jeong.chiseo@tsp-xr.com>
 *  @description
 *  Camera function for getting rear camera with general wide-angle
 */

 let isIOS = null;
 let isMobile = null;
 
 function getLogTitle(text) {
     let base = '======================================';
     return (base + `\n${text}\n` +base);
 }
 
 function getUserAgent() {
     return navigator.userAgent.toLowerCase();
 }
 
 function getCameraSpecification() {
     return new Promise(async (resolve, reject) => {
         let cameraList = [];
         let focusDistanceMax = 0;
 
         if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
             const deviceList = await navigator.mediaDevices.enumerateDevices();
         console.log(deviceList);
             for (let i = 0; i < deviceList.length; i++) {
                 const device = deviceList[i];
     
                 if (device.kind === 'videoinput') {
                     const deviceId = device.deviceId;
                     console.log(deviceId);
                     const constraints = {
                         audio: false,
                         video: {
                             deviceId: deviceId
                         },
                     };
     
                     const stream = await navigator.mediaDevices.getUserMedia(constraints);
                     const supports = navigator.mediaDevices.getSupportedConstraints();
                     console.log(stream)
                     stream.getVideoTracks().forEach(track => {
                        console.log(track);
                         const capabilities = track.getCapabilities();
                        console.log(capabilities)
                        
                        console.log(getLogTitle(device.label));
                        console.log(device);
                        console.log(capabilities);
                        cameraList.unshift(deviceId);
                         if (capabilities.facingMode[0] == 'environment') {
                             console.log(getLogTitle(device.label));
                             console.log(device);
                             console.log(capabilities);
 
                             let fd = capabilities.focusDistance;
 
                             if (fd.min > 0){
                                 if (focusDistanceMax < fd.max) {
                                     focusDistanceMax = fd.max;
                                     cameraList.unshift(deviceId);
                                 } else  {
                                     cameraList.push(deviceId);
                                 }
                                 
                             }
                         }
                     })
                     stream.getTracks().forEach(track => {
                         track.stop();
                     });
                 }
             }
             console.log('resolve');
             console.log(cameraList);
             resolve(cameraList);
         } else {
             console.log('This device does not support web camera.');
             reject(cameraList);
         }
     });
 }
 
 function openCamera(baseVideo, deviceId) {
     return new Promise((reserve, reject) => {
         let video = {
          minWidth: 1440,
          minHeight: 2560,
          width: 1440,
          height: 2560,
 
        //  minWidth: 720,
        //  minHeight: 1280,
        //  width: 720,
        //  height: 1280
         }
     
     //  if (deviceId == 'ios') {
     //      video.facingMode = 'environment';
         
     video.deviceId = deviceId;
    console.log(video);
     console.log(baseVideo);
    let constraints = {
        audio: false,
        video: video
    };

    window.baseVideo = baseVideo;

    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            console.log(stream);
             stream.getVideoTracks().forEach(track => {
                 //console.log(track);
                 console.log(stream.getVideoTracks());
                 console.log(track.getSettings());
             });
             
             baseVideo.srcObject = stream;
             baseVideo.addEventListener('loadedmetadata', () => {
                console.log('play video');
                 baseVideo.play();
                 reserve(true, stream);
             });
         }).catch((err) => {
            // todo retry
            console.log(err)
         }
         )
     })
 }
 
 function getCamera(baseVideo) {
     const userAgent = getUserAgent();
 
     if (userAgent.match('iphone') || userAgent.match('ipad') || userAgent.match('ipod') || userAgent.match('mac')) {
         isIOS = true;
         isMobile = true;
     //  if (!userAgent.match('safari') || userAgent.match('naver') || userAgent.match('twitter')) {
     //      isIOS = false;
     //  }
     } else {
         isMobile = userAgent.match('Android') || userAgent.match('mobile');
     }
 
     getCameraSpecification().then((cameraList) => {
         let cameraId = '';
         
        //  if (cameraList.length > 0) {
        //      cameraId = cameraList[0];
        //  }
        //  else if (isIOS) {
        //      cameraId = 'ios';
        //  }
        cameraId = cameraList[1];
        console.log(baseVideo);
         openCamera(baseVideo, cameraId).then((camAct, stream) => {
             if (camAct) {
                 return stream
             }
         })
     });
 }
 
 export { getCameraSpecification, getCamera }