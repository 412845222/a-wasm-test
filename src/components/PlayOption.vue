<template>
  <div id="play-opton">
    <el-divider content-position="center">Step1: 滤镜运算方式</el-divider>
    <el-radio-group v-model="modeChoose" @change="modeChange" size="large">
      <el-radio border v-for="item in optionList" :label="item.value">{{ item.label }}</el-radio>
    </el-radio-group>
    <h3>当前选择：{{ optionList[modeChoose].label }}</h3>
    <el-divider content-position="center">Step2: 文件选择</el-divider>
    <el-button @click="selectFile" type="primary" plain>选择文件</el-button>
    <input ref="fileSelectInput" @change="fileInputCallBack($event)" type="file" style="display: none" />
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, inject, onMounted, ref } from "vue";
import { WasmTestStoreKey } from "./store";

export default defineComponent({
  name: "PlayOption",
  setup() {
    const store = inject(WasmTestStoreKey);
    const canvas2dRender = ref(computed(() => store?.state.canvas2d.hook));
    const webglRender = ref(computed(() => store?.state.webgl.hook));
    const videoDom = ref<ComputedRef<HTMLVideoElement | null | undefined>>(computed(() => store?.state.videoDom));
    const fileSelectInput = ref<HTMLInputElement>();
    const optionList = ref([
      { value: 0, label: "未设置" },
      { value: 1, label: "JavaScript" },
      { value: 2, label: "JavaScript-WebGL" },
      { value: 3, label: "C++_WASM" },
      { value: 4, label: "Golang_WASM" },
    ]);
    const modeChoose = ref<number>(0);

    const selectFile = () => {
      fileSelectInput.value?.click();
    };

    const fileInputCallBack = (event: Event) => {
      const file = (event.target as HTMLInputElement).files![0];
      const url = URL.createObjectURL(file);
      if (videoDom.value) {
        videoDom.value.src = url;
        videoDom.value.onloadedmetadata = () => {
          console.log(videoDom.value!.videoWidth);
          console.log(videoDom.value!.videoHeight);

          let videoDetail = {
            name: file.name,
            size: {
              width: videoDom.value!.videoWidth,
              height: videoDom.value!.videoHeight,
            },
          };
          store?.commit("setVideoDetail", videoDetail);
        };
      }
    };

    let animeTimer = 0;
    let frameCount = 0;
    let startTime = 0;
    let lastTime = 0;

    const videoPlayCallBack = () => {
      startTime = performance.now();
      lastTime = startTime;
      canvasAnime();
    };

    const videoPauseCallBack = () => {
      cancelAnimationFrame(animeTimer);
    };

    const canvasAnime = (currentTime?: number) => {
      if (modeChoose.value != 2) {
        if (canvas2dRender.value) {
          canvas2dRender.value(modeChoose.value);
        }
      } else {
        if (webglRender.value) {
          webglRender.value();
        }
      }

      animeTimer = requestAnimationFrame(canvasAnime);
      //计算帧率
      frameCount++;
      if (currentTime! - lastTime >= 1000) {
        store?.commit("setFps", frameCount);
        frameCount = 0;
        lastTime = currentTime!;
      }
    };

    onMounted(() => {
      console.log("PlayOption mounted");
    });

    const modeChange = () => {
      console.log(modeChoose.value);
      videoDom.value!.onplay = videoPlayCallBack;
      videoDom.value!.onpause = videoPauseCallBack;
      store?.commit("setRenderMode", modeChoose.value);
    };

    // let wasm_handleFile: any|null = null;
    // let wasm_videoPlayCallBack: any;
    // let wasm_videoPauseCallBack: any;
    // let processGrayGo: any;
    // let wasmModule: any;

    return {
      optionList: optionList,
      modeChoose: modeChoose,
      modeChange: modeChange,
      fileSelectInput: fileSelectInput,
      selectFile: selectFile,
      fileInputCallBack: fileInputCallBack,
    };
  },
});
</script>

<style scoped>
#play-opton {
  width: 100%;
  height: 100%;
  /* border: 1px solid #fff; */
  color: #fff;
}
</style>
