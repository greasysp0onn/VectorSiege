import * as THREE from 'three';
import { db, auth, doc, setDoc, onSnapshot, updateDoc, deleteDoc, serverTimestamp, increment } from '../firebase.js';

export class NetworkManager {
    constructor(scene, myUsername, onWin) {
        this.scene = scene;
        this.myUsername = myUsername;
        this.myId = auth.currentUser.uid;
        this.roomId = "public_arena_1"; // Single shared room for simplicity
        
        this.remotePlayers = {}; // { uid: { mesh: THREE.Mesh, data: Object, targetPos: Vector3 } }
        this.lastUpdate = 0;
        this.onWinCallback = onWin;

        // Materials for enemies
        this.enemyGeo = new THREE.BoxGeometry(1.5, 3, 1.5);
        this.enemyMat = new THREE.MeshLambertMaterial({ color: 0xff0000, emissive: 0x550000 });
    }

    async joinGame(initialPos) {
        // 1. Create my player doc
        const playerRef = doc(db, "rooms", this.roomId, "players", this.myId);
        
        await setDoc(playerRef, {
            x: initialPos.x, y: initialPos.y, z: initialPos.z,
            ry: 0,
            hp: 100,
            kills: 0,
            username: this.myUsername,
            lastSeen: serverTimestamp()
        });

        // 2. Listen for updates
        this.unsubscribe = onSnapshot(doc(db, "rooms", this.roomId), (roomSnap) => {
           // Room level updates if needed
        });

        // Listen to subcollection players
        const playersRef = doc(db, "rooms", this.roomId).parent.parent; // Hack to get collection ref if needed, but better to use collection()
        // Standard listener
        import('../firebase.js').then(({ collection }) => {
            onSnapshot(collection(db, "rooms", this.roomId, "players"), (snapshot) => {
                this.handleSnapshot(snapshot);
            });
        });
        
        // 3. Setup disconnect handler (Clean up on tab close)
        window.addEventListener('beforeunload', () => {
            deleteDoc(playerRef);
        });
    }

    // 🔥 THROTTLED UPDATE: Only sends 10 times per second max
    updatePosition(pos, rotationY) {
        const now = Date.now();
        if (now - this.lastUpdate < 100) return; // 100ms throttle
        this.lastUpdate = now;

        const playerRef = doc(db, "rooms", this.roomId, "players", this.myId);
        updateDoc(playerRef, {
            x: Number(pos.x.toFixed(2)),
            y: Number(pos.y.toFixed(2)),
            z: Number(pos.z.toFixed(2)),
            ry: Number(rotationY.toFixed(2)),
            lastSeen: serverTimestamp()
        }).catch(err => console.log("Update error", err));
    }

    handleSnapshot(snapshot) {
        const leaderboard = [];
        
        snapshot.docChanges().forEach((change) => {
            const pid = change.doc.id;
            const data = change.doc.data();

            if (pid === this.myId) {
                // Update local HUD for self stats
                document.getElementById('hp-display').innerText = data.hp;
                document.getElementById('kills-display').innerText = data.kills;
                
                // Win Check
                if (data.kills >= 15) this.onWinCallback(data.username);
                return;
            }

            if (change.type === "added") {
                this.spawnEnemy(pid, data);
            }
            if (change.type === "modified") {
                if (this.remotePlayers[pid]) {
                    // Update Target for Interpolation
                    const p = this.remotePlayers[pid];
                    p.targetPos.set(data.x, data.y, data.z);
                    p.targetRot = data.ry;
                    p.data = data; // store for HP check
                }
            }
            if (change.type === "removed") {
                this.removeEnemy(pid);
            }
        });

        // Update Leaderboard List
        snapshot.forEach(doc => {
            const d = doc.data();
            leaderboard.push({ name: d.username, kills: d.kills });
        });
        leaderboard.sort((a,b) => b.kills - a.kills);
        
        const list = document.getElementById('leaderboard-list');
        list.innerHTML = leaderboard.map(p => `<li>${p.name}: ${p.kills}</li>`).join('');
    }

    spawnEnemy(id, data) {
        const mesh = new THREE.Mesh(this.enemyGeo, this.enemyMat);
        mesh.position.set(data.x, data.y, data.z);
        
        // Add Floating Name
        // (Simplified: just storing the mesh)
        
        this.scene.add(mesh);
        this.remotePlayers[id] = {
            mesh: mesh,
            targetPos: new THREE.Vector3(data.x, data.y, data.z),
            targetRot: data.ry,
            data: data
        };
    }

    removeEnemy(id) {
        if (this.remotePlayers[id]) {
            this.scene.remove(this.remotePlayers[id].mesh);
            delete this.remotePlayers[id];
        }
    }

    // Called every frame in main loop to smooth movement
    interpolate(delta) {
        for (const id in this.remotePlayers) {
            const p = this.remotePlayers[id];
            // Lerp position (0.1 is smoothing factor)
            p.mesh.position.lerp(p.targetPos, 10 * delta); 
            p.mesh.rotation.y = p.targetRot;
        }
    }

    // Hit Logic
    registerHit(targetId) {
        // Optimistic UI update could happen here
        // Server update
        const targetRef = doc(db, "rooms", this.roomId, "players", targetId);
        const myRef = doc(db, "rooms", this.roomId, "players", this.myId);

        // We assume 10 damage per shot
        updateDoc(targetRef, { hp: increment(-10) });

        // Check if dead (Client side check on shooter, verified by listener)
        // Ideally we'd use a Transaction, but for speed/free tier, we do direct updates
        if (this.remotePlayers[targetId].data.hp <= 10) {
             // Reset enemy (Respawn logic is handled by the victim's client usually, but we can force it)
             updateDoc(targetRef, { hp: 100, x: 0, y: 10, z: 0 }); // Teleport spawn
             updateDoc(myRef, { kills: increment(1) });
             
             // Killfeed
             const feed = document.getElementById('kill-feed');
             feed.innerHTML = `You fragged ${this.remotePlayers[targetId].data.username}`;
             setTimeout(() => feed.innerHTML = "", 2000);
        }
    }
    
    // Check if raycaster hits any enemy
    checkShootHit(raycaster) {
        const intersects = [];
        for (const id in this.remotePlayers) {
            const mesh = this.remotePlayers[id].mesh;
            const hit = raycaster.intersectObject(mesh);
            if (hit.length > 0) {
                this.registerHit(id);
                return; // Hit first target only
            }
        }
    }
}