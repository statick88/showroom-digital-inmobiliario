export const MARKER_SIZE = 16;
export const MARKER_BORDER_WIDTH = 2;
export const MARKER_BORDER_COLOR = "#ffffff";

export function getMarkerColor(estado: string): string {
  switch (estado) {
    case "separado":
      return "var(--status-warning, #EAB308)";
    case "vendido":
      return "var(--status-destructive, #EF4444)";
    default:
      return "var(--status-success, #22C55E)";
  }
}

export function createMarkerHtml(estado: string): string {
  const color = getMarkerColor(estado);
  return `<div style="
    width: ${MARKER_SIZE}px;
    height: ${MARKER_SIZE}px;
    border-radius: 50%;
    background: ${color};
    border: ${MARKER_BORDER_WIDTH}px solid ${MARKER_BORDER_COLOR};
    box-shadow: 0px 2px 6px rgba(0,0,0,0.15);
  "></div>`;
}
