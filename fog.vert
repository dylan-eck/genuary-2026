precision mediump float;

attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying float vDepth;

void main() {
  vec4 viewPos = uModelViewMatrix * vec4(aPosition, 1.0);
  vDepth = -viewPos.z;

  gl_Position = uProjectionMatrix * viewPos;
}