export class EntityInterface {
	
	entityList = [];
	editorName = '❔ unnamed entity';
	
	showEditorPanel() {
		const panel = document.createElement( 'div' );
		panel.innerHTML = `
		<fieldset>
			<label>
				no configuration
			</label>
		</fieldset>`;
		return panel;
	}
}