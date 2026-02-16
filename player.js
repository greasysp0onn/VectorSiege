import * as THREE from 'three';

export class Player {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        
        // State
        this.position = new THREE.Vector3(0, 2, 0);
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
        
        // Stats
        this.hp = 100;
        this.speed = 10;
        this.jumpForce = 15;
        this.gravity = 30;
        this.isGrounded = false;
        
        // Input
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;

        this.initInput();
    }

    initInput() {
        // Mouse Look
        document.addEventListener('mousemove', (event) => {
            if (document.pointerLockElement === this.domElement) {
                this.rotation.y -= event.movementX * 0.002;
                this.rotation.x -= event.movementY * 0.002;
                // Clamp look up/down
                this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
                this.camera.quaternion.setFromEuler(this.rotation);
            }
        });

        // Keyboard
        const onKeyDown = (event) => {
            switch (event.code) {
                case 'ArrowUp': case 'KeyW': this.moveForward = true; break;
                case 'ArrowLeft': case 'KeyA': this.moveLeft = true; break;
                case 'ArrowDown': case 'KeyS': this.moveBackward = true; break;
                case 'ArrowRight': case 'KeyD': this.moveRight = true; break;
                case 'Space': if (this.isGrounded) this.velocity.y = this.jumpForce; break;
            }
        };

        const onKeyUp = (event) => {
            switch (event.code) {
                case 'ArrowUp': case 'KeyW': this.moveForward = false; break;
                case 'ArrowLeft': case 'KeyA': this.moveLeft = false; break;
                case 'ArrowDown': case 'KeyS': this.moveBackward = false; break;
                case 'ArrowRight': case 'KeyD': this.moveRight = false; break;
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        
        // Pointer Lock
        this.domElement.addEventListener('click', () => {
            this.domElement.requestPointerLock();
        });
    }

    update(delta, obstacles) {
        if (!document.pointerLockElement) return;

        // Friction
        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;
        this.velocity.y -= this.gravity * delta; // Gravity

        // Direction
        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize();

        // Acceleration
        if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 100.0 * delta;
        if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * 100.0 * delta;

        // Apply movement
        const moveX = -this.velocity.z * delta * Math.sin(this.rotation.y) - this.velocity.x * delta * Math.cos(this.rotation.y);
        const moveZ = -this.velocity.z * delta * Math.cos(this.rotation.y) + this.velocity.x * delta * Math.sin(this.rotation.y);
        
        // Basic Collision (Floor)
        if (this.position.y + this.velocity.y * delta < 2) {
            this.velocity.y = 0;
            this.position.y = 2;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }

        // Apply Vector
        this.position.x += moveX;
        this.position.y += this.velocity.y * delta;
        this.position.z += moveZ;

        // Boundary Checks (Simple)
        if (this.position.x > 49) this.position.x = 49;
        if (this.position.x < -49) this.position.x = -49;
        if (this.position.z > 49) this.position.z = 49;
        if (this.position.z < -49) this.position.z = -49;

        // Update Camera
        this.camera.position.copy(this.position);
    }
}