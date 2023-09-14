cmake_minimum_required(VERSION 3.0)

set(COCOS_NAME "spine")

project(${COCOS_NAME}_wasm)

set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

if(NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE "Release" CACHE STRING "Choose the type of build." FORCE)
  message (STATUS "No CMAKE_BUILD_TYPE selected, defaulting to ${CMAKE_BUILD_TYPE}")
endif()


if(CMAKE_BUILD_TYPE STREQUAL "Debug")
	set(OPT_FLAGS "-O0 -g")
else()
	set(OPT_FLAGS "-O3")
endif()

string(TOLOWER "${CMAKE_BUILD_TYPE}" CC_BUILD_TYPE)

if(BUILD_WASM)
	set(EM_TYPE "wasm")
	set(CLOSURE_FLAG 1)
else()
	set(EM_TYPE "asm")
	set(CLOSURE_FLAG 0)
endif()


set(EMS_LINK_FLAGS "${OPT_FLAGS} \
		--no-entry --bind \
		--closure ${CLOSURE_FLAG} \
		-s EXPORT_NAME='spineWasm' \
		-s WASM=${BUILD_WASM} \
		-s INITIAL_MEMORY=33554432 \
		-s ALLOW_MEMORY_GROWTH=1 \
		-s DYNAMIC_EXECUTION=0 \
		-s ERROR_ON_UNDEFINED_SYMBOLS=0 \
		-s USE_ES6_IMPORT_META=0 \
		-s EXPORT_ES6=1 \
		-s MODULARIZE=1 \
		-s ENVIRONMENT=web \
		-s FILESYSTEM=0 \
		-s NO_EXIT_RUNTIME=1 \
		-s LLD_REPORT_UNDEFINED \
		-s MIN_SAFARI_VERSION=110000 \
		-s EXPORTED_RUNTIME_METHODS=ccall \
		--js-library ../js-hooks/library_spine.js \
		-Wl,--whole-archive \
		${CMAKE_CURRENT_SOURCE_DIR}/libs/libspine_static.a \
		${CMAKE_CURRENT_SOURCE_DIR}/libs/physx-fat.release.a \
		${CMAKE_CURRENT_SOURCE_DIR}/libs/libbox2d-fat.release.a \
		-Wl,--no-whole-archive"
)


set(WEBGPU_LINK_FLAGS "-s USE_WEBGPU=1 \
	--js-library ../js-hooks/callbacks.js \
	-Wl,--whole-archive \
	${CMAKE_CURRENT_SOURCE_DIR}/libs/libwebgpu_wasm.a \
	${CMAKE_CURRENT_SOURCE_DIR}/libs/release/libtwgsl-fat.release.a \
	${CMAKE_CURRENT_SOURCE_DIR}/libs/release/libglslang-fat.release.a \
	-Wl,--no-whole-archive"
)

string(CONCAT CC_FINAL_LINK_FLAGS "${EMS_LINK_FLAGS}" " " "${WEBGPU_LINK_FLAGS}")


# add_library(physx STATIC IMPORTED GLOBAL)
# set_target_properties(physx PROPERTIES
#   IMPORTED_LOCATION ${CMAKE_CURRENT_SOURCE_DIR}/libs/physx-fat.release.a
# )

# add_library(box2d STATIC IMPORTED GLOBAL)
# set_target_properties(box2d PROPERTIES
#   IMPORTED_LOCATION ${CMAKE_CURRENT_SOURCE_DIR}/libs/libbox2d-fat.release.a
# )

# add_library(spine_static STATIC IMPORTED GLOBAL)
# set_target_properties(spine_static PROPERTIES
#   IMPORTED_LOCATION ${CMAKE_CURRENT_SOURCE_DIR}/libs/libspine_static.a
# )

# add_library(twgsl STATIC IMPORTED GLOBAL)
# set_target_properties(twgsl PROPERTIES
#   IMPORTED_LOCATION ${CMAKE_CURRENT_SOURCE_DIR}/libs/libtwgsl-fat.release.a
# )

# add_library(glslang STATIC IMPORTED GLOBAL)
# set_target_properties(glslang PROPERTIES
#   IMPORTED_LOCATION ${CMAKE_CURRENT_SOURCE_DIR}/libs/libglslang-fat.release.a
# )

add_executable(${COCOS_NAME} empty.cpp)

target_link_options(${COCOS_NAME} PRIVATE -s EXPORTED_FUNCTIONS=["_spirv_to_wgsl"])
# target_link_options(${COCOS_NAME} PRIVATE -s EXPORTED_FUNCTIONS=["_test","_spirv_to_wgsl","_free","_malloc"])
# target_link_options(${COCOS_NAME} PRIVATE -s EXPORTED_FUNCTIONS=["_free","_malloc"])

em_link_pre_js(${COCOS_NAME} "${CMAKE_CURRENT_SOURCE_DIR}/js-hooks/glslang.pre.js")
em_link_pre_js(${COCOS_NAME} "${CMAKE_CURRENT_SOURCE_DIR}/js-hooks/twgsl.pre.js")

# target_link_libraries(${COCOS_NAME}
# 	PRIVATE ${APP_NAME} physx box2d spine_static
# )

# if (CMAKE_HOST_SYSTEM MATCHES "Windows.*")
#     # There are several ways we could append one file to another on Windows, but unfortunately 'cat' is not one of them
#     # (there is no 'cat' command in cmd). Also, since this will ultimately run in cmd and not pwsh, we need to ensure
#     # Windows path separators are used.
#     file(TO_NATIVE_PATH "${CMAKE_CURRENT_BINARY_DIR}/spine.release.wasm.js" glslang_js_path)
#     file(TO_NATIVE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/js-hooks/glslang.after.js" glslang_after_js_path)
#     add_custom_command(TARGET ${COCOS_NAME} POST_BUILD
#         COMMAND type "${glslang_after_js_path}" >> "${glslang_js_path}")
# else()
#     add_custom_command(TARGET ${COCOS_NAME} POST_BUILD
#         COMMAND cat ${CMAKE_CURRENT_SOURCE_DIR}/js-hooks/glslang.after.js >> ${CMAKE_CURRENT_BINARY_DIR}/spine.release.wasm.js)
# endif()

set_target_properties(${COCOS_NAME} PROPERTIES LINK_FLAGS ${CC_FINAL_LINK_FLAGS})
set_target_properties(${COCOS_NAME} PROPERTIES OUTPUT_NAME "spine.${CC_BUILD_TYPE}.${EM_TYPE}")

