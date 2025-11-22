self.addEventListener('error', (e) => {
  console.error( 'Caught in Engine Worker:', e.message, e.filename, e.lineno, e.colno );
});

self.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection in Engine Worker:', e.reason);
});

import { imagePolyfill } from './engine/image-polyfill.js';
import { canvasPolyfill } from './engine/canvas-polyfill.js';
import {
	ImageLoader,
	
	BoxGeometry,
	MeshBasicMaterial,
	Mesh	
} from 'three';
import { G } from './G.js';
import { init } from './engine/init.js';
import { editorInit } from './engine/editor.js';

imagePolyfill( ImageLoader );

self.onmessage = async (e) => {
	console.log( e.data );
	
	const { type , params } = e.data;
	if( e.data.canvas ) e.data.canvas = canvasPolyfill( e.data.canvas );

  if( type === 'init' ) {
		init( params , e.data.canvas );
		editorInit();
		
	// Load texture inside worker
	const tex = G.texture.load( new URL('./assets/test.jpg', import.meta.url).href );

	const geo = new BoxGeometry( 1,1,1 );
	const mat = new MeshBasicMaterial({
		map: tex
	});
	const mesh = new Mesh(geo, mat);
	G.scene.add( mesh );
		
    function loop() {
      mesh.rotation.y += 0.01;
      G.renderer.render(G.scene, G.camera);
      requestAnimationFrame(loop);
    }
    loop();		
	}
	
};

self.postMessage({ type: 'loaded' });