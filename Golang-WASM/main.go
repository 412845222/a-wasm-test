package main

import (
	"fmt"
	"syscall/js"
)

func main() {
	// 注册 JavaScript 回调函数
	js.Global().Set("Wasm_handleFile", js.FuncOf(handleFile))
	js.Global().Set("Wasm_videoPlayCallBack", js.FuncOf(videoPlayCallBack))
	js.Global().Set("Wasm_videoPauseCallBack", js.FuncOf(videoPauseCallBack))

	// 保持 Wasm 模块运行，防止程序退出
	select {}
}

var fileData js.Value
var videoDom js.Value
var videoSize_js js.Value
var canvasDom js.Value
var canvasCtx js.Value
var canvasSize_js js.Value

// 声明一个结构体videoSize
type VideoSize struct {
	Width  int
	Height int
}

var videoSize VideoSize

// 声明一个结构体canvasSize
type CanvasSize struct {
	Width  int
	Height int
}

type ImageData struct {
	Width, Height int
	Data          []byte
}

var canvasSize CanvasSize

var offscreen js.Value
var offscreenCtx js.Value

var fpsNum = 0
var animeTimer = 0.0
var frameCount = 0
var startTime = 0.0
var lastTime = 0.0

func handleFile(this js.Value, args []js.Value) interface{} {

	file := args[0]
	videoDom = js.Global().Get("document").Call("getElementById", "video")
	file_url := js.Global().Get("URL").Call("createObjectURL", file)

	videoDom.Set("src", file_url)
	videoDom.Set("onloadedmetadata", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		videoSize.Width = videoDom.Get("videoWidth").Int()
		videoSize.Height = videoDom.Get("videoHeight").Int()

		return nil
	}))

	canvasDom = js.Global().Get("document").Call("getElementById", "canvas")
	canvasCtx = canvasDom.Call("getContext", "2d")
	canvasSize_js = args[4]

	canvasSize.Width = canvasSize_js.Get("width").Int()
	canvasSize.Height = canvasSize_js.Get("height").Int()

	fmt.Println("数据载入:", fileData, videoDom, videoSize, canvasSize)

	offscreen = js.Global().Get("document").Call("getElementById", "offscreen")
	offscreenCtx = offscreen.Call("getContext", "2d")

	// 测试离屏渲染canvas
	offscreenCtx.Set("fillStyle", "#ff000090")
	offscreenCtx.Call("fillRect", 0, 0, canvasSize.Width, canvasSize.Height)
	offscreenCtx.Set("fillStyle", "yellow")
	offscreenCtx.Call("fillRect", 0, 0, 100, 100)
	offscreenCtx.Call("drawImage", videoDom, 0, 0, canvasSize.Width, canvasSize.Height)
	testimgData := offscreenCtx.Call("getImageData", 0, 0, canvasSize.Width, canvasSize.Height)

	canvasCtx.Call("putImageData", testimgData, 0, 0)

	return nil
}

func videoPlayCallBack(this js.Value, args []js.Value) interface{} {
	fmt.Println("Wasm播放callback:")
	videoDom = js.Global().Get("document").Call("getElementById", "video")

	startTime = js.Global().Get("performance").Call("now").Float()
	lastTime = startTime

	// 绘制画面的函数
	drawFrame := func() {
		//clearRect
		canvasCtx.Call("clearRect", 0, 0, canvasSize.Width, canvasSize.Height)
		scale := float64(videoSize.Width) / float64(canvasSize.Width)
		width := float64(canvasSize.Width)
		height := float64(videoSize.Height) / scale
		top := (float64(canvasSize.Height) - height) / 2

		// canvasCtx.Call("drawImage", videoDom, 0, top, width, height)

		offscreenCtx.Call("drawImage", videoDom, 0, top, width, height)
		imageData := offscreenCtx.Call("getImageData", 0, 0, canvasSize.Width, canvasSize.Height)
		js.Global().Call("processVideoData", imageData, fpsNum)

		//WASM灰度处理
		// offscreenCtx.Call("drawImage", videoDom, 0, top, width, height)
		// imageData := offscreenCtx.Call("getImageData", 0, 0, canvasSize.Width, canvasSize.Height)
		// processGrayScale(imageData)

	}

	// 定义帧动画函数
	var canvasAnime js.Func
	canvasAnime = js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		// fmt.Println("当前帧率:" + strconv.Itoa(fpsNum))

		drawFrame() // 绘制当前帧

		animeTimer = js.Global().Call("requestAnimationFrame", canvasAnime).Float()

		// 计算帧率
		frameCount++
		currentTime := args[0].Float()
		if currentTime-lastTime >= 1000 {
			fpsNum = frameCount
			frameCount = 0
			lastTime = currentTime
		}

		return nil
	})

	js.Global().Call("requestAnimationFrame", canvasAnime)

	// 第一帧绘制
	drawFrame()

	return nil
}

func videoPauseCallBack(this js.Value, args []js.Value) interface{} {
	js.Global().Call("cancelAnimationFrame", animeTimer)
	return nil
}

func processGrayScale(imageData js.Value) {
	data := imageData.Get("data")
	// 将图像数据传递给JavaScript环境

	length := data.Length()

	// 处理灰度图像数据
	for i := 0; i < length; i += 4 {
		r := data.Index(i).Int()
		g := data.Index(i + 1).Int()
		b := data.Index(i + 2).Int()

		gray := int(r+b+g) / 3 // 计算灰度值（平均值法）

		// 将灰度值应用于 R、G、B 分量
		data.SetIndex(i, gray)
		data.SetIndex(i+1, gray)
		data.SetIndex(i+2, gray)
	}

	// 将处理后的图像数据放回画布
	canvasCtx.Call("putImageData", imageData, 0, 0)
}
