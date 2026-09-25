#version 300 es
precision highp float;

#define PI 3.1415926538

in vec2 vTexCoord;

out vec4 frag_color;

void main() {
    vec3 color = mix(vec3(0.1), vec3(0.0), 1.0 - vTexCoord.y);

    frag_color = vec4(color, 1.0);
}