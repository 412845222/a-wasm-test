<template>
  <input type="file" accept="video/*" @change="handleFile" />
  <div id="wasm-playground">
    <div style="width: 100%">
      <video id="video" controls ref="testVideo" src="" width="600" height="550"></video>
      <canvas id="canvas" ref="testCanvas" src="" width="  598" height="550" style="border: 1px solid #000"></canvas>
      <canvas id="offscreen" ref="offscreenDom" src="" width="  598" height="550" style="border: 1px solid #000; display: none"></canvas>
    </div>

    <h2>帧率: {{ fpsNum }}</h2>

    <div style="margin-left: 100px">
      <h3>灰度滤镜运算</h3>
      <select v-model="modeChoose" name="" id="" @change="modeChange">
        <option value="0">未设置</option>
        <option value="1">JavaScript</option>
        <option value="2">Golang_WASM</option>
        <option value="3">C++_WASM</option>
        <option value="4">Golang_仿写cpp内存读写</option>
      </select>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
export default defineComponent({
  name: "App",
  setup() {
    const testVideo = ref<HTMLVideoElement>();
    const testCanvas = ref<HTMLCanvasElement>();
    const offscreenDom = ref<HTMLCanvasElement>();
    const offscreen = ref<OffscreenCanvas>();
    const offscreenCtx = ref<any>();
    const canvasSize = ref<{ width: number; height: number }>({ width: 0, height: 0 });
    const canvasCtx = ref<CanvasRenderingContext2D>();
    const videoSize = ref<{ width: number; height: number }>({ width: 0, height: 0 });
    const fpsNum = ref<number>(0);
    const modeChoose = ref<number>(0);
    let animeTimer = 0;
    let frameCount = 0;
    let startTime = 0;
    let lastTime = 0;

    let processGrayGo: any;
    let wasmModule: any;

    const videoPlayCallBack = () => {
      startTime = performance.now();
      lastTime = startTime;
      canvasAnime();
    };

    const videoPauseCallBack = () => {
      cancelAnimationFrame(animeTimer);
    };

    const drawVideoToCanvas = () => {
      let scale = videoSize.value.width / canvasSize.value.width;
      let width = canvasSize.value.width;
      let height = videoSize.value.height / scale;
      let top = (canvasSize.value.height - height) / 2;

      if (offscreenCtx.value) {
        if (modeChoose.value == 4) {
          offscreenCtx.value.drawImage(testVideo.value!, 0, top, width, height);
          let image: ImageData = offscreenCtx.value.getImageData(0, top, width, height);
          let data = image.data;
          //golang 内存读写
          const len = data.length * data.BYTES_PER_ELEMENT;
          const dataPtr = wasmModule.instance.exports.malloc(len);
          const dataView = new Uint8Array(wasmModule.instance.exports.memory.buffer, dataPtr);
          dataView.set(data);
          processGrayGo(dataPtr, len);
          const newData = new Uint8ClampedArray(dataView.subarray(0, len));
          image.data.set(newData);
          canvasCtx.value!.putImageData(image, 0, top);
          wasmModule.instance.exports.free(dataPtr);
          return;
        }
        if (modeChoose.value == 3) {
          offscreenCtx.value.drawImage(testVideo.value!, 0, top, width, height);
          let image: ImageData = offscreenCtx.value.getImageData(0, top, width, height);

          //灰度图‘
          let data = image.data;

          let len = data.length * data.BYTES_PER_ELEMENT;
          var ptr = Module._malloc(len);
          Module.HEAPU8.set(data, ptr);
          Module.ccall("image_process", "number", ["number", "number"], [ptr, len]);
          let jsData = new Uint8ClampedArray(HEAPU8.subarray(ptr, ptr + len));
          image = new ImageData(jsData, image.width, image.height);
          Module._free(ptr);
          canvasCtx.value!.putImageData(image, 0, top);
          return;
        }

        if (modeChoose.value == 1) {
          offscreenCtx.value.drawImage(testVideo.value!, 0, top, width, height);
          let image: ImageData = offscreenCtx.value.getImageData(0, top, width, height);

          //灰度图‘
          let data = image.data;
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;
            data[i + 1] = avg;
            data[i + 2] = avg;
          }
          canvasCtx.value!.putImageData(image, 0, top);
          return;
        }
      }
    };

    const canvasAnime = (currentTime?: number) => {
      drawVideoToCanvas();
      animeTimer = requestAnimationFrame(canvasAnime);
      //计算帧率
      frameCount++;
      if (currentTime! - lastTime >= 1000) {
        fpsNum.value = frameCount;
        frameCount = 0;
        lastTime = currentTime!;
      }
    };

    onMounted(() => {
      if (testVideo.value && testCanvas.value) {
        canvasCtx.value = testCanvas.value.getContext("2d", { willReadFrequently: false })!;
        canvasSize.value.width = testCanvas.value.width;
        canvasSize.value.height = testCanvas.value.height;
        offscreen.value = new OffscreenCanvas(canvasSize.value.width, canvasSize.value.height);
        offscreenCtx.value = offscreen.value.getContext("2d", { willReadFrequently: false })!;
      }

      //@ts-ignore
      window.processVideoData = (imageData: ImageData, fps: number) => {
        // console.log(imageData,fpsNum)
        const data = imageData.data;
        //灰度图‘
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg;
          data[i + 1] = avg;
          data[i + 2] = avg;
        }
        canvasCtx.value!.putImageData(imageData, 0, 0);
        fpsNum.value = fps;
      };

      //@ts-ignore
      const go = new Go(); // Defined in wasm_exec.js

      const runGoWasm = async () => {
        // Get the importObject from the go instance.
        const importObject = go.importObject;

        // Instantiate our wasm module
        wasmModule = await WebAssembly.instantiateStreaming(fetch("/wasm/tiny_main.wasm"), importObject);

        // Allow the wasm_exec go instance, bootstrap and execute our wasm module
        go.run(wasmModule.instance);

        //@ts-ignore
        wasm_handleFile = window.Wasm_handleFile as Function;
        //@ts-ignore
        wasm_videoPlayCallBack = window.Wasm_videoPlayCallBack as Function;
        //@ts-ignore
        wasm_videoPauseCallBack = window.Wasm_videoPauseCallBack as Function;
        //@ts-ignore
        // processGrayGo = window.processGrayGo as Function

        processGrayGo = wasmModule.instance.exports.processGrayGo as Function;
        // processGrayGo();

        // 为参数分配内存并将数据写入内存
        // const data = new Uint8Array([1, 2, 3, 4, 5]); // 示例数据
        // const dataPtr = wasmModule.instance.exports.malloc(data.length);
        // const dataView = new Uint8Array(wasmModule.instance.exports.memory.buffer, dataPtr, data.length);
        // dataView.set(data);

        // 调用 processGrayGo 函数并传递参数
        // processGrayGo(dataPtr, data.length);
      };

      runGoWasm();
    });

    const modeChange = () => {
      console.log(modeChoose.value);
      if (modeChoose.value == 1 || modeChoose.value == 3 || modeChoose.value == 4) {
        testVideo.value!.onplay = videoPlayCallBack;
        testVideo.value!.onpause = videoPauseCallBack;
      } else {
        testVideo.value!.onplay = wasm_videoPlayCallBack;
        testVideo.value!.onpause = wasm_videoPauseCallBack;
      }
      console.log(testVideo.value!.onplay);
      console.log(testVideo.value!.onpause);
    };

    let wasm_handleFile: any;
    let wasm_videoPlayCallBack: any;
    let wasm_videoPauseCallBack: any;

    //@ts-ignore
    window.processVideoData = (imageData: ImageData, fps: number) => {
      console.log(imageData, fpsNum);
      const data = imageData.data;
      //灰度图‘
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
      }
      canvasCtx.value!.putImageData(imageData, 0, 0);
      fpsNum.value = fps;
    };

    const handleFile = (event: Event) => {
      const file = (event.target as HTMLInputElement).files![0];

      if (modeChoose.value == 1 || modeChoose.value == 3 || modeChoose.value == 4) {
        const url = URL.createObjectURL(file);

        testVideo.value!.src = url;
        //获取视频的宽高
        testVideo.value!.onloadedmetadata = () => {
          console.log(testVideo.value!.videoWidth);
          console.log(testVideo.value!.videoHeight);
          videoSize.value.width = testVideo.value!.videoWidth;
          videoSize.value.height = testVideo.value!.videoHeight;
        };
      }

      if (modeChoose.value == 2) {
        //在testVideo上播放 javascript
        let videoSize_wasm = {
          width: videoSize.value.width,
          height: videoSize.value.height,
        };
        let canvasSize_wasm = {
          width: canvasSize.value.width,
          height: canvasSize.value.height,
        };
        wasm_handleFile(file, testVideo, videoSize_wasm, canvasCtx.value, canvasSize_wasm);
      }
    };

    return {
      handleFile: handleFile,
      testVideo: testVideo,
      testCanvas: testCanvas,
      fpsNum: fpsNum,
      modeChoose: modeChoose,
      modeChange: modeChange,
      offscreenDom: offscreenDom,
    };
  },
});
</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
