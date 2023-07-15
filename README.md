# 一个JS与WASM关于实时滤镜的测试

## 运行

    npm install
    npm run dev


## 说明

Golang-WASM文件夹是Golang代码，Go语言环境安装好之后
  
      cd Golang-WASM
      set GOOS=js 
      set GOARCH=wasm 
      go build -o main.wasm main.go
