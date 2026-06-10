import { describe, it, expect } from "vitest";
import { projectToSphere } from "../useParcelProjection";

describe("projectToSphere", () => {
  const AYACUCHO_CENTER = { lat: -13.163, lng: -74.224 };
  const RADIUS = 499;

  it("projects the center point to (R, 0, 0)", () => {
    // phi = 90°, theta = 180° → x = R, y ≈ 0, z ≈ 0
    const [x, y, z] = projectToSphere(
      AYACUCHO_CENTER.lng,
      AYACUCHO_CENTER.lat,
      AYACUCHO_CENTER,
      RADIUS,
    );
    expect(x).toBeCloseTo(RADIUS, 0);
    expect(y).toBeCloseTo(0, 0);
    expect(z).toBeCloseTo(0, 0);
  });

  it("projects a point 1° north of center (y increases, x decreases)", () => {
    const [x, y, z] = projectToSphere(
      AYACUCHO_CENTER.lng,
      AYACUCHO_CENTER.lat + 1,
      AYACUCHO_CENTER,
      RADIUS,
    );
    // phi ≈ 89° → y ≈ 8.7, x ≈ 498.9
    expect(x).toBeGreaterThan(490);
    expect(y).toBeGreaterThan(5);
    expect(y).toBeLessThan(15);
    expect(Math.abs(z)).toBeLessThan(1);
  });

  it("projects a point 1° east of center (z increases)", () => {
    const [x, y, z] = projectToSphere(
      AYACUCHO_CENTER.lng + 1,
      AYACUCHO_CENTER.lat,
      AYACUCHO_CENTER,
      RADIUS,
    );
    // theta changes → z gets a non-zero value, y stays near 0
    expect(Math.abs(y)).toBeLessThan(1);
    expect(Math.abs(z)).toBeGreaterThan(5);
  });

  it("projects equator (lat=0) relative to center at lat=0", () => {
    const center = { lat: 0, lng: 0 };
    const [x, y, z] = projectToSphere(0, 0, center, RADIUS);
    // phi = 90°, theta = 180° → (R, 0, 0)
    expect(x).toBeCloseTo(RADIUS, 0);
    expect(y).toBeCloseTo(0, 0);
    expect(z).toBeCloseTo(0, 0);
  });

  it("projects north pole point relative to equator center", () => {
    const center = { lat: 0, lng: 0 };
    const [x, y, z] = projectToSphere(0, 90, center, RADIUS);
    // phi = 0° → y = R, x ≈ 0, z ≈ 0
    expect(x).toBeCloseTo(0, 0);
    expect(y).toBeCloseTo(RADIUS, 0);
    expect(z).toBeCloseTo(0, 0);
  });

  it("projects south pole point relative to equator center", () => {
    const center = { lat: 0, lng: 0 };
    const [x, y, z] = projectToSphere(0, -90, center, RADIUS);
    // phi = 180° → y = -R, x ≈ 0, z ≈ 0
    expect(x).toBeCloseTo(0, 0);
    expect(y).toBeCloseTo(-RADIUS, 0);
    expect(z).toBeCloseTo(0, 0);
  });

  it("handles the date line (lng=179.9 vs lng=-179.9 from center at 180)", () => {
    const center = { lat: 0, lng: 180 };
    const east = projectToSphere(179.9, 0, center, RADIUS);
    const west = projectToSphere(-179.9, 0, center, RADIUS);
    // Both should be near the same point (just across the date line)
    expect(east[1]).toBeCloseTo(west[1], 0); // same y
    const distXZ = Math.sqrt(
      (east[0] - west[0]) ** 2 + (east[2] - west[2]) ** 2,
    );
    expect(distXZ).toBeLessThan(10);
  });

  it("returns points on the sphere surface (distance ≈ radius)", () => {
    const testPoints = [
      { lng: -74.224, lat: -13.163 },
      { lng: -74.0, lat: -13.0 },
      { lng: -75.0, lat: -14.0 },
      { lng: -73.0, lat: -12.0 },
    ];

    for (const point of testPoints) {
      const [x, y, z] = projectToSphere(
        point.lng,
        point.lat,
        AYACUCHO_CENTER,
        RADIUS,
      );
      const distance = Math.sqrt(x * x + y * y + z * z);
      expect(distance).toBeCloseTo(RADIUS, 0);
    }
  });

  it("uses default radius of 499 when not specified", () => {
    const [x, y, z] = projectToSphere(
      AYACUCHO_CENTER.lng,
      AYACUCHO_CENTER.lat,
      AYACUCHO_CENTER,
    );
    const distance = Math.sqrt(x * x + y * y + z * z);
    expect(distance).toBeCloseTo(499, 0);
  });
});
