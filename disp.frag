#version 300 es
precision highp float;

uniform sampler2D u_ca_state;
uniform vec3 u_palette[32];
in vec2 uv;
out vec4 frag_color;

void main() {
    float v = texture(u_ca_state, uv).r;
    vec3 color = u_palette[int(v * float(u_palette.length()))];

    frag_color = vec4(color, 1.0);
}