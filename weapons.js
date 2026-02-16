import * as THREE from 'three';

export class WeaponSystem {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.bullets = [];
        this.ammo = 30;
        this.maxAmmo = 30;
        this.lastShot = 0;
        this.fireRate = 150; // ms
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShot < this.fireRate || this.ammo <= 0) return null;

        this.ammo--;
        this.lastShot = now;
        this.updateUI();

        // 1. Raycast for hit detection
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

        // 2. Visual Bullet (Tracer)
        this.createTracer();

        return raycaster;
    }

    createTracer() {
        // Start point: slightly below camera (simulating gun barrel)
        const start = new THREE.Vector3(0.5, -0.5, -1).applyMatrix4(this.camera.matrixWorld);
        const end = new THREE.Vector3(0, 0, -50).applyMatrix4(this.camera.matrixWorld);

        const geom = new THREE.BufferGeometry().setFromPoints([start, end]);
        const mat = new THREE.LineBasicMaterial({ color: 0xffff00 });
        const line = new THREE.Line(geom, mat);
        
        this.scene.add(line);

        // Remove tracer after 100ms
        setTimeout(() => {
            this.scene.remove(line);
            geom.dispose();
            mat.dispose();
        }, 100);
    }

    reload() {
        setTimeout(() => {
            this.ammo = this.maxAmmo;
            this.updateUI();
        }, 1500);
    }

    updateUI() {
        const el = document.getElementById('ammo-display');
        if(el) el.innerText = this.ammo;
    }
}