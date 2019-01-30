/// <reference path="../../../types/three-gltfloader.d.ts" />
/// <reference path="../../../types/three-dracoloader.d.ts" />
declare class SceneLoader {
    private _scene;
    private _url;
    private _envMap;
    private _mixer;
    constructor(scene: Scene, url: string);
    private loadScene;
    readonly mixer: THREE.AnimationMixer;
    private onLoad;
}
declare const THREEx: any;
declare class Scene {
    private _canvas;
    private _scene;
    private _camera;
    private _renderer;
    private _sceneLoader;
    private _clock;
    private _deltaTime;
    private _arToolkitSource;
    private _arToolkitContext;
    private _markerControls;
    private _markerRoot;
    constructor();
    private initLights;
    private initAR;
    private initMeshes;
    private initRenderer;
    private onWindowResize;
    private onContextLost;
    readonly scene: THREE.Scene;
    readonly markerRoot: THREE.Group;
    private update;
    private animate;
}
declare class Model {
    constructor();
}
declare class Main {
    static instance: Main;
    static getInstance(): Main;
    private _model;
    private _scene;
    constructor();
    readonly scene: Scene;
    readonly model: Model;
}
declare const main: Main;
