export interface XYLike {
  x: number;
  y: number;
}

export interface LatLngLike {
  lat: number;
  lng: number;
}

export function isValidPoint(value: Partial<XYLike> | null | undefined): value is XYLike {
  return (
    value !== null && value !== undefined && Number.isFinite(value.x) && Number.isFinite(value.y)
  );
}

export function isValidLatLng(value: Partial<LatLngLike> | null | undefined): value is LatLngLike {
  return (
    value !== null &&
    value !== undefined &&
    Number.isFinite(value.lat) &&
    Number.isFinite(value.lng)
  );
}

export function getPublicAssetPath(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}
