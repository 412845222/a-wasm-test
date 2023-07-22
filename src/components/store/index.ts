import { InjectionKey } from 'vue';
import { Store, createStore } from 'vuex';

export const WasmTestStoreKey: InjectionKey<Store<WasmTestStoreType>> = Symbol("WasmTestStoreKey");

export interface WasmTestStoreType {
  renderMode: number;
  videoDom: HTMLVideoElement | null;
  videoDetail: {
    name: string,
    size:{
      width: number;
      height: number;
    }
  },
  canvas2d:{
    dom: HTMLCanvasElement | null;
    ctx: CanvasRenderingContext2D | null;
    hook:Function | null;
  },
  webgl:{
    dom: HTMLCanvasElement | null;
    ctx: WebGLRenderingContext | null;
    hook:Function | null;
    
  },
  renderParams_bloom:{
    bloomStrength: number;
    bloomRadius: number;
    threshold: number;
  },
  rundetail:{
    fps: number;
  }
}

export const WasmTestStore = createStore<WasmTestStoreType>({
  state: {
    renderMode:0,
    videoDom: null,
    videoDetail: {
      name: "",
      size:{
        width: 1920,
        height: 1080
      }
    },
    canvas2d:{
      dom: null,
      ctx: null,
      hook:null
    },
    webgl:{
      dom: null,
      ctx: null,
      hook:null,
    },
    renderParams_bloom:{
      bloomStrength: 0.8,
      bloomRadius: 20,
      threshold: 200
    },
    rundetail:{
      fps: 0
    }
  },
  mutations: {
    setVideoDom(state, videoDom: HTMLVideoElement) {
      state.videoDom = videoDom;
    },
    setFps(state, fps: number) {
      state.rundetail.fps = fps;
    },
    setVideoDetail(state, videoDetail: {name: string, size:{width: number, height: number}}) {
      state.videoDetail = videoDetail;
    },
    setCanvas2d(state, canvas2d: {dom: HTMLCanvasElement, ctx: CanvasRenderingContext2D, hook:Function}) {
      state.canvas2d = canvas2d;
    },
    setWebgl(state, webgl: {dom: HTMLCanvasElement, ctx: WebGLRenderingContext, hook:Function}) {
      state.webgl = webgl;
    },
    setRenderMode(state, renderMode: number) {
      state.renderMode = renderMode;
    },
    setRenderParams_bloom(state, renderParams_bloom: {bloomStrength: number, bloomRadius: number, threshold: number}) {
      state.renderParams_bloom = renderParams_bloom;
    }
    
  },
  actions: {
  },
})

