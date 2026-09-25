#version 300 es
precision highp float;

uniform sampler2D u_ca_state;
uniform vec3 u_palette[32];
in vec2 uv;
out vec4 frag_color;

void main() {
    vec2 tex = texelFetch(u_ca_state, ivec2(gl_FragCoord.xy), 0).rg;

    if (tex.r > 0.5) {
        frag_color = vec4(tex.g * 0.7, tex.g * 0.8, tex.g * 0.9, 1.0);
    } else {
        frag_color = vec4(0.0, 0.0, 0.0, 1.0);
    }


}