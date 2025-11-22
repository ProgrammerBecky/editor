import { editorFilePanel } from './main/editorFilePanel.js';

let engineWorker;

const getWorkerScript = async ( url ) => {
	
	const importMapFile = await fetch( new URL( 'engine/importmap.js' , import.meta.url ) );
	const importMap = await importMapFile.json();
	
	for( const i in importMap.imports ) {
		importMap.imports[i] = new URL( importMap.imports[i] , import.meta.url ).href;
	}
	
	return new Promise( (resolve) => {
		const workerUrl = new URL(url, import.meta.url).href;

		resolve( URL.createObjectURL( new Blob(
			[
				`
					importScripts("${new URL( 'node_modules/es-module-shims/dist/es-module-shims.js' , import.meta.url).href}");
					importShim.addImportMap(${JSON.stringify( importMap )});
					importShim('${workerUrl}')
						.catch(e => setTimeout(() => { throw e; }));
				`			
			],
			{
				type: 'module'
			}
		)) );
	})
	
};


const initEngineWorker = () => {
	const canvas = document.createElement('canvas');
	const offscreenCanvas = canvas.transferControlToOffscreen();
	canvas.setAttribute('id','ThreeD');
	document.body.appendChild( canvas );

	engineWorker.postMessage(
		{
			type: 'init',
			canvas: offscreenCanvas,
			params: {
				width: window.innerWidth,
				height: window.innerHeight
			}
		},
		[offscreenCanvas]
	);	
}

window.addEventListener('DOMContentLoaded', async () => {
	engineWorker = new Worker(
		await getWorkerScript('engine.js'),
	);

	engineWorker.addEventListener( 'message' , message => {
		const { type } = message.data;

		if( type === 'loaded' ) initEngineWorker();
		
	});
	
	window.addEventListener( 'resize' , () => {
		engineWorker.postMessage({
			type: 'window.resize',
			params: {
				width: window.innerWidth,
				height: window.innerHeight
			}
		});
	});
	
	editorFilePanel();
});