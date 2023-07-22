<template>
  <DwebWorkbench :data="UI_data"></DwebWorkbench>
</template>

<script lang="ts">
import { defineComponent, onMounted, provide, ref } from "vue";
import { Panel, resizeWindowUiData, Workbench, UIdataInstantiation } from "dweb-ui/Dweb_workbench/utils/UI_data";
import VideoPreview from "./components/VideoPreview.vue";
import PlayOption from "./components/PlayOption.vue";
import Canvas2D from "./components/Canvas2D.vue";
import Rundetail from "./components/Rundetail.vue";
import WebGLCanvas from "./components/WebGLCanvas.vue";
import { WasmTestStore, WasmTestStoreKey } from "./components/store";
export default defineComponent({
  name: "App",
  setup() {
    provide(WasmTestStoreKey, WasmTestStore);
    const windowWidth = ref<number>(window.innerWidth);
    const windowHeight = ref<number>(window.innerHeight);
    const UI_data = ref<Workbench>(
      new Workbench({
        styleValue: {
          width: windowWidth.value + "px",
          height: windowHeight.value + "px",
          backgroundColor: "#21252B",
          flexDirection: "row",
        },
        panels: [
          new Panel({
            dragBar:false,
            styleValue: {
              width: "30%",
              height: "100%",
              backgroundColor: "#282C34",
            },
            workbench:new Workbench({
              styleValue:{
                width:"100%",
                height:"100%",
                backgroundColor:"#282C34",
                flexDirection:"column"
              },
              panels:[
                new Panel({
                  name:"Video视频预览",
                  styleValue:{
                    width:"100%",
                    height:"50%",
                    backgroundColor:"#282C34",
                  },
                  component:VideoPreview
                }),
                new Panel({
                  name:"Cocos3D 预览",
                  styleValue:{
                    width:"100%",
                    height:"50%",
                    backgroundColor:"#21252B",
                  },
                })
              ]
            })
          }),
          new Panel({
            styleValue: {
              width: "20%",
              height: "100%",
              backgroundColor: "#282C34",
            },
            workbench:new Workbench({
              styleValue:{
                width:"100%",
                height:"100%",
                backgroundColor:"#282C34",
                flexDirection:"column"
              },
              panels:[
                new Panel({
                  name:"播放配置",
                  styleValue:{
                    width:"100%",
                    height:"30%",
                    backgroundColor:"#21252B",
                  },
                  component:PlayOption
                }),
                new Panel({
                  name:"FPS & 运行详情",
                  styleValue:{
                    width:"100%",
                    height:"70%",
                    backgroundColor:"#282C34",
                  },
                  component:Rundetail
                })
              ]
            })
          }),
          new Panel({
            styleValue: {
              width: "50%",
              height: "100%",
              backgroundColor: "#21252B",
            },
            workbench:new Workbench({
              styleValue:{
                width:"100%",
                height:"100%",
                backgroundColor:"#282C34",
                flexDirection:"column"
              },
              panels:[
                new Panel({
                  name:"2D Canvas",
                  styleValue:{
                    width:"100%",
                    height:"50%",
                    backgroundColor:"#282C34",
                  },
                  component:Canvas2D
                }),
                new Panel({
                  name:"WebGL Canvas",
                  styleValue:{
                    width:"100%",
                    height:"50%",
                    backgroundColor:"#21252B",
                  },
                  component:WebGLCanvas
                })
              ]
            })
          })
        ],
      })
    );

    let resizeTimeout: number;

    const onResize = () => {
      windowWidth.value = window.innerWidth;
      windowHeight.value = window.innerHeight;
      UI_data.value.styleValue.width = windowWidth.value + "px";
      UI_data.value.styleValue.height = windowHeight.value + "px";

      resizeWindowUiData(UI_data.value, windowWidth.value, windowHeight.value);

      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        UIdataInstantiation(UI_data.value, windowWidth.value, windowHeight.value);
      }, 300);
    };

    onMounted(() => {
      window.addEventListener("resize", onResize);
    });

    return {
      UI_data: UI_data,
    };
  },
});
</script>

<style scoped></style>
