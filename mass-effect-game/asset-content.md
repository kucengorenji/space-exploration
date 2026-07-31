# 🎨 3D ASSET & MODEL MODULARITY GUIDE (`asset-content.md`)

Semua model 3D dalam game ini (Kapal Angkasa, Kendaraan Darat, Pohon/Flora, dan Elemen Biome) telah dirancang menggunakan **Modular Factory Pattern** yang dapat ditukar (*switchable*), ditambah (*extensible*), dan dikustomisasi dengan mudah tanpa menyentuh logika engine utama (`spaceEngine.js` & `surfaceEngine.js`).

---

## 🛠️ Arsitektur Central Model Registry

Seluruh registrasi dan pembuatan model 3D dipusatkan di file:
`src/factories/modelRegistry.js`

File ini mengekspor 4 Registri Utama & Helper Functions:

```
src/factories/modelRegistry.js
├── SHIP_MODELS          (Registri Model Kapal Angkasa)
├── VEHICLE_MODELS       (Registri Model Kendaraan Darat)
├── TREE_MODELS          (Registri Model Pohon / Flora)
├── registerShipModel()  (Fungsi untuk mendaftarkan kapal baru)
├── registerVehicleModel()(Fungsi untuk mendaftarkan kendaraan baru)
├── registerTreeModel()   (Fungsi untuk mendaftarkan pohon baru)
├── createShipMesh()     (Factory untuk membuat Mesh Kapal)
├── createVehicleMesh()  (Factory untuk membuat Mesh Kendaraan)
└── createTreeMesh()     (Factory untuk membuat Mesh Pohon)
```

---

## 🚀 1. Cara Menambahkan Model Kapal Angkasa Baru (`Ship`)

### Langkah A: Daftarkan Data Kapal di `src/data/ships.js`
```javascript
export const SHIPS_DATA = {
    // ... kapal lama ...
    stealth_frigate: {
        name: 'SSV Stealth Frigate',
        class: 'Stealth Scout',
        maxSpeed: 1.6,
        turnRate: 0.045,
        laserColor: 0x06b6d4,
        description: 'Advanced reconnaissance vessel with active optical cloaking.'
    }
};
```

### Langkah B: Tambahkan Generator Model 3D di `src/factories/modelRegistry.js`
```javascript
import { registerShipModel } from './modelRegistry.js';
import * as THREE from 'three';

registerShipModel('stealth_frigate', () => {
    const group = new THREE.Group();
    
    // Buat Three.js Mesh / Geometry / Material di sini
    const hullGeo = new THREE.ConeGeometry(1.2, 8.0, 3);
    hullGeo.rotateX(Math.PI / 2);
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.9 });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    group.add(hull);

    return group;
});
```

---

## 🚜 2. Cara Menambahkan Model Kendaraan Darat Baru (`Vehicle`)

### Langkah A: Daftarkan Data Kendaraan di `src/data/surfaceVehicles.js`
```javascript
export const SURFACE_VEHICLES_DATA = {
    // ... kendaraan lama ...
    hover_bike: {
        name: 'Skyblade Hoverbike',
        type: 'Light Recon',
        maxSpeed: 1.25,
        boostEnergy: 120,
        cannonDamage: 15,
        description: 'Ultra-fast single-pilot hoverbike for rapid terrain exploration.'
    }
};
```

### Langkah B: Daftarkan Model 3D di `src/factories/modelRegistry.js`
```javascript
import { registerVehicleModel } from './modelRegistry.js';

registerVehicleModel('hover_bike', () => {
    const group = new THREE.Group();
    // Buat geometri & material kendaraan
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 4, 8), new THREE.MeshStandardMaterial({ color: 0x06b6d4 }));
    group.add(body);

    return {
        group: group,
        body: body,
        wheels: [],      // array wheel meshes jika kendaraan roda
        maxSpeed: 1.25   // kecepatan maksimum
    };
});
```

---

## 🌲 3. Cara Menambahkan Variasi Pohon & Element Biome Baru

Daftarkan tipe pohon baru di `TREE_MODELS` pada `src/factories/modelRegistry.js`:

```javascript
import { registerTreeModel } from './modelRegistry.js';

registerTreeModel('alien_crystal_tree', (materials) => {
    const group = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.7, 6, 6), materials.trunkMat);
    trunk.position.y = 3;
    group.add(trunk);

    const crystalCap = new THREE.Mesh(new THREE.OctahedronGeometry(2.5, 0), new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x7e22ce, emissiveIntensity: 0.8 }));
    crystalCap.position.y = 6.5;
    group.add(crystalCap);

    return group;
});
```
Lalu di `src/data/biomes.js`, planet mana saja bisa menggunakan `treeType: 'alien_crystal_tree'`.

---

## 📦 4. Integrasi Model External GLTF / GLB (Optional 3D Assets)

Jika di kemudian hari kamu ingin menggunakan file `.gltf` atau `.glb` dari Blender / Mixamo / Sketchfab:

1. Simpan file `.glb` di folder `public/models/ships/` atau `public/models/vehicles/`.
2. Gunakan `GLTFLoader` dari Three.js di `modelRegistry.js`:

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

export function loadExternalGLTFModel(url) {
    return new Promise((resolve, reject) => {
        loader.load(url, (gltf) => {
            resolve(gltf.scene);
        }, undefined, reject);
    });
}
```

---

## 📊 Summary Matriks Aksesibilitas Model

| Kategori Asset | File Katalog Data | File Registry 3D Model | Engine yang Mengonsumsi |
|----------------|-------------------|------------------------|-------------------------|
| **Kapal Angkasa** | `src/data/ships.js` | `src/factories/modelRegistry.js` (`SHIP_MODELS`) | `src/space/spaceEngine.js` |
| **Kendaraan Darat** | `src/data/surfaceVehicles.js` | `src/factories/modelRegistry.js` (`VEHICLE_MODELS`) | `src/surface/surfaceEngine.js` |
| **Pohon / Flora** | `src/data/biomes.js` | `src/factories/modelRegistry.js` (`TREE_MODELS`) | `src/surface/surfaceEngine.js` |
| **Elemen Biome** | `src/data/biomes.js` | `src/surface/surfaceEngine.js` / Registry | `src/surface/surfaceEngine.js` |
