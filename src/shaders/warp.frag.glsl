#version 300 es
precision highp float;

#define PI 3.1415926538

uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_canvas;

in vec2 vTexCoord;
out vec4 frag_color;

void main() {
    vec2 uv_norm = vTexCoord * 2.0 - 1.0;
    uv_norm.y *= u_resolution.y / u_resolution.x;
    uv_norm.y += 0.2;

    float r = length(uv_norm);
    float theta = atan(uv_norm.y, PI / 2.0 - uv_norm.x);

    vec2 uv_polar = vec2(theta / (2.0 * PI) + 0.5, r);

    frag_color = texture(u_canvas, uv_polar);
}