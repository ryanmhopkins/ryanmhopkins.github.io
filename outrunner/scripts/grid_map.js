import * as THREE from '../lib/three/src/Three.js';

export class GridMap {
  constructor(scene, params) {
    this.scene = scene;
    this.depth = params.depth;
    this.width = params.width;
    this.depthStep = params.depthStep;
    this.widthStep = params.widthStep;

    this.noiseGenerator = new SimplexNoise();
    this.noiseFactor = 1.0;

    // Chunck size is number of line segments * 2 point per line * 3 floats (x,y,z)
    const numDepth = this.depth / this.depthStep;
    const numWidth = this.width / this.widthStep;
    const numSegmentsInChunk = ((numDepth+1)*numWidth + (numWidth+1)*numDepth);
    this.chunk_size = numSegmentsInChunk * 2 * 3;


    this.chunks = [];
    this.numChunksGenerated = 0;
    const maxChunks = 10;
    for (let cid = 0; cid < maxChunks; ++cid) {
      this._pushChunks(cid * this.depth);
    }
  }

  _getHeight(x, y) {
    return this.noiseFactor * this.noiseGenerator.noise2D(
        this.depth * this .numChunksGenerated + x,
        y);
  }

  _pushChunks(baseDepth) {
    const vertices = [];
    // Main part of grid
    for (let i = 0; i < this.depth; i+=this.depthStep) {
      for (let j = -this.width/2; j < this.width/2; j+=this.widthStep) {
        vertices.push(j, this._getHeight(i, j), -i);
        vertices.push(j+this.widthStep, this._getHeight(i, j+this.widthStep), -i);

        const nextDepth = i+this.depthStep;
        vertices.push(j, this._getHeight(i, j), -i);
        vertices.push(j, this._getHeight(nextDepth, j), -nextDepth);
      }
    };

    // Cap off the ends
    for (let i = 0; i < this.depth; i+=this.depthStep) {
      const nextDepth = i+this.depthStep;
      const endWidth = this.width/2;
      vertices.push(endWidth, this._getHeight(i, endWidth), -i);
      vertices.push(endWidth, this._getHeight(nextDepth, endWidth), -nextDepth);
    }

    for (let j = -this.width/2; j < this.width/2; j+=this.widthStep) {
      const nextWidth = j+this.widthStep;
      const endDepth = this.depth;
      vertices.push(j, this._getHeight(endDepth, j), -endDepth);
      vertices.push(nextWidth, this._getHeight(endDepth, nextWidth), -endDepth);
    }

    const horizontalGeometry = new THREE.BufferGeometry(this.chunk_size);
    horizontalGeometry.setAttribute('position',
        new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.LineBasicMaterial({
      color: 0xeb34e1,
      linewidth: 2,
    });

    const chunk = new THREE.LineSegments(horizontalGeometry, material);
    chunk.position.z = -baseDepth;
    this.chunks.push(chunk);
    this.scene.add(chunk);
    ++this.numChunksGenerated;
  }

  _popChunks() {
    const front = this.chunks.shift();
    this.scene.remove(front);
  }


  update() {
    this.chunks.forEach(function(chunk) {
      chunk.position.z += 0.15;
    });

    if (this.chunks.length > 0) {
      const front = this.chunks[0];

      if (front.position.z > 4*this.depth) {
        this._popChunks();
        const back = this.chunks[this.chunks.length-1];
        this._pushChunks(-back.position.z + this.depth);
      }
    }
  }
}
