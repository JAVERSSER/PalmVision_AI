# Future: palm-line segmentation model (U-Net)

The current release detects lines with classical computer vision (CLAHE +
black-hat morphology + dynamic-programming tracing) plus user correction.
No trained model ships with the app, and the UI never claims one exists.

## Plan

1. **Data** — collect consented palm images; use the app's manual-correction
   tool to export line polylines (they are already stored per scan as
   `scan.lines` in canonical 0–1 coordinates).
2. **Labels** — rasterise each polyline into a 4-class mask
   (life / head / heart / fate, + background) on the 512×512 canonical crop.
3. **Model** — U-Net (e.g. ResNet-18 encoder) in PyTorch, Dice + BCE loss,
   heavy augmentation (lighting, blur, skin tone, rotation ±10°).
4. **Serving** — implement `segment_lines()` in `server/main.py`, or export
   to ONNX and run in the browser with onnxruntime-web.
5. **Evaluation** — report per-line Dice/IoU and compare against the current
   tracer's auto-detection rate shown in Admin → Model performance.
