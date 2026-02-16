import * as THREE from 'three';

export function createMap(scene) {
    const obstacles = [];

    // 1. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(50, 100, 50);
    scene.add(dirLight);

    // 2. Floor (Grid Style)
    const gridSize = 100;
    const gridHelper = new THREE.GridHelper(gridSize, 50, 0x00ffff, 0x222222);
    scene.add(gridHelper);

    const floorGeo = new THREE.PlaneGeometry(gridSize, gridSize);
    const floorMat = new THREE.MeshBasicMaterial({ 
        color: 0x050505, 
        side: THREE.DoubleSide 
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.1; // Just below grid
    scene.add(floor);

    // 3. Obstacles (Neon Cubes)
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    
    // Material with emissive glow
    const wallMat = new THREE.MeshLambertMaterial({ 
        color: 0x111111, 
        emissive: 0x00ffff, 
        emissiveIntensity: 0.4 
    });

    const rampMat = new THREE.MeshLambertMaterial({
        color: 0x111111,
        emissive: 0xff00ff,
        emissiveIntensity: 0.4
    });

    // Helper to add walls
    function addWall(x, y, z, sx, sy, sz) {
        const wall = new THREE.Mesh(boxGeo, wallMat);
        wall.position.set(x, y + sy/2, z);
        wall.scale.set(sx, sy, sz);
        scene.add(wall);
        obstacles.push(wall); // Add to collision array
    }

    // -- Map Layout --
    // Outer Walls
    addWall(0, 0, -50, 100, 5, 1);
    addWall(0, 0, 50, 100, 5, 1);
    addWall(-50, 0, 0, 1, 5, 100);
    addWall(50, 0, 0, 1, 5, 100);

    // Center Structures
    addWall(0, 0, 0, 10, 4, 10);
    addWall(-20, 0, -20, 5, 8, 5); // Sniper tower
    addWall(20, 0, 20, 5, 3, 15);  // Cover

    // Return objects needed for collision logic
    return { obstacles, floor };
}