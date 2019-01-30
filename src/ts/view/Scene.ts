///<reference path='./SceneLoader.ts'/>

declare const THREEx: any;
class Scene
{
	private _canvas: HTMLCanvasElement;
	private _scene: THREE.Scene;
	private _camera: THREE.Camera;
	private _renderer: THREE.WebGLRenderer;
	private _sceneLoader: SceneLoader;

	private _clock: THREE.Clock;
	private _deltaTime: number;
	private _arToolkitSource: any;
	private _arToolkitContext: any;
	private _markerControls: any;

	private _markerRoot: THREE.Group;

	constructor()
	{
		this._canvas = <HTMLCanvasElement>document.getElementById('myCanvas');
		this._scene = new THREE.Scene();
		this._camera = new THREE.Camera();
		this._clock = new THREE.Clock();

		this.initLights();
		this.initAR();
		this.initRenderer();
		this.initMeshes();
		this.onWindowResize();
		this.animate(0);
	}

	private initLights()
	{
		const light1  = new THREE.AmbientLight(0xFFFFFF, 0.1);

		const light2  = new THREE.DirectionalLight(0xFFFFFF, 0.1);
		light2.position.set(0.5, 0, 0.866); // ~60ยบ

		const light3 = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.8);

		this._scene.add(light1, light2, light3);
	}

	private initAR()
	{
		this._arToolkitSource = new THREEx.ArToolkitSource({sourceType: 'webcam'});
		this._arToolkitSource.init(onReady =>
		{
			this.onWindowResize();
		});

		this._arToolkitContext = new THREEx.ArToolkitContext({
			cameraParametersUrl: 'assets/data/camera_para.dat',
			detectionMode: 'mono'
		});

		this._arToolkitContext.init(onCompleted =>
		{
			this._camera.projectionMatrix.copy(this._arToolkitContext.getProjectionMatrix());
		});
	}

	private initMeshes()
	{
		this._markerRoot = new THREE.Group();
		this._scene.add(this._markerRoot);
		this._markerControls = new THREEx.ArMarkerControls(this._arToolkitContext, this._markerRoot, {
			type: 'pattern',
			patternUrl: 'assets/data/starWars.patt'
		})
		this._sceneLoader = new SceneLoader(this, `assets/models/stormtrooper.glb`);
	}

	private initRenderer()
	{
		this._renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
			canvas: this._canvas
		});
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setClearColor(0xECF8FF, 0);
		this._renderer.gammaOutput = true;

		this._renderer.context.canvas.addEventListener('webglcontextlost', this.onContextLost);

		window.addEventListener('resize', this.onWindowResize);
	}

	private onWindowResize = () =>
	{
		this._arToolkitSource.onResizeElement();
		this._arToolkitSource.copyElementSizeTo(this._canvas);
	};

	private onContextLost = (event: Event) =>
	{
		event.preventDefault();

		alert('Unfortunately WebGL has crashed. Please reload the page to continue!');
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

		this._renderer.render(this._scene, this._camera);
	};

	private animate = (time: number) =>
	{
		this.update(time);
		this._renderer.setAnimationLoop(this.update);
	};
}