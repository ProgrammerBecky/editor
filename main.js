import Engine from '/engine.js?worker';
const engine = new Engine();

const canvas = document.createElement('canvas');
const offscreenCanvas = canvas.transferControlToOffscreen();
canvas.setAttribute('id','ThreeD');
document.body.appendChild( canvas );

engine.postMessage(
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