export async function loadShaderAsync(p5Inst, vertPath, fragPath) {
  return new Promise((resolve, reject) => {
    p5Inst.loadShader(
      vertPath,
      fragPath,
      (shader) => resolve(shader),
      (err) =>
        reject(
          err || new Error(`p5 failed to load shader ${vertPath}, ${fragPath}`),
        ),
    );
  });
}
