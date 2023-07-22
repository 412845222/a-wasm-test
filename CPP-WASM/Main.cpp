#include <emscripten.h>
#include <stdio.h>
#include <stdint.h>

extern "C"
{
  EMSCRIPTEN_KEEPALIVE
  int main(int argc, char const *argv[])
  {
    printf("Init C++ Wasm\n");
    return 0;
  }

  EMSCRIPTEN_KEEPALIVE
  int image_process(uint8_t *data, int dataLen)
  {
    for (int i = 0; i < dataLen; i += 4)
    {
      int avg = (data[i + 0] + data[i + 1] + data[i + 2]) / 3;
      data[i + 0] = (uint8_t)avg;
      data[i + 1] = (uint8_t)(avg * 0.2);
      data[i + 2] = (uint8_t)(avg * 0.2);
    }
    return 0;
  }
}