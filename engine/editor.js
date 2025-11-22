import {
	GridHelper
} from 'three';
import { G } from '../G.js';

export class Editor {
	
	constructor() {
		this.#setupEditorGrid();
	}
	
	#setupEditorGrid() {
		this.grid = new GridHelper( 10 , 10 );
		G.scene.add( this.grid );			
	}
	
	update() {
	}
	
}

export const editorInit = () => {
	
}