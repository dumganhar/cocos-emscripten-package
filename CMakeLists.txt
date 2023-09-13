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
else()
	set(EM_TYPE "asm")
endif()


set(EMS_LINK_FLAGS "${OPT_FLAGS} \
		--no-entry --bind \
		--closure 1 \
		-s WASM=${BUILD_WASM} \
		-s INITIAL_MEMORY=33554432 \
		-s ALLOW_MEMORY_GROWTH=1 \
		-s DYNAMIC_EXECUTION=0 \
		-s ERROR_ON_UNDEFINED_SYMBOLS=0
		-s USE_ES6_IMPORT_META=0 \
		-s EXPORT_ES6=1 \
		-s MODULARIZE=1 \
		-s EXPORT_NAME='spineWasm' \
		-s ENVIRONMENT=web \
		-s FILESYSTEM=0 \
		-s NO_EXIT_RUNTIME=1 \
		-s LLD_REPORT_UNDEFINED \
		-s MIN_SAFARI_VERSION=110000 \
		--js-library ../library_spine.js -Wl,--whole-archive \
		${CMAKE_CURRENT_SOURCE_DIR}/libs/libspine_static.a \
		${CMAKE_CURRENT_SOURCE_DIR}/libs/physx-fat.release.a \
		${CMAKE_CURRENT_SOURCE_DIR}/libs/libbox2d-fat.release.a \
		-Wl,--no-whole-archive"
)


add_library(physx STATIC IMPORTED GLOBAL)
set_target_properties(physx PROPERTIES
  IMPORTED_LOCATION ${CMAKE_CURRENT_SOURCE_DIR}/libs/physx-fat.release.a
)

add_library(box2d STATIC IMPORTED GLOBAL)
set_target_properties(box2d PROPERTIES
  IMPORTED_LOCATION ${CMAKE_CURRENT_SOURCE_DIR}/libs/libbox2d-fat.release.a
)

add_library(spine_static STATIC IMPORTED GLOBAL)
set_target_properties(spine_static PROPERTIES
  IMPORTED_LOCATION ${CMAKE_CURRENT_SOURCE_DIR}/libs/libspine_static.a
)

add_executable(${COCOS_NAME} empty.cpp)

target_link_libraries(${COCOS_NAME}
	PRIVATE ${APP_NAME} physx box2d spine_static
)

set_target_properties(${COCOS_NAME} PROPERTIES LINK_FLAGS ${EMS_LINK_FLAGS})
set_target_properties(${COCOS_NAME} PROPERTIES OUTPUT_NAME "spine.${CC_BUILD_TYPE}.${EM_TYPE}")

