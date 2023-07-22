<template>
  <div>
    <h1>帧率：{{ fpsNum }}</h1>
    <el-divider content-position="center">Step3: 参数调整</el-divider>
    <div class="params-form">
      <div class="slider-demo-block">
        <span class="demonstration">bloomStrength</span>
        <el-slider :min="0" :max="4" :step="0.01" @input="changeParams('webgl')" v-model="bloomStrength" />
      </div>
      <div class="slider-demo-block">
        <span class="demonstration">bloomRadius</span>
        <el-slider :min="1" :max="200" @input="changeParams('webgl')" v-model="bloomRadius" />
      </div>
      <div class="slider-demo-block">
        <span class="demonstration">threshold</span>
        <el-slider :min="0" :max="1" :step="0.01"  @input="changeParams('webgl')" v-model="threshold" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, inject, onMounted, ref } from "vue";
import { WasmTestStoreKey } from "./store";

export default defineComponent({
  name: "Rundetail",
  setup() {
    const store = inject(WasmTestStoreKey);
    const fpsNum = ref<ComputedRef<number | undefined>>(computed(() => store?.state.rundetail.fps));
    const bloomStrength = ref<number>(0); // 调整泛光的强度
    const bloomRadius = ref<number>(0); // 调整泛光的半径大小
    const threshold = ref<number>(0); // 调整泛光的阈值，这决定了哪些像素会产生泛光效果

    onMounted(()=>{
      bloomStrength.value = store?.state.renderParams_bloom.bloomStrength!;
      bloomRadius.value = store?.state.renderParams_bloom.bloomRadius!;
      threshold.value = store?.state.renderParams_bloom.threshold!;
    })

    const changeParams = (type:string)=>{
      if (type=="webgl") {
        let params = {
          bloomStrength:bloomStrength.value,
          bloomRadius:bloomRadius.value,
          threshold:threshold.value
        }
        store?.commit("setRenderParams_bloom",params);
      }
    }

    return {
      fpsNum: fpsNum,
      bloomStrength: bloomStrength,
      bloomRadius: bloomRadius,
      threshold: threshold,
      changeParams: changeParams,
    };
  },
});
</script>

<style scoped>
#params-form {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
