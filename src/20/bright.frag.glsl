#version 300 es
precision mediump float;

in vec2 vTexCoord;

uniform sampler2D tex0;
uniform float threshold;

out vec4 fragColor;

void main() {
    vec2 uv = vTexCoord;
    uv.y = 1.0 - uv.y;
    vec4 color = texture(tex0, uv);
    vec3 bright = max(color.rgb - vec3(threshold), vec3(0.0));
    fragColor = vec4(bright, 1.0);
}

// #version 300 es
// precision mediump float;

// in vec2 vTexCoord;

// uniform sampler2D tex0;
// uniform float threshold;

// out vec4 fragColor;

// void main() {
//     vec2 uv = vTexCoord;
//     uv.y = 1.0 - uv.y;
//     vec4 color = texture(tex0, uv);
//     float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));

//     if (brightness > threshold) {
//         fragColor = vec4((color.rgb - threshold) / (1.0 - threshold), color.a);
//     } else {
//         fragColor = vec4(0.0);
//     }
// }