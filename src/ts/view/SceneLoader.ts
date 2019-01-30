///<reference path='../../../types/three-gltfloader.d.ts'/>
///<reference path='../../../types/three-dracoloader.d.ts'/>
///<reference path='./Scene.ts'/>

class SceneLoader
{
	private _scene: Scene;
	private _url: string;
	private _envMap: THREE.CubeTexture;
	private _mixer: THREE.AnimationMixer;
	
	constructor(scene: Scene, url: string)
	{
		this._scene = scene;
		this._url = url;

		const cubeTextureLoader = new THREE.CubeTextureLoader();
		cubeTextureLoader.setPath(`assets/images/beach/`);
		this._envMap = cubeTextureLoader.load([
			'posx.jpg', 'negx.jpg',
			'posy.jpg', 'negy.jpg',
			'posz.jpg', 'negz.jpg'
		]);

		this.loadScene(this._url);
	}

	private loadScene = (url: string) =>
	{
		DRACOLoader.setDecoderPath('libs/draco/gltf/');
		const gltfLoader = new GLTFLoader();
		gltfLoader.setDRACOLoader(new DRACOLoader());

		gltfLoader.load(url, (gltf: any) =>
		{
			this.onLoad(gltf);
		});
	};

	public get mixer()
	{
		return this._mixer;
	}

	private onLoad = (gltf: any) =>
	{
		const object = gltf.scene;
		object.traverse((node) =>
		{
			if (node.isMesh)
			{
				node.material.envMap = this._envMap;
			}
		});

		const scaleVal = 0.5;
		object.scale.set(scaleVal, scaleVal, scaleVal);
		object.rotation.x = Math.PI / 2;

		this._mixer = new THREE.AnimationMixer(object);
		this._mixer.clipAction(gltf.animations[0]).play();

		this._scene.markerRoot.add(object);
	};
}