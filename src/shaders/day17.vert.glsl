#version 300 es
precision highp float;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

in vec3 aPosition;
in vec3 aNormal;

out vec3 vNormal;
out vec3 vPosition;

void main() {
    vec4 positionVec4 = uModelViewMatrix * vec4(aPosition, 1.0);
    gl_Position = uProjectionMatrix * positionVec4;

    vPosition = positionVec4.xyz / positionVec4.w;
    vNormal = normalize(uNormalMatrix * aNormal);
}