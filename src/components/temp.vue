<template>
  <div id="top">
    <div style="width: 20%">代码地址: https://github.com/412845222/a-wasm-test</div>
    <input type="file" accept="video/*" @change="handleFile" />
    <h1>帧率: {{ fpsNum }}</h1>

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
      <video id="video" controls ref="testVideo" src="" width="1280" height="250"></video>
      <div>
        <canvas id="canvas" ref="testCanvas" src="" width="598" height="550" style="border: 1px solid #000"></canvas>
        <canvas id="canvasgl" ref="testCanvasGl" src="" width="1920" height="1080" style="border: 1px solid #000"></canvas>
        <canvas id="offscreen" ref="offscreenDom" src="" width="598" height="550" style="border: 1px solid #000; display: none"></canvas>
      </div>

      <iframe src="/cocos3D/index.html" width="1280" height="550" frameborder="0"></iframe>
    </div>
  </div>
</template>