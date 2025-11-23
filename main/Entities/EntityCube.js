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
    widthSegments: 25,
    heightSegments: 25,
    depthSegments: 25
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
      p.width,
      p.height,
      p.depth,
      p.widthSegments,
      p.heightSegments,
      p.depthSegments
    )
  }


  boxConstructorPanel() {
    const p = this.geometryParams
    const panel = document.createElement('div')

    panel.innerHTML = `
      <fieldset>
        <legend>Cube Size</legend>
        <label>Width: <input class="editor-input" type="number" step="0.1" value="${p.width}" name="width"></label>
        <label>Height: <input class="editor-input" type="number" step="0.1" value="${p.height}" name="height"></label>
        <label>Depth: <input class="editor-input" type="number" step="0.1" value="${p.depth}" name="depth"></label>
      </fieldset>
      <fieldset>
        <legend>Cube Geometry</legend>
        <label>Width Segments: <input class="editor-input" type="number" step="1" min="1" value="${p.widthSegments}" name="widthSegments"></label>
        <label>Height Segments: <input class="editor-input" type="number" step="1" min="1" value="${p.heightSegments}" name="heightSegments"></label>
        <label>Depth Segments: <input class="editor-input" type="number" step="1" min="1" value="${p.depthSegments}" name="depthSegments"></label>
      </fieldset>
    `

    panel.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', e => {
        const name = e.target.name
        let value = parseFloat(e.target.value)
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
