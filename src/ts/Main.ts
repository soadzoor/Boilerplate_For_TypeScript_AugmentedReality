import {SceneManager} from "./view/SceneManager";

class Main
{
	private _sceneManager: SceneManager;

	constructor()
	{
		this._sceneManager = new SceneManager();
	}
}

const main = new Main();