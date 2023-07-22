<template>
  <div id="canvas2d">
    <canvas id="canvas" ref="canvas" src="" :width="canvasSize.width" :height="canvasSize.height" style="border: 1px solid #000"></canvas>
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, inject, onMounted, ref } from "vue";
import { WasmTestStoreKey } from "./store";
import { drawByGolang } from "./wasmdraw/golangDraw";
import { drawByCpp } from "./wasmdraw/cppDraw";
export default defineComponent({
  name: "2DCanvas",
  setup() {
    const store = inject(WasmTestStoreKey);
    const videoDom = ref<ComputedRef<HTMLVideoElement | null | undefined>>(computed(() => store?.state.videoDom));
    const videoSize = ref<ComputedRef<{ width: number; height: number } | undefined>>(computed(() => store?.state.videoDetail.size));
    const canvas = ref<HTMLCanvasElement>();
    const ctx = ref<CanvasRenderingContext2D>();
    const offscreenDom = ref<OffscreenCanvas>();
    const offscreenCtx = ref<OffscreenCanvasRenderingContext2D>();
    const offscreen2Dom = ref<OffscreenCanvas>();
    const offscreen2Ctx = ref<OffscreenCanvasRenderingContext2D>();
    const canvasSize = ref({
      width: 0,
      height: 0,
    });

    const draw = (mode: number) => {
      if (videoSize.value) {
        scale = videoSize.value.width / canvasSize.value.width;
        width = canvasSize.value.width;
        height = videoSize.value.height / scale;
      }
      if (mode == 1) {
        drawByJavaScript();
      }
      if (mode == 3) {
        drawByCpp(offscreenCtx.value!,videoDom.value!,width,height,ctx.value!);
      }
      if (mode == 4) {
        drawByGolang(offscreenCtx.value!,videoDom.value!,width,height,wasmModule,processGrayGo,ctx.value!);
      }
    };

    let scale: number = 1;
    let width: number = 0;
    let height: number = 0;
    let image: ImageData | null = null;

    onMounted(() => {
      let parent = document.getElementById("canvas2d")!;
      canvasSize.value.width = parent.clientWidth;
      canvasSize.value.height = (canvasSize.value.width / 16) * 9;
      ctx.value = canvas.value!.getContext("2d")!;
      let canvas2d = {
        dom: canvas.value,
        ctx: ctx.value,
        hook: draw,
      };
      store?.commit("setCanvas2d", canvas2d);
      offscreenDom.value = new OffscreenCanvas(canvasSize.value.width, canvasSize.value.height);
      offscreen2Dom.value = new OffscreenCanvas(canvasSize.value.width, canvasSize.value.height);
      offscreenCtx.value = offscreenDom.value.getContext("2d", { willReadFrequently: false })!;
      offscreen2Ctx.value = offscreen2Dom.value.getContext("2d", { willReadFrequently: false })!;

      GolangInit();
    });


    let wasmModule: WebAssembly.WebAssemblyInstantiatedSource | null = null;
    let processGrayGo: Function | null = null;
    const GolangInit = ()=>{
      //@ts-ignore
      const go = new Go(); // Defined in wasm_exec.js
      const runGoWasm = async () => {
        // Get the importObject from the go instance.
        const importObject = go.importObject;

        // Instantiate our wasm module
        wasmModule = await WebAssembly.instantiateStreaming(fetch("/wasm/tiny_main.wasm"), importObject);

        // wasm_exec go instance
        go.run(wasmModule.instance);
        processGrayGo = wasmModule.instance.exports.processGrayGo as Function;
        //wasm拓展js方法临时注释
        // //@ts-ignore  
        // wasm_handleFile = window.Wasm_handleFile as Function;
        // //@ts-ignore
        // wasm_videoPlayCallBack = window.Wasm_videoPlayCallBack as Function;
        // //@ts-ignore
        // wasm_videoPauseCallBack = window.Wasm_videoPauseCallBack as Function;
        //@ts-ignore
        
      };
      runGoWasm();
    }

    const drawByJavaScript = () => {
      if (offscreenCtx.value && videoDom.value) {
        offscreenCtx.value.drawImage(videoDom.value, 0, 0, width, height);
        image = offscreenCtx.value.getImageData(0, 0, width, height);
      }

      if (!image) {
        return;
      }

      const bloomStrength = 1; // 调整泛光的强度
      const bloomRadius = 10; // 调整泛光的半径大小
      const threshold = 200; // 调整泛光的阈值，这决定了哪些像素会产生泛光效果

      offscreen2Ctx.value?.putImageData(image, 0, 0);

      let data = image.data;

      // 对临时画布应用高斯模糊效果，模糊半径根据泛光强度进行缩放
      const blurRadius = bloomRadius * bloomStrength;
      offscreen2Ctx.value!.filter = `blur(${blurRadius}px)`;
      offscreen2Ctx.value!.drawImage(offscreenDom.value!, 0, 0);

      // 获取模糊后的图像数据
      const blurredImageData = offscreen2Ctx.value!.getImageData(0, 0, width, height);
      const blurredData = blurredImageData.data;

      // 叠加泛光效果
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;

        // 只有当像素的明亮程度高于阈值时，才应用泛光效果
        if (brightness > threshold) {
          const bloomAmount = bloomStrength;

          data[i] = r + (blurredData[i] - r) * bloomAmount;
          data[i + 1] = g + (blurredData[i + 1] - g) * bloomAmount;
          data[i + 2] = b + (blurredData[i + 2] - b) * bloomAmount;
        }
      }

      // 将结果绘制到画布上
      ctx.value?.putImageData(image, 0, 0);
    };

    return {
      canvas: canvas,
      canvasSize: canvasSize,
    };
  },
});
</script>

<style scoped>
#canvas2d {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
#canvas {
  border: 1px solid #000;
}
</style>
