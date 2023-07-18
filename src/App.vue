<template>
  <div style="display: flex">
    <input type="file" accept="video/*" @change="handleFile" />
    <h2>帧率: {{ fpsNum }}</h2>

    <div style="margin-left: 100px">
      <h3>灰度滤镜运算</h3>
      <select v-model="modeChoose" name="" id="" @change="modeChange">
        <option value="0">未设置</option>
        <option value="1">JavaScript</option>
        <option value="5">JavaScript-WebGL</option>
        <option value="2">Golang_WASM</option>
        <option value="3">C++_WASM</option>
        <option value="4">Golang_仿写cpp内存读写</option>
        
      </select>
    </div>
  </div>

  <div id="wasm-playground">
    <div style="width: 100%">
      <video id="video" controls ref="testVideo" src="" width="600" height="550"></video>
      <div>
        <canvas id="canvas" ref="testCanvas" src="" width="598" height="550" style="border: 1px solid #000"></canvas>
        <canvas id="canvasgl" ref="testCanvasGl" src="" width="598" height="550" style="border: 1px solid #000"></canvas>
        <canvas id="offscreen" ref="offscreenDom" src="" width="598" height="550" style="border: 1px solid #000; display: none"></canvas>
      </div>

      <iframe src="/cocos3D/index.html" width="1280" height="550" frameborder="0"></iframe>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { windowAddEvent, windowPostMsg } from "./utils/windowEvent";
