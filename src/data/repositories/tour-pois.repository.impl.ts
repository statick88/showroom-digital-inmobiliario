import { supabase } from "@/lib/supabase/client";
import { rethrowIfPresent } from "@/lib/supabase/errors";
import type {
  TourPOI,
  CreatePOIData,
  UpdatePOIData,
} from "@/domain/entities/tour-poi";

export interface TourPOIsRepository {
  list(tourId: string): Promise<TourPOI[]>;
  create(data: CreatePOIData): Promise<TourPOI>;
  update(id: string, data: UpdatePOIData): Promise<TourPOI>;
  delete(id: string): Promise<void>;
}

function mapPOI(row: Record<string, unknown>): TourPOI {
  return {
    id: row.id as string,
    tour_id: row.tour_id as string,
    name: row.name as string,
    description: (row.description as string) ?? undefined,
    poi_type: row.poi_type as TourPOI["poi_type"],
    icon: (row.icon as string) ?? undefined,
    lat: row.lat as number,
    lng: row.lng as number,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export const tourPOIsRepository: TourPOIsRepository = {
  async list(tourId) {
    const { data, error } = await supabase
      .from("tour_pois")
      .select("*")
      .eq("tour_id", tourId)
      .order("created_at", { ascending: true });

    rethrowIfPresent(error, "Error al listar POIs del tour");
    return (data ?? []).map(mapPOI);
  },

  async create(data) {
    const { data: row, error } = await supabase
      .from("tour_pois")
      .insert({
        tour_id: data.tour_id,
        name: data.name,
        description: data.description ?? null,
        poi_type: data.poi_type,
        icon: data.icon ?? null,
        lat: data.lat,
        lng: data.lng,
        metadata: data.metadata ?? {},
      })
      .select("*")
      .single();

    rethrowIfPresent(error, "Error al crear POI");
    return mapPOI(row);
  },

  async update(id, data) {
    const updates: Record<string, unknown> = {};

    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;
    if (data.poi_type !== undefined) updates.poi_type = data.poi_type;
    if (data.icon !== undefined) updates.icon = data.icon;
    if (data.lat !== undefined) updates.lat = data.lat;
    if (data.lng !== undefined) updates.lng = data.lng;
    if (data.metadata !== undefined) updates.metadata = data.metadata;

    const { data: row, error } = await supabase
      .from("tour_pois")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    rethrowIfPresent(error, "Error al actualizar POI");
    return mapPOI(row);
  },

  async delete(id) {
    const { error } = await supabase.from("tour_pois").delete().eq("id", id);
    rethrowIfPresent(error, "Error al eliminar POI");
  },
};
