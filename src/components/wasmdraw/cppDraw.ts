const drawByCpp = (
  offscreenCtx: OffscreenCanvasRenderingContext2D,
  videoDom:HTMLVideoElement,
  width: number,
  height: number,
  ctx:CanvasRenderingContext2D
) => {
  offscreenCtx.drawImage(videoDom, 0, 0, width, height);
  let image = offscreenCtx.getImageData(0, 0, width, height);

  if (!image) {
    return;
  }
  //灰度图‘
  let data = image.data;

  let len = data.length * data.BYTES_PER_ELEMENT;
  //@ts-ignore
  var ptr = Module._malloc(len);
  //@ts-ignore
  Module.HEAPU8.set(data, ptr);
  //@ts-ignore
  Module.ccall("image_process", "number", ["number", "number"], [ptr, len]);
  //@ts-ignore
  let jsData = new Uint8ClampedArray(HEAPU8.subarray(ptr, ptr + len));
  image = new ImageData(jsData, image.width, image.height);
  //@ts-ignore
  Module._free(ptr);

  ctx.putImageData(image, 0, 0);
}

export {drawByCpp}