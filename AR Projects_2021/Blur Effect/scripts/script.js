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
// For projects created with v87 onwards, JavaScript is always executed in strict mode.
//==============================================================================

// How to load in modules
const Scene = require('Scene');
const Time = require('Time');
const S = require('Shaders');
const T = require('Textures');
const R = require('Reactive');
const M = require('Materials');
const Modules = require('Modules');

  const defaultMat = M.findFirst('material0');


//const defaultMat = M.findFirst('material0');
const cameraTex = T.findFirst('cameraTexture0');
const canvas = Scene.root.find("canvas0");

 

function box_blur(tex, uv, steps, strength){
	
	const iter_step = Math.floor(steps / 2.0);
	
	const pixelWH = R.pack2(R.mul(R.div(1.0,canvas.width), strength), (R.mul(R.div(1.0,canvas.height),strength));
	
	let blend_color = R.pack4(0,0,0,0);
	
	 for (let i = -iter_step; i<= iter_step; i++)
		 {
			 for (let j = - iter_step; j <= iter_step; j++)
				 
			{
				const blurUV = R.add(uv,R.mul(R.pack2(i,j), pixelWH ));
				blend_color = R.add(blend_color, S.textureSampler(tex, blurUV));
			}
		 }
	const num_samples = 1.0/(steps*steps);
	return R.mul(blend_color, R.pack4(num_samples,num_samples,num_samples,1));
}

function main(){
	
	const uv = S.vertexAttribute( { "variableName" : S.vertexAttribute.TEX_COORDs }) //Vertex Shader
	
	const fuv = S.fragmentStage(uv);
	const camTex = cameraTex.signal;
	
	const curve = R.mul(R.abs(R.sin(R.mul(Time.ms, 0.001))));
	
	const color = box_blur(camTex , fuv, 9, R.add(1.0,curve));
	
	const textureSlot = S.DefaultMaterialTexures.DIFFUSE;
	defaultMat.setTextureSlot(textureSlot, color);
	
}}


main();