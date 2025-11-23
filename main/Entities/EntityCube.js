import { EntityInterface } from './EntityInterface.js'
import {
  Mesh,
  BoxGeometry,
  MeshStandardMaterial,
} from 'three'

export class EntityCube extends EntityInterface {

  editorName = '🧊 Cube'

  geometryParams = {
    width: 1,
    height: 1,
    depth: 1,
    widthSegments: 1,
    heightSegments: 1,
    depthSegments: 1
  }


  constructor(scene) {
    super()
    this.scene = scene

    this.updateGeometry();
  }

  updateGeometry() {
    if( this.mesh?.geometry ) {
			this.mesh.geometry.dispose();
		}
		
    const p = this.geometryParams

    this.mesh.geometry = new BoxGeometry(
      Number( p.width ) ?? 1,
      Number( p.height ) ?? 1,
      Number( p.depth ) ?? 1,
      Number( p.widthSegments ) ?? 1,
      Number( p.heightSegments ) ?? 1,
      Number( p.depthSegments ) ?? 1
    )
		
		super.updateGeometry();
  }


  boxConstructorPanel() {
    const p = this.geometryParams
    const panel = document.createElement('div')

    panel.innerHTML = `
      <fieldset>
        <legend>Cube Size</legend>
        <label>Width: <input class="editor-input" type="text" value="${p.width}" name="width"></label>
        <label>Height: <input class="editor-input" type="text" value="${p.height}" name="height"></label>
        <label>Depth: <input class="editor-input" type="text" value="${p.depth}" name="depth"></label>
      </fieldset>
      <fieldset>
        <legend>Cube Geometry</legend>
        <label>Width Segments: <input class="editor-input" type="text" value="${p.widthSegments}" name="widthSegments"></label>
        <label>Height Segments: <input class="editor-input" type="text" value="${p.heightSegments}" name="heightSegments"></label>
        <label>Depth Segments: <input class="editor-input" type="text" value="${p.depthSegments}" name="depthSegments"></label>
      </fieldset>
    `

    panel.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', e => {
        const name = e.target.name
				if( ! this.endsWithDecimal( e.target.value ) ) return;
        let value = parseFloat(e.target.value)
				
				if (isNaN(value)) return;
        if (name.includes('Segments')) value = Math.max(1, Math.floor(value))
        this.geometryParams[name] = value
        this.updateGeometry()
        this.updateUI()
      })
    })

    return panel
  }

  showEditorPanel() {
    const panel = document.createElement('div')
    panel.appendChild(this.transformEditorPanel())
    panel.appendChild(this.boxConstructorPanel())
    panel.appendChild(this.bufferAttributePanel())
    return panel
  }
}
