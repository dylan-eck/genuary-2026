export async function loadShaderAsync(p5Inst, vertSrc, fragSrc) {
  return new Promise((resolve, reject) => {
    const shader = p5Inst.loadShader(vertSrc, fragSrc);
    resolve(shader);
  });
}
