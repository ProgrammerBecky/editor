import {
	GridHelper
} from 'three';
import { G } from './G.js';

export const editorInit = () => {
	const grid = new GridHelper( 10 , 10 );
	G.scene.add( grid );
}