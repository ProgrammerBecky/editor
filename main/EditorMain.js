import { EditorFilePanel } from './EditorFilePanel.js';
import { EditorScenePanel } from './EditorScenePanel.js';

export class EditorMain {
	
	#maxPanels = 6;
	panels = [];
	uiOpen = [];
	
	constructor() {
		
		this.change = this.change.bind(this);
		this.#createPanelSelectors();
		
	}
	
	change(e) {
		const selector = e.target;
		const panelId = e.target.getAttribute( 'data-panel-id' );
		const panelSelection = e.target.value;
		
		let uiClass;
		if( panelSelection === 'Scene' ) {
			uiClass = new EditorScenePanel( panelId );
		}
		else if( panelSelection === 'FilePanel' ) {
			uiClass = new EditorFilePanel( panelId );
		}
		
		if( this.uiOpen[ panelId ] ) {
			this.uiOpen[ panelId ].destroy();
		}
		
		if( uiClass ) {
			this.uiOpen[ panelId ] = uiClass;
		}
		else {
			this.uiOpen[ panelId ] = null;
		}
	}
	
	#createPanelSelectors() {
		
		const options = `
			<option value=''>No Panel</option>
			<option value='Scene'>Scene</option>
			<option value='FilePanel'>Assets</option>
		`;
		
		for( let i=1 ; i<=this.#maxPanels ; i++ ) {
			this.panels[i] = document.createElement('select');
			this.panels[i].innerHTML = options;
			this.panels[i].addEventListener( 'change' , this.change );
			this.panels[i].setAttribute( 'data-panel-id' , i );
			this.panels[i].classList.add( `editor-panel-${i}` );
			this.panels[i].classList.add( 'editor-panel-selector' );
			document.body.appendChild( this.panels[i] );
		}
		
	}
	
}