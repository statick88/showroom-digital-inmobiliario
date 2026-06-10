export type POIType = "amenity" | "road" | "attraction" | "landmark" | "other";

export interface TourPOI {
  id: string;
  tour_id: string;
  name: string;
  description?: string;
  poi_type: POIType;
  icon?: string;
  lat: number;
  lng: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreatePOIData {
  tour_id: string;
  name: string;
  description?: string;
  poi_type: POIType;
  icon?: string;
  lat: number;
  lng: number;
  metadata?: Record<string, unknown>;
}

export interface UpdatePOIData {
  name?: string;
  description?: string;
  poi_type?: POIType;
  icon?: string;
  lat?: number;
  lng?: number;
  metadata?: Record<string, unknown>;
}