export default defineComponent({
  name: "App",
  setup() {
    const testVideo = ref<HTMLVideoElement>();
    const testCanvas = ref<HTMLCanvasElement>();
    const testCanvasGl = ref<HTMLCanvasElement>();
    const offscreenDom = ref<HTMLCanvasElement>();
    const offscreen = ref<OffscreenCanvas>();
    const offscreenCtx = ref<any>();
    const canvasSize = ref<{ width: number; height: number }>({ width: 0, height: 0 });
    const canvasCtx = ref<CanvasRenderingContext2D>();
    const canvasGLCtx = ref<WebGLRenderingContext>();
    const glPrograme = ref<WebGLProgram>();
    const glShow = ref<boolean>(false);
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
      if (modeChoose.value == 5) {
        glRender();
        return;
      }

      let scale = videoSize.value.width / canvasSize.value.width;
      let width = canvasSize.value.width;
      let height = videoSize.value.height / scale;
      let top = (canvasSize.value.height - height) / 2;
      let image: ImageData | null = null;
      if (offscreenCtx.value) {
        if (modeChoose.value == 4) {
          offscreenCtx.value.drawImage(testVideo.value!, 0, top, width, height);
          image = offscreenCtx.value.getImageData(0, top, width, height);
          if (!image) {
            return;
          }
          let data = image.data;
          //golang 内存读写
          const len = data.length * data.BYTES_PER_ELEMENT;
          const dataPtr = wasmModule.instance.exports.malloc(len);
          const dataView = new Uint8Array(wasmModule.instance.exports.memory.buffer, dataPtr);
          dataView.set(data);
          processGrayGo(dataPtr, len);
          const newData = new Uint8ClampedArray(dataView.subarray(0, len));
          image.data.set(newData);
          wasmModule.instance.exports.free(dataPtr);
        }
        if (modeChoose.value == 3) {
          offscreenCtx.value.drawImage(testVideo.value!, 0, top, width, height);
          image = offscreenCtx.value.getImageData(0, top, width, height);
          if (!image) {
            return;
          }

          //灰度图‘
          let data = image.data;

          let len = data.length * data.BYTES_PER_ELEMENT;
          var ptr = Module._malloc(len);
          Module.HEAPU8.set(data, ptr);
          Module.ccall("image_process", "number", ["number", "number"], [ptr, len]);
          let jsData = new Uint8ClampedArray(HEAPU8.subarray(ptr, ptr + len));
          image = new ImageData(jsData, image.width, image.height);
          Module._free(ptr);
        }

        if (modeChoose.value == 1) {
          offscreenCtx.value.drawImage(testVideo.value!, 0, top, width, height);
          image = offscreenCtx.value.getImageData(0, top, width, height);
          if (!image) {
            return;
          }

          //灰度图‘
          let data = image.data;
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;
            data[i + 1] = avg;
            data[i + 2] = avg;
          }
        }
      }

      if (image) {
        canvasCtx.value!.putImageData(image, 0, top);
        let msg = {
          mode: "2d",
          data:image
        }
        windowPostMsg(msg);
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

    const msgCallBack = () => {
      console.log("msgCallBack");
    };

    onMounted(() => {
      windowAddEvent(msgCallBack);

      if (testVideo.value && testCanvas.value) {
        canvasCtx.value = testCanvas.value.getContext("2d", { willReadFrequently: false })!;
        canvasSize.value.width = testCanvas.value.width;
        canvasSize.value.height = testCanvas.value.height;

        let glcanvas = testCanvasGl.value;
        canvasGLCtx.value = glcanvas!.getContext("webgl")!;

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

        processGrayGo = wasmModule.instance.exports.processGrayGo as Function;
      };

      runGoWasm();
    });

    const modeChange = () => {
      console.log(modeChoose.value);
      if (modeChoose.value == 1 || modeChoose.value == 3 || modeChoose.value == 4 || modeChoose.value == 5) {
        testVideo.value!.onplay = videoPlayCallBack;
        testVideo.value!.onpause = videoPauseCallBack;
        initgl();
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

      if (modeChoose.value == 1 || modeChoose.value == 3 || modeChoose.value == 4 || modeChoose.value == 5) {
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

    const initgl = () => {
      const gl = canvasGLCtx.value;
      if (!gl) {
        return;
      }
      const vertexShaderSource = `
          attribute vec2 a_position;
          attribute vec2 a_texCoord;
          varying vec2 v_texCoord;
          void main() {
            gl_Position = vec4(a_position, 0, 1);
            v_texCoord = a_texCoord;
          }
        `;
      const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
      gl.shaderSource(vertexShader, vertexShaderSource);
      gl.compileShader(vertexShader);

      // 创建片段着色器
      const fragmentShaderSource = `
        precision highp float;
        varying vec2 v_texCoord;
        uniform sampler2D u_texture;
        void main() {
          vec2 flippedTexCoord = vec2(v_texCoord.x, 1.0 - v_texCoord.y); // 反转纹理坐标
          vec4 color = texture2D(u_texture, flippedTexCoord);
          float avg = (color.r + color.g + color.b) / 3.0;
          gl_FragColor = vec4(avg, avg, avg, color.a);
        }
      `;
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
      gl.shaderSource(fragmentShader, fragmentShaderSource);
      gl.compileShader(fragmentShader);

      const program = gl.createProgram()!;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      gl.useProgram(program);
      glPrograme.value = program;

      const positionBuffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

      const texCoordBuffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);

      const texture = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      gl.viewport(0, 0, testCanvas.value!.width, testCanvas.value!.height);

      const positionLocation = gl.getAttribLocation(program, "a_position");
      const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
      const textureLocation = gl.getUniformLocation(program, "u_texture");
      gl.enableVertexAttribArray(positionLocation);
      gl.enableVertexAttribArray(texCoordLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1i(textureLocation, 0);
    };


    const glRender = () => {
      const gl = canvasGLCtx.value;
      if (!gl) {
        return;
      }

      const videoWidth = videoSize.value.width;
      const videoHeight = videoSize.value.height;
      const canvasWidth = canvasSize.value.width;
      const canvasHeight = canvasSize.value.height;

      const videoAspectRatio = videoWidth / videoHeight;
      const canvasAspectRatio = canvasWidth / canvasHeight;
      let width, height, offsetX, offsetY;

      if (videoAspectRatio > canvasAspectRatio) {
        // 视频宽高比大于画布宽高比，按画布宽度缩放
        width = canvasWidth;
        height = width / videoAspectRatio;
        offsetX = 0;
        offsetY = (canvasHeight - height) / (2 * canvasHeight);
      } else {
        // 视频宽高比小于等于画布宽高比，按画布高度缩放
        height = canvasHeight;
        width = height * videoAspectRatio;
        offsetX = (canvasWidth - width) / (2 * canvasWidth);
        offsetY = 0;
      }

      // 更新顶点坐标和纹理坐标
      const positionBuffer = gl.createBuffer()!;
      const positionLocation = gl.getAttribLocation(glPrograme.value!, "a_position");
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      const texCoordBuffer = gl.createBuffer()!;
      const texCoordLocation = gl.getAttribLocation(glPrograme.value!, "a_texCoord");
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([offsetX, 1 - offsetY - (height / canvasHeight) * videoAspectRatio, offsetX + width / canvasWidth, 1 - offsetY - (height / canvasHeight) * videoAspectRatio, offsetX, 1 - offsetY, offsetX + width / canvasWidth, 1 - offsetY]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(texCoordLocation);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

      // 渲染视频帧
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, testVideo.value!);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    return {
      handleFile: handleFile,
      testVideo: testVideo,
      testCanvas: testCanvas,
      fpsNum: fpsNum,
      modeChoose: modeChoose,
      modeChange: modeChange,
      offscreenDom: offscreenDom,
      testCanvasGl: testCanvasGl,
      glShow: glShow,
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
