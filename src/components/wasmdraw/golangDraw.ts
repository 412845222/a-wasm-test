const drawByGolang = (
  offscreenCtx: OffscreenCanvasRenderingContext2D,
  videoDom:HTMLVideoElement,
  width: number,
  height: number,
  wasmModule: any,
  processGrayGo: Function | null,
  ctx:CanvasRenderingContext2D
) => {
  offscreenCtx.drawImage(videoDom, 0, 0, width, height);
  let image = offscreenCtx.getImageData(0, 0, width, height);
  if (!image) {
    return;
  }
  let data = image.data;
  //golang 内存读写
  const len = data.length * data.BYTES_PER_ELEMENT;
  //@ts-ignore
  const dataPtr = wasmModule.instance.exports.malloc(len);
  const dataView = new Uint8Array(wasmModule.instance.exports.memory.buffer, dataPtr);
  dataView.set(data);
  processGrayGo!(dataPtr, len);
  const newData = new Uint8ClampedArray(dataView.subarray(0, len));
  image.data.set(newData);
  wasmModule.instance.exports.free(dataPtr);
  ctx.putImageData(image, 0, 0);
}



export { drawByGolang }