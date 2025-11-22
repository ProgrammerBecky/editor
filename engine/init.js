import {
	WebGLRenderer,
	Scene,
	PerspectiveCamera,
	TextureLoader,
} from 'three';
import { G } from './G.js';

export const init = ( params , canvas ) => {
	
	const {
		width,
		height,
	} = params;
	
	G.renderer = new WebGLRenderer({
		canvas,
		antialias: true
	});

	G.renderer.setSize( width, height );

	G.scene = new Scene();
	G.camera = new PerspectiveCamera(
		60,
		width / height,
		0.1,
		1000
	);
	G.camera.position.set(0, 0, 5);
	
	G.texture = new TextureLoader();
}