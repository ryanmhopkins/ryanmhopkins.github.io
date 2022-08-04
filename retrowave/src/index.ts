import { RetroSceneAnimation } from './animation';

const template = document.createElement("template");
template.innerHTML = /*html*/`
    <style>
        :host {
            display: block;
            height: 100%;
            width: 100%;
        }
        canvas {
            position: relative;
            height: 100%;
            width: 100%;
        }
    </style>
    <canvas id="canvas"></canvas>
`;

class RetroScene extends HTMLElement {

    private shadow: ShadowRoot;
    private scene: RetroSceneAnimation | undefined;

    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.shadow.appendChild(template.content.cloneNode(true));
        const host = this.shadow.host;
        const canvas = this.shadow.getElementById("canvas") as HTMLCanvasElement;
        this.scene = new RetroSceneAnimation(canvas);

        window.addEventListener('resize', () => {
            this.scene?.resize(host.clientWidth, host.clientHeight);
        })

        this.scene.resize(host.clientWidth, host.clientHeight);
        this.scene.render();
    }

    disconnectedCallback() {
        this.scene?.stop();
        this.scene = undefined;
    }

}

customElements.define("retro-scene", RetroScene);
