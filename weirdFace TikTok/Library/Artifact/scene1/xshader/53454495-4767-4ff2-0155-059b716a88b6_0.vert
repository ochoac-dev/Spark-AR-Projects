precision highp float;
attribute vec3 attPosition;
attribute vec2 attTexcoord0;

#ifdef AMAZING_USE_BONES
attribute vec4 attBoneIds;
attribute vec4 attWeights;
const int MAX_BONES = 50;
uniform mat4 u_Palatte[MAX_BONES];
#endif

uniform mat4 u_MVP;

void main() {
  vec4 homogeneous_pos = vec4(attPosition, 1.0);

#ifdef AMAZING_USE_BONES
  mat4 boneTransform = u_Palatte[int(attBoneIds.x)] * attWeights.x;
  boneTransform += u_Palatte[int(attBoneIds.y)] * attWeights.y;
  boneTransform += u_Palatte[int(attBoneIds.z)] * attWeights.z;
  boneTransform += u_Palatte[int(attBoneIds.w)] * attWeights.w;
  gl_Position = u_MVP * boneTransform * homogeneous_pos;
#else
  gl_Position = u_MVP * homogeneous_pos;
#endif
}
