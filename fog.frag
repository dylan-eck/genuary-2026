precision mediump float;

uniform vec3 uFogColor;
uniform float uFogDensity;
uniform vec3 uObjectColor;

varying float vDepth;

void main() {
    float fogFactor = clamp(exp(-uFogDensity * vDepth), 0.0, 1.0);
    vec3 finalColor = mix(uFogColor, uObjectColor, fogFactor);

    gl_FragColor = vec4(finalColor, 1.0);
}