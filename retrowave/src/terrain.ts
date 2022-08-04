import {
    BufferAttribute,
    Vector3,
    Color,
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry,
    Scene,
} from 'three';
import SimplexNoise from 'simplex-noise';

const seed = `${Date.now()}`;

export class Terrain {

    chunks = new Set<TerrainChunk>();

    constructor(private chunksize = 50) {
    }

    addChunk(chunk: TerrainChunk) {
        this.chunks.add(chunk);
    }

    createChunk(offset: Vector3) {
        const offsetPosition = offset.multiplyScalar(this.chunksize);
        const chunk = new TerrainChunk(this.chunksize, offsetPosition);

        this.addChunk(chunk);
    }

    addTo(scene: Scene) {
        for (const chunk of this.chunks) {
            chunk.mesh.position.z = chunk.offset.z;

            scene.add(chunk.mesh);
        }
    }

    update(speed: number) {
        for (const chunk of this.chunks) {
            chunk.update(speed);
            if (chunk.mesh.position.z > this.chunksize) {
                const skip = this.chunksize * 2;
                chunk.updateOffset(new Vector3(0, 0, -skip));

                chunk.mesh.position.z -= skip;
            }
        }
    }

}

export class TerrainChunk {

    height = 20;
    smoothing = 10;
    segments: number;
    simplex: SimplexNoise;

    mesh: Mesh;
    geometry: PlaneGeometry;
    material: MeshBasicMaterial;

    constructor(
        private size = 50,
        public offset = new Vector3(),
    ) {
        this.size = size;
        this.segments = size / 2;
        this.offset = offset;
        this.simplex = new SimplexNoise(seed);


        this.geometry = new PlaneGeometry(
            this.size,
            this.size,
            this.segments,
            this.segments
        );
        this.setGeometryHeight();

        this.material = new MeshBasicMaterial({ color: new Color(0x0c062a) });

        this.mesh = new Mesh(this.geometry, this.material);
    }

    setGeometryHeight() {
        const vertices = this.geometry.getAttribute('position').array as number[];

        for (let i = 2; i < vertices.length; i += 3) {
            const x = vertices[i - 2] + this.offset.x;
            const y = vertices[i - 1];
            vertices[i] = -y;
            const z = vertices[i] + this.offset.z;

            vertices[i - 1] = this.simplex.noise2D(x / this.smoothing, z / this.smoothing) * this.getHeight(new Vector3(x, y, z));
        }

        this.geometry.setAttribute('position', new BufferAttribute(vertices, 3));
        this.geometry.computeVertexNormals();
    }

    getHeight(position: Vector3) {
        return Math.min(Math.abs(position.x) * 0.1, this.height);
    }

    addTo(scene: Scene) {
        scene.add(this.mesh);
    }

    update(speed: number) {
        this.mesh.position.z = this.mesh.position.z + speed;
    }

    updateOffset(offset: Vector3) {
        this.offset.add(offset);

        this.updateGeometry();
    }

    updateGeometry() {
        const vertices = this.geometry.getAttribute('position').array as number[];

        for (let i = 2; i < vertices.length; i += 3) {
            const x = vertices[i - 2] + this.offset.x;
            const y = vertices[i - 1];
            const z = vertices[i] + this.offset.z;

            vertices[i - 1] = this.simplex.noise2D(x / this.smoothing, z / this.smoothing) * this.getHeight(new Vector3(x, y, z));
        }

        this.geometry.setAttribute('position', new BufferAttribute(vertices, 3));
        this.geometry.computeVertexNormals();
    }
}