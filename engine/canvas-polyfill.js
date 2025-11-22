export const canvasPolyfill = ( canvas ) => {
  if( typeof canvas.width !== 'number' ) canvas.width = 0;
  if( typeof canvas.height !== 'number' ) canvas.height = 0;

  if( !canvas.style ) canvas.style = {};

  canvas.setSize = ( width , height ) => {
    this.width = width;
    this.height = height;

    if( this.resize ) {
      this.resize( width , height );
    }
  };

  return canvas;
}