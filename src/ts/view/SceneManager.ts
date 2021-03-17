declare const THREE: any;
declare const THREEx: any;

import {request} from "node:http";
import {SceneLoader} from "./SceneLoader";

export class SceneManager
{
	private _canvas: HTMLCanvasElement = document.getElementById("myCanvas") as HTMLCanvasElement;
	private _scene: any;//THREE.Scene;
	private _camera: any;//THREE.Camera;
	private _renderer: any;//THREE.WebGLRenderer;
	private _sceneLoader: SceneLoader;

	private _clock: any;//THREE.Clock;
	private _deltaTime: number;
	private _arToolkitSource: any;
	private _arToolkitContext: any;
	private _markerControls: any;

	private _markerRoot: any;//THREE.Group;
	private _audio: HTMLAudioElement;

	constructor()
	{
		this._audio = document.createElement("audio");
		this._audio.src = "assets/audio/cantina.mp3";
		this._scene = new THREE.Scene();
		this._camera = new THREE.Camera();
		this._clock = new THREE.Clock();

		this.init();
	}

	private async init()
	{
		this.initLights();
		this.initRenderer();
		window.addEventListener("arjs-video-loaded", () =>
		{
			// TODO: this is a dirty hack, although it's pretty much the same as in the official example..:
			// https://github.com/AR-js-org/AR.js/blob/master/three.js/examples/nft.html
			setTimeout(() =>
			{
				this.onWindowResize();
			}, 1000);
		});
		await this.initAR();
		this.initMeshes();
		this.animate(0);
	}

	private initLights()
	{
		const light1 = new THREE.AmbientLight(0xFFFFFF, 0.1);

		const light2 = new THREE.DirectionalLight(0xFFFFFF, 0.1);
		light2.position.set(0.5, 0, 0.866); // ~60ยบ

		const light3 = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.8);

		this._scene.add(light1, light2, light3);
	}

	private initAR()
	{
		return new Promise<void>((resolve, reject) =>
		{
			this._arToolkitSource = new THREEx.ArToolkitSource({
				sourceType: "webcam"
			});
			this._arToolkitSource.init(() =>
			{
				resolve();
			});

			this._arToolkitContext = new THREEx.ArToolkitContext({
				cameraParametersUrl: "assets/data/camera_para.dat",
				detectionMode: "mono"
			});

			this._arToolkitContext.init(onCompleted =>
			{
				this._camera.projectionMatrix.copy(this._arToolkitContext.getProjectionMatrix());
			});
		});
		
	}

	private initMeshes()
	{
		this._markerRoot = new THREE.Group();
		this._scene.add(this._markerRoot);
		this._markerControls = new THREEx.ArMarkerControls(this._arToolkitContext, this._markerRoot, {
			type: "pattern",
			patternUrl: "assets/data/starWars.patt"
		})
		this._sceneLoader = new SceneLoader(this, "assets/models/stormtrooper.glb");
	}

	private initRenderer()
	{
		const contextAttributes = {
			alpha: true,
			antialias: true
		};
		const context = this._canvas.getContext("webgl2", contextAttributes) || this._canvas.getContext("experimental-webgl2", contextAttributes);
		this._renderer = new THREE.WebGLRenderer({
			canvas: this._canvas,
			context: context as WebGL2RenderingContext,
			...contextAttributes
		});
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setClearColor(0xECF8FF, 0);
		this._renderer.outputEncoding = THREE.GammaEncoding;

		this._renderer.getContext().canvas.addEventListener("webglcontextlost", this.onContextLost);

		window.addEventListener("resize", this.onWindowResize);
	}

	private onWindowResize = () =>
	{
		this._arToolkitSource.onResizeElement();
		this._arToolkitSource.copyElementSizeTo(this._canvas);
	};

	private onContextLost = (event: Event) =>
	{
		event.preventDefault();

		alert("Unfortunately WebGL has crashed. Please reload the page to continue!");
	};

	public get scene()
	{
		return this._scene;
	}

	public get markerRoot()
	{
		return this._markerRoot;
	}

	private update = (time: number) =>
	{
		this._deltaTime = this._clock.getDelta();
		if (this._arToolkitSource.ready)
		{
			this._arToolkitContext.update(this._arToolkitSource.domElement);
		}

		if (this._sceneLoader.mixer)
		{
			this._sceneLoader.mixer.update(this._deltaTime);
		}

		if (this._markerRoot.visible)
		{
			this._audio.play();
		}
		else
		{
			this._audio.pause();
		}

		this._renderer.render(this._scene, this._camera);
	};

	private animate = (time: number) =>
	{
		this.update(time);
		this._renderer.setAnimationLoop(this.update);
	};
}