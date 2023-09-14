Module['convertSpirV2WGSL'] = (code) => {
  var textDecoder = new TextDecoder();
  if (!Module['_return_string_callback']) {
      Module['_return_string_callback'] = (data, length) => {
          const bytes = new Uint8ClampedArray(twgsl.HEAPU8.subarray(data, data + length));
          wgsl = textDecoder.decode(bytes);
      };
  }
  let addr = Module['_malloc'](code.byteLength);
  Module['HEAPU32'].set(code, addr / 4);
  Module['_spirv_to_wgsl'](addr, code.byteLength);
  Module['_free'](addr);
  return wgsl;
};
