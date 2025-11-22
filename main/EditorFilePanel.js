export class EditorFilePanel {
	
  constructor() {
    this.panel = document.createElement( "div" );
    this.panel.classList.add( "editor-file-panel" );
    document.body.appendChild( this.panel );

    this.currentPath = "";

    this.loadTree();

    window.assetsAPI.onUpdate( () => {
      this.loadTree();
    });
  }

  async loadTree() {
    const tree = await window.assetsAPI.getTree();

    const target = this.findFolderByPath( tree, this.currentPath.split("/").filter(v => v) );
    this.renderFolder( target || tree, tree );
  }

  findFolderByPath( nodes, parts ) {
    if( parts.length === 0 ) return nodes;
    const next = parts.shift();
    const folder = nodes.find( n => n.type === "folder" && n.name === next );
    if( !folder ) return null;
    return this.findFolderByPath( folder.children, parts );
  }

  renderFolder( nodes, fullTree ) {
    this.panel.innerHTML = "";

    if( this.currentPath !== "" ) {
      const up = document.createElement( "div" );
      up.classList.add( "file-browser-item" );
      up.textContent = "↩️ ..";

      up.addEventListener( 'click', () => {
        const parts = this.currentPath.split("/").filter(v => v);
        parts.pop();
        this.currentPath = parts.join("/");
        this.loadTree();
      });

      this.panel.appendChild( up );
    }

    nodes.forEach( node => {

      const div = document.createElement( "div" );
      div.classList.add( "file-browser-item" );

      if( node.type === "folder" ) {
        div.classList.add( "file-browser-folder" );
        div.textContent = "📁 " + node.name;

        div.addEventListener( 'click', () => {
          this.currentPath =
            (this.currentPath ? this.currentPath + "/" : "") + node.name;
          this.loadTree();
        });

        this.panel.appendChild( div );
      }
      else {
        div.textContent = "📄 " + node.name;
        this.panel.appendChild( div );
      }

    });
  }
}
