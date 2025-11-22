// worker.js
import { imagePolyfill } from './engine/image-polyfill.js';
import { canvasPolyfill } from './engine/canvas-polyfill.js';
import {
	ImageLoader,
	
	BoxGeometry,
	MeshBasicMaterial,
	Mesh	
} from 'three';
import { G } from '/engine/G.js';
import { init } from './engine/init.js';

imagePolyfill( ImageLoader );



self.onmessage = async (e) => {
	console.log( e.data );
	
	const { type , params } = e.data;
	if( e.data.canvas ) e.data.canvas = canvasPolyfill( e.data.canvas );

  if( type === 'init' ) {
		init( params , e.data.canvas );
		
	// Load texture inside worker
	const tex = G.texture.load( '/assets/test.jpg' );

	const geo = new BoxGeometry( 1,1,1 );
	const mat = new MeshBasicMaterial({
		map: tex
	});
	const mesh = new Mesh(geo, mat);
	G.scene.add( mesh );
	G.camera.lookAt( mesh.position.x , mesh.position.y , mesh.position.z );		
		
    function loop() {
      mesh.rotation.y += 0.01;
      G.renderer.render(G.scene, G.camera);
      requestAnimationFrame(loop);
    }
    loop();		
	}
	
};
