/**
 * Projection math for converting GeoJSON coordinates to Three.js sphere positions.
 * Used by ParcelPolygonMesh to render parcel boundaries inside the panorama sphere.
 */

export interface ProjectionCenter {
  lat: number;
  lng: number;
}

/**
 * Convert a GeoJSON [lng, lat] coordinate to a Three.js [x, y, z] position on a sphere.
 *
 * The projection maps geographic offsets from a center point onto a sphere surface,
 * where:
 * - Latitude offset controls the polar angle (phi)
 * - Longitude offset controls the azimuthal angle (theta)
 * - The result sits on a sphere of the given radius
 *
 * @param lng - Longitude of the point
 * @param lat - Latitude of the point
 * @param center - Center coordinates (panoramaCenter) to project relative to
 * @param radius - Sphere radius (default 499, inside the 500-radius texture)
 * @returns [x, y, z] position in Three.js coordinate space
 */
export function projectToSphere(
  lng: number,
  lat: number,
  center: ProjectionCenter,
  radius: number = 499,
): [number, number, number] {
  const phi = (90 - (lat - center.lat)) * (Math.PI / 180);
  const theta = (lng - center.lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return [x, y, z];
}
