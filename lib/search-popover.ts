type Anchor = { left: number; right: number; top: number; bottom: number; width: number };
type Viewport = { left: number; top: number; width: number; height: number };

/** Keep results below the input, inside the visible viewport (including a mobile keyboard). */
export function searchPopoverPosition(anchor: Anchor, viewport: Viewport) {
  const gutter = 12;
  const width = Math.min(Math.max(anchor.width, 440), Math.max(0, viewport.width - gutter * 2));
  const left = Math.max(viewport.left + gutter, Math.min(anchor.right - width, viewport.left + viewport.width - gutter - width));
  const top = Math.max(viewport.top + gutter, anchor.bottom + 8);
  return {
    left,
    top,
    width,
    maxHeight: Math.max(0, Math.min(440, viewport.top + viewport.height - top - gutter)),
  };
}
