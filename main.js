import * as THREE from 'three';
import { createMap } from './game/map.js';
import { Player } from './game/player.js';
import { WeaponSystem } from './game/weapons.js';
import { NetworkManager } from './game/multiplayer.js';
import { auth, signInAnonymously } from './firebase.js';

// Setup
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.02);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Game Components
const { obstacles } = createMap(scene);
const player = new Player(camera, document.body);
const weapons = new WeaponSystem(scene, camera);
let network = null;
let isPlaying = false;

// UI Handlers
document.getElementById('join-btn').addEventListener('click', async () => {
    const username = document.getElementById('username-input').value;
    if (!username) return alert("Enter a name!");
    
    document.getElementById('status-msg').innerText = "Connecting to Firebase...";
    
    try {
        await signInAnonymously(auth);
        network = new NetworkManager(scene, username, handleWin);
        await network.joinGame(player.position);
        
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('game-ui').style.display = 'block';
        isPlaying = true;
    } catch (e) {
        alert("Connection Failed: " + e.message);
    }
});

function handleWin(winnerName) {
    isPlaying = false;
    document.exitPointerLock();
    document.getElementById('game-ui').style.display = 'none';
    document.getElementById('win-screen').style.display = 'flex';
    document.getElementById('winner-name').innerText = winnerName + " WINS!";
}

// Controls
document.addEventListener('mousedown', () => {
    if (!isPlaying) return;
    const ray = weapons.shoot();
    if (ray) network.checkShootHit(ray);
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyR') weapons.reload();
});

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    if (!isPlaying) return;

    const delta = clock.getDelta();

    // Physics
    player.update(delta, obstacles);

    // Network Sync
    if (network) {
        network.updatePosition(player.position, player.rotation.y);
        network.interpolate(delta);
    }

    renderer.render(scene, camera);
}

animate();