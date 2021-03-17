declare const THREE: any;

import {SceneManager} from "./SceneManager";

export class SceneLoader
{
	private _sceneManager: SceneManager;
	private _url: string;
	private _envMap: any;//THREE.CubeTexture;
	private _mixer: any;//THREE.AnimationMixer;
	
	constructor(sceneManager: SceneManager, url: string)
	{
		this._sceneManager = sceneManager;
		this._url = url;

		const cubeTextureLoader = new THREE.CubeTextureLoader();
		cubeTextureLoader.setPath("assets/images/beach/");
		this._envMap = cubeTextureLoader.load([
			"posx.jpg", "negx.jpg",
			"posy.jpg", "negy.jpg",
			"posz.jpg", "negz.jpg"
		]);

		this.loadScene(this._url);
	}

	private loadScene = (url: string) =>
	{
		const gltfLoader = new THREE.GLTFLoader();

		gltfLoader.load(url, (gltf: any) =>
		{
			this.onLoad(gltf);
		});
	};

	private onLoad = (gltf: any) =>
	{
		const object = gltf.scene;
		object.traverse((node: any) =>
		{
			if (node instanceof THREE.Mesh)
			{
				node.material.envMap = this._envMap;
			}
		});

		const scaleVal = 0.5;
		object.scale.set(scaleVal, scaleVal, scaleVal);
		object.rotation.x = Math.PI / 2;

		this._mixer = new THREE.AnimationMixer(object);
		this._mixer.clipAction(gltf.animations[0]).play();

		this._sceneManager.markerRoot.add(object);
	};

	public get mixer()
	{
		return this._mixer;
	}
}