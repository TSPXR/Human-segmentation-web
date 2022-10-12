/**
 *  @author chansoopark98 <park.chansoo@tsp-xr.com>
 *  @description
 *  2022 Coex demo
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
let baseModelPath = 'assets/objects/'; // 3d model path

let pos = new THREE.Vector3(); // create once and reuse
let vec = new THREE.Vector3(); // create once and reuse

// Configurate GLTF loader
const loader = new GLTFLoader();
// Get video element
const originalVideo = document.getElementById('video');
// Set video element listener (Async fuction)
originalVideo.addEventListener('canplaythrough', render_ar_video);

// Set Three.js Perspective camera and Renderer
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(45, camera_width / camera_height, 1, 1000);
let renderer = new THREE.WebGLRenderer({
    canvas: render_ar,
    alpha: true, 
    preserveDrawingBuffer: true,
    premultipliedAlpha: false
});
renderer.setSize(camera_width, camera_height);

// Set Light source
// let pointLightRight = new THREE.PointLight(0xffffff);
// let pointLightLeft = new THREE.PointLight(0xffffff);
// let pointLightBottom = new THREE.PointLight(0xffffff);
// let pointLightCenter = new THREE.PointLight(0xffffff);
// pointLightRight.position.set(100, 100, 0);
// pointLightLeft.position.set(-100, 100, 0);
// pointLightBottom.position.set(0, -100, 0);
// pointLightCenter.position.set(0, 10, 100);
// scene.add(pointLightRight);
// scene.add(pointLightLeft);
// scene.add(pointLightCenter);

// Load objectArVideo
const objectArVideoPath = 'assets/object_videos/'
const objectArVideo = document.getElementById('objectVideo');
objectArVideo.width = camera_width;
objectArVideo.height = camera_height;
objectArVideo.autoplay = true;
objectArVideo.loop = true;
objectArVideo.mute = true;
objectArVideo.setAttribute('crossorigin', 'annonymous');
objectArVideo.src = objectArVideoPath + '03_headfollow.webm';
objectArVideo.play();

// load video texture
let objectVideoTexture = new THREE.VideoTexture(objectArVideo);
objectVideoTexture.needsUpdate = true;;
objectVideoTexture.format = THREE.RGBAFormat;
objectVideoTexture.crossOrigin = 'anonymous';

// const geometry = new THREE.PlaneGeometry(0.9, 1.6 );
const geometry = new THREE.PlaneGeometry(0.9, 1.6, 3);
const material = new THREE.MeshBasicMaterial({  map: objectVideoTexture,
                                                side: THREE.FrontSide,
                                                toneMapped: false })
material.needsUpdate = true;
const plane = new THREE.Mesh( geometry, material );
scene.add( plane );

// Set default camera position
camera.lookAt(0,0,0);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 1;


// Websocket을 통해 얻은 정보를 바탕으로 object들의 위치 및 회전을 update
function updateRotationAndPosition(idx, center_x, center_y, scale, x_rot, y_rot, z_rot) {
    // center_y = center_y - 30 ;
    
    // scale = (1 * scale).toFixed(0);

    // plane.scale.set(scale, scale, scale);

    vec.set(
        ((center_x / camera_width) * 2 - 1).toFixed(2),
        (- (center_y / camera_height) * 2 + 1).toFixed(2),
        0.5);
    
    vec.unproject(camera);
    vec.sub(camera.position).normalize();
    
    // var distance = - camera.position.z / vec.z;
    var distance = - camera.position.z / -1;

    var value = vec.multiplyScalar(distance.toFixed(2));

    plane.position.x = (pos.x + value.x).toFixed(2);
    plane.position.y = (pos.y + value.y).toFixed(2);
    
    console.log(plane.position.x, plane.position.y)

    // plane.rotation.x = (x_rot).toFixed(2);
    // plane.rotation.y = (y_rot).toFixed(2);
    // plane.rotation.z = (-z_rot).toFixed(2);

}

async function render_ar_video() {
    // console.log('render')
    renderer.render(scene, camera);
    // plane.rotation.x = 10;
    // plane.rotation.y = 10;
    await requestAnimationFrame(render_ar_video);
    // setTimeout(render_ar_video, 1)
}

export {updateRotationAndPosition}