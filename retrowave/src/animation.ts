import {
    Float32BufferAttribute,
    Vector3,
    BackSide,
    DoubleSide,
    Color,
    Fog,
    WebGLRenderer,
    Scene,
    PerspectiveCamera,
    Clock,
    BufferGeometry,
    PlaneGeometry,
    SphereGeometry,
    Mesh,
    Points,
    MeshBasicMaterial,
    PointsMaterial,
    ShaderMaterial,
    ReinhardToneMapping,
} from "three";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
// import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';

import { Terrain } from './terrain'

export class RetroSceneAnimation {

    canvas: HTMLCanvasElement;

    pink = 0xbc1974;
    skyColor = 0x1b073b;
    groundColor = 0x0c062a;

    FOV = 45;
    NEAR = 1;
    FAR = 350;

    terrain: Terrain;

    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    composer: EffectComposer;
    clock = new Clock();
    scene = new Scene();

    animationId: number | null = null;

    constructor(canvas: HTMLCanvasElement) {

        this.canvas = canvas;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const aspect = width / height;

        this.scene.background = new Color(this.skyColor);
        this.scene.fog = new Fog(this.pink, 1, this.FAR / 2);

        this.scene.add(this.createSkydome());

        this.scene.add(this.createSunset());

        this.createStars().map(star => this.scene.add(star));

        this.camera = new PerspectiveCamera(this.FOV, aspect, this.NEAR, this.FAR);
        this.camera.position.set(0, 6, 30);

        this.scene.add(this.camera);

        this.terrain = new Terrain(this.FAR);
        this.terrain.createChunk(new Vector3());
        this.terrain.createChunk(new Vector3(0, 0, -1));

        this.terrain.addTo(this.scene);

        this.renderer = new WebGLRenderer({ antialias: true, canvas });
        this.renderer.setPixelRatio(window.devicePixelRatio || 1);
        this.renderer.toneMapping = ReinhardToneMapping;
        this.renderer.toneMappingExposure = Math.pow(1, 4.0);

        const renderPass = new RenderPass(this.scene, this.camera);

        // const bloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 1.5, 0, 0.8);
        // bloomPass.threshold = 0;
        // bloomPass.strength = 1.5;
        // bloomPass.radius = 0.8;

        // const glitchPass = new GlitchPass();

        const effectFilm = new FilmPass(
            0.2, // noise intensity
            0.75, // scanline intensity
            2048, // scanline count
            0 // grayscale
        );

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderPass);
        // composer.addPass(bloomPass);
        this.composer.addPass(effectFilm);
        // composer.addPass(glitchPass);

    }

    createSkydome() {

        const vertexShader = `
            varying vec3 vWorldPosition;
    
            void main() {
    
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
    
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    
            }
        `;
        const fragmentShader = `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
    
            varying vec3 vWorldPosition;
    
            void main() {
    
                float h = normalize(vWorldPosition + offset).y;
                float w = normalize(vWorldPosition).x;
                gl_FragColor = vec4(
                    mix(
                        bottomColor, 
                        topColor,
                        max(h / exponent, 0.0)
                    ),
                    1.0
                );
    
            }
        `;
        const uniforms = {
            "topColor": { value: new Color(this.skyColor) },
            "bottomColor": { value: new Color(this.pink) },
            "offset": { value: -4 },
            "exponent": { value: 0.2 }
        };

        const skyGeometry = new SphereGeometry(this.FAR / 2, 32, 15);
        const skyMataterial = new ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            side: BackSide
        });

        return new Mesh(skyGeometry, skyMataterial);

    }

    createGround() {
        const geometry = new PlaneGeometry(this.FAR, this.FAR, 100, 100);
        const material = new MeshBasicMaterial({ color: this.groundColor });
        material.side = DoubleSide;
        const mesh = new Mesh(geometry, material);
        mesh.rotateX(Math.PI / 2); // 90deg

        return mesh;
    }

    createSunset(size = 40) {

        const geometry = new SphereGeometry(size, size, 32);
        const material = new MeshBasicMaterial({ color: this.pink });
        const mesh = new Mesh(geometry, material);

        mesh.position.set(0, size * 0.35, -this.FAR / 1.8);

        return mesh;
    }

    createStars() {
        const geometry = new BufferGeometry();

        const vertices = [];
        const vertex = new Vector3();

        for (let i = 0; i < 2000; i++) {
            vertex.x = Math.random() * 2 - 1;
            vertex.y = Math.random() * 2 - 1;
            vertex.z = Math.random() * 2 - 1;
            vertex.multiplyScalar(3);

            vertices.push(vertex.x, vertex.y, vertex.z);
        }

        geometry.setAttribute(
            "position",
            new Float32BufferAttribute(vertices, 3)
        );

        const starsMaterials = [
            0x555555,
            0x333333,
            0x3a3a3a,
            // 0x1a1a1a
        ].reduce((materials, color) => {
            materials.push(
                new PointsMaterial({
                    color,
                    size: 2,
                    sizeAttenuation: false,
                }),
                new PointsMaterial({
                    color,
                    size: 1,
                    sizeAttenuation: false,
                }),
            );
            return materials;
        }, [] as PointsMaterial[]);

        const materialCount = starsMaterials.length;

        const stars = []
        for (let i = 10; i < 20; i++) {
            const points = new Points(
                geometry,
                starsMaterials[i % materialCount]
            );

            points.rotation.x = Math.random() * 2;
            points.rotation.y = Math.random() * 2;
            points.rotation.z = Math.random() * 2;
            points.scale.setScalar(i * 10);

            points.matrixAutoUpdate = false;
            points.updateMatrix();

            stars.push(points);
        }

        return stars;
    }

    resize(width: number, height: number) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
    }

    render() {
        this.terrain.update(0.5);

        this.composer.render();
        // this.renderer.render(this.scene, this.camera);

        this.animationId = requestAnimationFrame(() => this.render());
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

}
