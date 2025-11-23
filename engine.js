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
	BufferGeometry,
	BufferAttribute,
	Mesh,
	MeshBasicMaterial,
} from 'three';
import { G } from './G.js';
import { init } from './engine/init.js';
import { Editor } from './engine/editor.js';

imagePolyfill( ImageLoader );

self.onmessage = async (e) => {
	
	const { type , params } = e.data;
	if( e.data.canvas ) e.data.canvas = canvasPolyfill( e.data.canvas );

  if( type === 'init' ) {
		init( params , e.data.canvas );
		G.editor = new Editor();
		
		// Load texture inside worker
		const tex = G.texture.load( new URL('./assets/test.jpg', import.meta.url).href );

		function loop() {
			G.renderer.render(G.scene, G.camera);
			requestAnimationFrame(loop);
			
			if( G.editor ) G.editor.update();
		}
		loop();		
	}
	else if( type === 'window.resize' ) {
		const { width , height } = params;
		
		G.camera.aspect = width / height;
		G.camera.updateProjectionMatrix();
		
		G.renderer.setSize( width , height );
	}
	else if( type === 'mesh-geometry-attribute' ) {
		let object;
		
		G.scene.traverse( child => {
			if( child.uuid === params.uuid ) object = child;
		});
		
		if( ! object ) {
			const geometry = new BufferGeometry();
			const material = new MeshBasicMaterial({color:0x0000ff});
			
			object = new Mesh( geometry , material );
			object.uuid = params.uuid;
			G.scene.add( object );
		}
		
		object.geometry.setAttribute( params.attribute , new BufferAttribute( new Float32Array( params.array ) , params.itemSize ) );
		object.geometry.attributes[ params.attribute ].needsUpdate = true;
	}
	else if (type === 'mesh-geometry-index') {
    let object;
    G.scene.traverse(child => {
        if (child.uuid === params.uuid) object = child;
    });

    if (!object) {
			const geometry = new THREE.BufferGeometry();
			object = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x0000ff }));
			object.uuid = params.uuid;
			G.scene.add(object);
    }

    object.geometry.setIndex(params.array);
	}
	
};

self.postMessage({ type: 'loaded' });