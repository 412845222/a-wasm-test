INCLUDE_DIRECTORIES (../)

SET(EYER_TARGET_NAME "EyerWasm")


SET(WASM_FLAGS "-s WASM=1 \
                    -s FETCH=1 \
                    -s EXPORTED_RUNTIME_METHODS=\"['ccall','stringToUTF8', 'UTF8ToString']\" \
                    -s EXPORTED_FUNCTIONS=\"['_malloc', '_free']\"")

SET(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} ${WASM_FLAGS}")
SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${WASM_FLAGS}")

ADD_EXECUTABLE(
        ${EYER_TARGET_NAME}

        Main.cpp
        )