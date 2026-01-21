#version 300 es
precision mediump float;

in vec2 vTexCoord;

uniform sampler2D tex0;
uniform sampler2D tex1;
uniform float intensity;

out vec4 fragColor;

void main() {
    vec2 uv = vTexCoord;
    uv.y = 1.0 - uv.y;
    vec4 original = texture(tex0, uv);
    vec4 blurred = texture(tex1, uv);
    vec4 result = original + blurred * intensity;
    fragColor = result;
}