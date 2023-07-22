<template>
  <div id="canvasgl">
    <canvas id="webgl" ref="webgl" src="" :width="canvasSize.width" :height="canvasSize.height" style="border: 1px solid #000"></canvas>
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, inject, onMounted } from "vue";
import { ref } from "vue";
import { createShaderProgram, fragmentShaderSource, vertexShaderSource } from "../utils/webgl";
import { WasmTestStoreKey } from "./store";
export default defineComponent({
  name: "WebGLCanvas",
  setup() {
    const store = inject(WasmTestStoreKey);
    const videoDom = ref<ComputedRef<HTMLVideoElement | null | undefined>>(computed(() => store?.state.videoDom));
    const bloomStrength_store = ref(computed(() => store?.state.renderParams_bloom.bloomStrength));
    const bloomRadius_store = ref(computed(() => store?.state.renderParams_bloom.bloomRadius)); // 调整泛光的半径大小
    const threshold_store = ref(computed(() => store?.state.renderParams_bloom.threshold)); // 调整泛光的阈值，这决定了哪些像素会产生泛光效果

    const webgl = ref<HTMLCanvasElement>();
    const webglCtx = ref<WebGLRenderingContext>();
    const canvasSize = ref({
      width: 0,
      height: 0,
    });
    const glPrograme = ref<WebGLProgram>();
    const glTexture = ref<WebGLTexture>();
    const glFrameBuffer = ref<WebGLFramebuffer>();

    onMounted(() => {
      let parent = document.getElementById("canvasgl")!;
      canvasSize.value.width = parent.clientWidth;
      canvasSize.value.height = (canvasSize.value.width / 16) * 9;
      webglCtx.value = webgl.value!.getContext("webgl")!;

      initgl();
      let webgl_obj = {
        dom: webgl.value,
        ctx: webglCtx.value,
        hook: glRender,
      };
      store?.commit("setWebgl", webgl_obj);
    });

    const glRender = () => {
      if (glTexture.value && videoDom.value && videoDom.value.videoWidth > 0 && videoDom.value.videoHeight > 0) {
        const gl = webglCtx.value;
        if (!gl) {
          return;
        }

        const bloomStrength = bloomStrength_store.value; // 调整泛光的强度
        const bloomRadius = bloomRadius_store.value; // 调整泛光的半径大小
        const threshold = threshold_store.value; // 调整泛光的阈值，这决定了哪些像素会产生泛光效果

        // 获取uniform变量的位置
        const thresholdLocation = gl.getUniformLocation(glPrograme.value!, "bloomThreshold");
        const intensityLocation = gl.getUniformLocation(glPrograme.value!, "bloomIntensity");
        const radiusLocation = gl.getUniformLocation(glPrograme.value!, "bloomRadius");

        // 设置辉光阈值和强度
        gl.uniform1f(thresholdLocation, threshold!);
        gl.uniform1f(intensityLocation, bloomStrength!);
        gl.uniform1f(radiusLocation, bloomRadius!);

        // 检查视频宽高与画布宽高是否符合比例
        const videoWidth = videoDom.value.videoWidth;
        const videoHeight = videoDom.value.videoHeight;
        const canvasWidth = gl.drawingBufferWidth;
        const canvasHeight = gl.drawingBufferHeight;
        const videoAspect = videoWidth / videoHeight;
        const canvasAspect = canvasWidth / canvasHeight;

        let width = canvasWidth;
        let height = canvasHeight;
        let xOffset = 0;
        let yOffset = 0;

        if (videoAspect > canvasAspect) {
          height = canvasWidth / videoAspect;
          yOffset = (canvasHeight - height) / 2;
        } else {
          width = canvasHeight * videoAspect;
          xOffset = (canvasWidth - width) / 2;
        }

        // 更新顶点坐标缓冲，以适应视频和画布的宽高比例
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1 + (xOffset * 2) / canvasWidth, -1 + (yOffset * 2) / canvasHeight, 1 - (xOffset * 2) / canvasWidth, -1 + (yOffset * 2) / canvasHeight, -1 + (xOffset * 2) / canvasWidth, 1 - (yOffset * 2) / canvasHeight, 1 - (xOffset * 2) / canvasWidth, 1 - (yOffset * 2) / canvasHeight]), gl.STATIC_DRAW);

        // 设置顶点属性指针
        const positionLocation = gl.getAttribLocation(glPrograme.value!, "a_position");
        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // 更新视频纹理

        const textureUnit = 0; // 纹理单元索引
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, glTexture.value);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoDom.value);

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // 渲染视频纹理
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        // 渲染到帧缓冲对象
        gl.bindFramebuffer(gl.FRAMEBUFFER, glFrameBuffer.value!);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    };

    const initgl = () => {
      const canvasGL = webglCtx.value;
      const gl = canvasGL;
      if (!gl) {
        return;
      }

      const canvasWidth = canvasSize.value.width;
      const canvasHeight = canvasSize.value.height;
      console.log(canvasWidth, canvasHeight);

      // 创建着色器程序
      const program = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
      gl.useProgram(program);
      glPrograme.value = program!;

      // 获取顶点属性和纹理坐标属性的位置
      const positionLocation = gl.getAttribLocation(program!, "a_position");
      const texCoordLocation = gl.getAttribLocation(program!, "a_texCoord");

      // 创建视频纹理
      const videoTextureLocation = gl.getUniformLocation(program!, "u_texture");
      const textureUnit = 0; // 纹理单元索引

      // 创建视频纹理对象
      const videoTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, videoTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      // 将视频纹理绑定到纹理单元
      gl.activeTexture(gl.TEXTURE0 + textureUnit);
      gl.bindTexture(gl.TEXTURE_2D, videoTexture);
      gl.uniform1i(videoTextureLocation, textureUnit);

      // 将视频纹理存储到 glTexture ref 中
      glTexture.value = videoTexture!;

      // 创建帧缓冲对象用于后期处理
      const frameBuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
      glFrameBuffer.value = frameBuffer!;

      // 创建渲染缓冲对象用于高斯模糊
      const renderBuffer = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA4, canvasWidth, canvasHeight);

      // 将渲染缓冲对象绑定到帧缓冲对象的颜色附件
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, renderBuffer);

      // 设置视口和视频纹理大小
      gl.viewport(0, 0, canvasWidth, canvasHeight);

      // 创建顶点缓冲
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

      // 创建纹理坐标缓冲
      const texCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);

      // 设置顶点属性指针和纹理坐标属性指针
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.enableVertexAttribArray(texCoordLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
    };

    return {
      webgl: webgl,
      canvasSize: canvasSize,
    };
  },
});
</script>

<style scoped>
#canvasgl {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
#webgl {
  border: 1px solid #000;
}
</style>
