export class EditorFilePanel {
  constructor() {
    this.panel = document.createElement( "div" );
    this.panel.classList.add( "editor-file-panel" );
    document.body.appendChild( this.panel );

    this.currentPath = "";

    this.setupDragAndDrop();
    this.loadTree();

    window.assetsAPI.onUpdate( () => {
      this.loadTree();
    } );
  }

  setupDragAndDrop() {
    this.panel.addEventListener( "dragover", ( e ) => {
      e.preventDefault();
      this.panel.classList.add( "drag-hover" );
    } );

    this.panel.addEventListener( "dragleave", () => {
      this.panel.classList.remove( "drag-hover" );
    } );

    this.panel.addEventListener( "drop", async ( e ) => {
      e.preventDefault();
      this.panel.classList.remove( "drag-hover" );

      const files = [ ...e.dataTransfer.files ];

      for ( const file of files ) {
        if ( file.path ) {
          await window.assetsAPI.importFile( file.path, this.currentPath );
        } else {
          try {
            const arrayBuffer = await file.arrayBuffer();
            await window.assetsAPI.uploadFile( arrayBuffer, file.name, this.currentPath );
          } catch ( err ) {
            console.error( "Failed to upload file:", file.name, err );
          }
        }
      }

      this.loadTree();
    } );
  }

  async loadTree() {
    const tree = await window.assetsAPI.getTree();
    const target = this.findFolderByPath( tree, this.currentPath.split( "/" ).filter( v => v ) );
    this.renderFolder( target || tree, tree );
  }

  findFolderByPath( nodes, parts ) {
    if ( parts.length === 0 ) return nodes;
    const next = parts.shift();
    const folder = nodes.find( n => n.type === "folder" && n.name === next );
    if ( !folder ) return null;
    return this.findFolderByPath( folder.children, parts );
  }

  #getIconFromName( name ) {
    let nameParts = name.split( '.' );
    const extension = nameParts[ nameParts.length - 1 ].toLowerCase();

    if ( [ 'glb', 'gltf', 'fbx' ].includes( extension ) ) return "📦";
    if ( [ 'png', 'jpg' ].includes( extension ) ) return "🖼️";
    if ( [ 'wav', 'mp3', 'ogg' ].includes( extension ) ) return "🔊";
    if ( [ 'mp3' ].includes( extension ) ) return "🎵";
    if ( [ 'js' ].includes( extension ) ) return "👩‍💻";
    if ( [ 'json' ].includes( extension ) ) return "📊";
    if ( [ 'txt' ].includes( extension ) ) return "📃";
    if ( [ 'bin' ].includes( extension ) ) return "🎰";

    return "📄";
  }

  renderFolder( nodes, fullTree ) {
    this.panel.innerHTML = "";

		if ( this.currentPath !== "" ) {
			const up = document.createElement( "div" );
			up.classList.add( "file-browser-item" );
			up.textContent = "↩️ ..";

			up.addEventListener( 'click', () => {
				const parts = this.currentPath.split( "/" ).filter( v => v );
				parts.pop();
				this.currentPath = parts.join( "/" );
				this.loadTree();
			} );

			up.addEventListener( "dragover", ( e ) => {
				e.preventDefault();
				up.classList.add( "drag-hover" );
			} );
			up.addEventListener( "dragleave", ( ) => {
				up.classList.remove( "drag-hover" );
			} );
			up.addEventListener( "drop", async ( e ) => {
				e.preventDefault();
				up.classList.remove( "drag-hover" );

				const srcPath = e.dataTransfer.getData( "text/plain" );
				if ( srcPath ) {
					const parts = this.currentPath.split( "/" ).filter( v => v );
					parts.pop();
					const targetFolder = parts.join( "/" ); 
					await window.assetsAPI.moveFile( srcPath, targetFolder );
					this.loadTree();
				}
			} );

			this.panel.appendChild( up );
		}

    nodes.forEach( node => {
      const div = document.createElement( "div" );
      div.classList.add( "file-browser-item" );

      if ( node.type === "folder" ) {
        div.classList.add( "file-browser-folder" );
        div.textContent = "📁 " + node.name;

        div.addEventListener( 'click', () => {
          this.currentPath = ( this.currentPath ? this.currentPath + "/" : "" ) + node.name;
          this.loadTree();
        } );

        div.setAttribute( "draggable", "true" );
        div.addEventListener( "dragstart", ( e ) => {
          e.dataTransfer.setData( "text/plain", ( this.currentPath ? this.currentPath + "/" : "" ) + node.name );
        } );

        div.addEventListener( "dragover", ( e ) => {
          e.preventDefault();
          div.classList.add( "drag-hover" );
        } );
        div.addEventListener( "dragleave", () => {
          div.classList.remove( "drag-hover" );
        } );
        div.addEventListener( "drop", async ( e ) => {
          e.preventDefault();
          div.classList.remove( "drag-hover" );
          const srcPath = e.dataTransfer.getData( "text/plain" );
          const destPath = ( this.currentPath ? this.currentPath + "/" : "" ) + node.name;
          if ( srcPath ) {
            await window.assetsAPI.moveFile( srcPath, destPath );
            this.loadTree();
          }
        } );

        this.panel.appendChild( div );
      } else {
        div.textContent = this.#getIconFromName( node.name ) + ' ' + node.name;

        div.setAttribute( "draggable", "true" );
        div.addEventListener( "dragstart", ( e ) => {
          e.dataTransfer.setData( "text/plain", ( this.currentPath ? this.currentPath + "/" : "" ) + node.name );
        } );

        this.panel.appendChild( div );
      }
    } );
  }
}
