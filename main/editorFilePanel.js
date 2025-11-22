const renderFileTree = ( nodes , container ) => {
  nodes.forEach( node => {
    const div = document.createElement( "div" );
    div.classList.add( "file-browser-item" );

    if( node.type === "folder" ) {
      div.classList.add( "file-browser-folder" );
      div.textContent = "📁 " + node.name;

      const childrenContainer = document.createElement( "div" );
      childrenContainer.style.display = "none";

      div.addEventListener( 'click' , () => {
        childrenContainer.style.display =
          childrenContainer.style.display === "none" ? "block" : "none";
      });

      container.appendChild( div );
      container.appendChild( childrenContainer );

      renderTree( node.children , childrenContainer );
    }
		else {
      div.textContent = "📄 " + node.name;
      container.appendChild(div);
    }
  });
}

export const editorFilePanel = () => {
	const panel = document.createElement( 'div' );
	panel.classList.add("editor-file-panel");
	document.body.appendChild( panel );

	async function loadTree() {
		const tree = await window.assetsAPI.getTree();
		panel.innerHTML = "";
		renderFileTree(tree, panel);
	}

	// Initial load
	loadTree();

	// Watch for changes
	window.assetsAPI.onUpdate((tree) => {
		panel.innerHTML = "";
		renderFileTree(tree, panel);
	});
}