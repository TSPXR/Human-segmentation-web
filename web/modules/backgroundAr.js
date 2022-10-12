/**
 *  @author chansoopark98 <park.chansoo@tsp-xr.com>
 *  @description
 *  2022 Coex human segmentation demo
 * 
 *  reference:
 *      1. https://stackoverflow.com/questions/60593951/threejs-responsiveness-for-2d-videos
 */

// Import modules
import * as THREE from './three.js/three.module.js'
import { GLTFLoader } from './three.js/loaders/GLTFLoader.js';

/*
    ----------------------<<< Global variable >>>----------------------
*/

// Set global variable
let camera_width = 1440; // 렌더링할 캔버스 너비
let camera_height = 2560; // 렌더링할 캔버스 높이

// Set Scene and PerspectiveCamera
let scene = new THREE.Scene();
// let camera = new THREE.PerspectiveCamera(45, camera_width / camera_height, 1, 1000);
let camera = new THREE.PerspectiveCamera(90, 1, 0.1, 50000);
let renderer = new THREE.WebGLRenderer({
   depth: true,
   alpha: true, 
   preserveDrawingBuffer: true,
   premultipliedAlpha: false
});
camera.target = new THREE.Vector3(0, 0, 0);

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setSize(camera_width, camera_height);

window.addEventListener('resize', onWindowResize, false);


// Front video setting
const ojbectArPath = 'assets/object_videos/'
let objectVideo = document.getElementById('objectVideo');
objectVideo.autoplay = true;
objectVideo.loop = true;
objectVideo.mute = true;
objectVideo.setAttribute('crossorigin', 'annonymous');
objectVideo.src = ojbectArPath + '03_headfollow.webm';
// backgroundVideo.addEventListener('canplaythrough', render_ar_video);

let videoGeometry = new THREE.PlaneBufferGeometry(1.7, 1);

let videoTexture = new THREE.VideoTexture(objectVideo);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.format = THREE.RGBFormat;

let videoMaterial = new THREE.MeshBasicMaterial({
    map: videoTexture
  });


backgroundVideo.onplay = function() {
    onWindowResize();
}


let videoMesh = new THREE.Mesh(videoGeometry, videoMaterial);

// Set Three.js Perspective camera and Renderer

scene.add(videoMesh);


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    console.log("[DEBUG] onWindowResize");
  }

  

async function render_ar_video() {
    console.log('render')
    // camera.updateProjectionMatrix();
  camera.position.z = 0.5;
  camera.rotation.y = 0.5;
  videoMesh.rotation.x = 0.1;
  videoMesh.rotation.y = 0.1;
  // renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
  
    // renderer.render(scene, camera);
    await requestAnimationFrame(render_ar_video);
    // setTimeout(render_ar_video, 1)
}

render_ar_video()