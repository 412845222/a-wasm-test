<template>
  <div id="video-preview">
    <video id="video" ref="videoDom" controls></video>
  </div>
</template>


<script lang="ts">
import { defineComponent, inject, onMounted, ref } from 'vue';
import { WasmTestStoreKey } from './store';
export default defineComponent({
  name: 'VideoPreview',
  setup() {
    const store = inject(WasmTestStoreKey);
    const videoDom = ref<HTMLVideoElement>();

    onMounted(()=>{
      store?.commit('setVideoDom', videoDom.value);
    })

    return {
      videoDom:videoDom
    };
  },
})
</script>


<style scoped>
#video-preview {
  width: 100%;
  height: 100%;
  background-color: #21252b;
  display: flex;
  justify-content: center;
  align-items: center;
}
#video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>