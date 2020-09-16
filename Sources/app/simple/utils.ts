// Show control
export function show(control: GraphicsElement): void {
  control.style.display = "inline";
}

// Hide control
export function hide(control: GraphicsElement): void {
  control.style.display = "none";
}

// Set visibility
export function setVisibility(control: GraphicsElement, visible: boolean): void {
  control.style.display = visible
    ? "inline"
    : "none";
}

// highlight a control vith animation
export function highlight(control: GraphicsElement): void {
  control.animate("highlight");
}

// update color only when requested
export function fill(control: GraphicsElement, color: string) {
  // if (control.style.fill === color) return;
  // console.warn(`${color} ${control.style.fill}`);
  control.style.fill = color;
}