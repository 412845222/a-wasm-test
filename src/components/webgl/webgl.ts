// 顶点着色器代码
const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  
  void main() {
    // 翻转纹理坐标
    v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y);
    // 将顶点坐标传递给片段着色器
    gl_Position = vec4(a_position, 0, 1);
  }
`;

// 片段着色器代码
const fragmentShaderSource = `
  precision highp float;
  varying vec2 v_texCoord;
  uniform sampler2D u_texture;
  uniform float bloomThreshold;
  uniform float bloomIntensity;
  uniform float bloomRadius;

  void main() {
    vec4 color = texture2D(u_texture, v_texCoord);

    // 计算像素的明亮程度，这里简单地计算RGB分量的平均值，您也可以根据需要使用其他方法
    float brightness = (color.r + color.g + color.b) / 3.0;

    // 计算辉光强度，使得明亮的像素周围产生辉光效果
    float bloomAmount = max(brightness - bloomThreshold, 0.0) * bloomIntensity;

    // 实现高斯模糊
    const int kernelSize = 20; // 核大小，调整该值来控制模糊程度
    vec2 texelSize = vec2(1.0) / vec2(bloomRadius * 2.0 + 1.0); // 计算纹理像素大小
    vec4 blurColor = vec4(0.0);
    for (int i = -kernelSize; i <= kernelSize; i++) {
      for (int j = -kernelSize; j <= kernelSize; j++) {
        vec2 offset = vec2(float(i), float(j)) * texelSize;
        blurColor += texture2D(u_texture, v_texCoord + offset) * (1.0 / float(kernelSize * kernelSize));
      }
    }

    // 输出最终的颜色，即混合辉光后的颜色和原始颜色
    gl_FragColor = color + vec4(blurColor.rgb * bloomAmount, 0.0);
  }
`;






// 创建着色器程序
function createShaderProgram(gl: WebGLRenderingContext, vertexShaderSource: any, fragmentShaderSource: any) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = gl.createProgram();
  gl.attachShader(program!, vertexShader!);
  gl.attachShader(program!, fragmentShader!);
  gl.linkProgram(program!);
  return program;
}

// 创建着色器
function createShader(gl: WebGLRenderingContext, type: any, source: any) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader!, source);
  gl.compileShader(shader!);
  return shader;
}


export { createShaderProgram, vertexShaderSource, fragmentShaderSource }