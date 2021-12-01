/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 */

//==============================================================================
// Welcome to scripting in Spark AR Studio! Helpful links:
//
// Scripting Basics - https://fb.me/spark-scripting-basics
// Reactive Programming - https://fb.me/spark-reactive-programming
// Scripting Object Reference - https://fb.me/spark-scripting-reference
// Changelogs - https://fb.me/spark-changelog
//
// Spark AR Studio extension for VS Code - https://fb.me/spark-vscode-plugin
//
// For projects created with v87 onwards, JavaScript is always executed in strict mode.
//==============================================================================

// How to load in Modules
const M = require('Materials');
const S = require('Shaders');
const T = require('Textures');
const R = require('Reactive');

const Time = require('Time');

// Use export keyword to make a symbol available in scripting debug mode
export const D = require('Diagnostics');

(async function () {  // Enables async/await in JS [part 1]


  


  function print(a)
  {
      D.log(a);
  }




  //sdfPolygon(center: ShaderSignal | Point2DSignal, radius: ShaderSignal | number | ScalarSignal, numSides: ShaderSignal | number | ScalarSignal, config: {sdfVariant: SdfVariant}): ShaderSignal


  
  function modulate(time, lum)
  {
      const ct = R.mul(time,.001); // -> Signal3
      const curve = R.abs(R.sin(ct)); // -> Signal4
      const modulationColor = R.pack4(curve,0,0,1); // -> Signal6
      const lum4 = R.pack4(lum,lum,lum,100);
      const finalModulation = R.add(modulationColor,lum4);
      return finalModulation;
  };
  
  function luminance(color)
  {
      return R.dot(color, R.pack4(0,0.5, 0.05,.001));
  };
  
  
 async function main()
  {
      const material0 = await M.findFirst('material0');
      const cameraTexture = await T.findFirst('cameraTexture0');
      const myTextureSignal = cameraTexture.signal; // -> Signal1
      
      const uvs = S.vertexAttribute({variableName: S.VertexAttribute.TEX_COORDS}); // -> Signal2    
  
      const color = S.textureSampler(myTextureSignal, uvs); // -> Signal5
      const lum = luminance(color);
  
      const modulationColor = modulate(Time.ms, lum);
      const finalColor = R.mul(color, modulationColor); // -> Signal7
      
      material0.setTextureSlot('DIFFUSE', finalColor); // Set Signal8 -> material
  };
  main();



})(); // Enables async/await in JS [part 2]




