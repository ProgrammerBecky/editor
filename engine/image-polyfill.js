import {
	FileLoader
} from 'three';

export const imagePolyfill = ( ImageLoader ) => {

  ImageLoader.prototype.load = function ( url, onLoad, onProgress, onError ) {

    if ( this.path ) url = this.path + url;

    if ( !this.fileLoader ) {
      this.fileLoader = new FileLoader( this.manager );
      this.fileLoader.setResponseType( 'blob' );
    }

    this.fileLoader.load(
      url,

      ( blob ) => {
        createImageBitmap( blob )
          .then( ( imageBitmap ) => {
            if ( onLoad ) onLoad( imageBitmap );
          })
          .catch( ( err ) => {
            if ( onError ) onError( err );
          });
      },

      onProgress,
      onError
    );
  };

  return ImageLoader;
};