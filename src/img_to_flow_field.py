import sys
import cv2
import numpy as np
import json
from pathlib import Path

def compute_flow(img_path, output_prefix="flow", cell_fraction=1.0, blur_sigma=2.0, add_noise=0.0):
    # Load grayscale image
    img = cv2.imread(str(img_path), cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise RuntimeError(f"failed to load image '{img_path}'")

    img = img.astype(np.float32) / 255.0

    img = cv2.GaussianBlur(img, (0, 0), sigmaX=blur_sigma, sigmaY=blur_sigma)

    gx = cv2.Sobel(img, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(img, cv2.CV_32F, 0, 1, ksize=3)

    theta = np.arctan2(gy, gx)

    theta_norm = (theta + np.pi) / (2 * np.pi)
    json_path = f"{output_prefix}.json"
    with open(json_path, "w") as f:
        json.dump(theta_norm.tolist(), f)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: python generate_flow.py <input_image>")
        sys.exit(1)

    input_image = Path(sys.argv[1])

    compute_flow(input_image)
