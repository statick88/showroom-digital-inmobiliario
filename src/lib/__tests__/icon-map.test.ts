import { describe, it, expect } from "vitest";
import { getIcon } from "@/lib/icon-map";
import {
  Lock,
  MapPin,
  Ruler,
  Bed,
  Bath,
  MessageCircle,
  LayoutDashboard,
  Building2,
  TrendingUp,
  Search,
  Filter,
  Pencil,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  LogIn,
  Eye,
  EyeOff,
  Crosshair,
  Layers,
  Plus,
  Minus,
  Waves,
  Car,
  Shield,
  ShieldCheck,
  ArrowLeft,
  LogOut,
} from "lucide-react";

describe("icon-map — Material→Lucide icon mappings", () => {
  const expectedMappings: [string, unknown][] = [
    ["lock", Lock],
    ["location_on", MapPin],
    ["square_foot", Ruler],
    ["bed", Bed],
    ["bathtub", Bath],
    ["chat_bubble", MessageCircle],
    ["dashboard", LayoutDashboard],
    ["domain", Building2],
    ["trending_up", TrendingUp],
    ["search", Search],
    ["filter_list", Filter],
    ["edit", Pencil],
    ["check_circle", CheckCircle2],
    ["chevron_left", ChevronLeft],
    ["chevron_right", ChevronRight],
    ["calendar_today", Calendar],
    ["login", LogIn],
    ["visibility", Eye],
    ["visibility_off", EyeOff],
    ["my_location", Crosshair],
    ["layers", Layers],
    ["add", Plus],
    ["remove", Minus],
    ["pool", Waves],
    ["local_parking", Car],
    ["security", Shield],
    ["verified_user", ShieldCheck],
    ["arrow_back", ArrowLeft],
    ["logout", LogOut],
  ];

  it.each(expectedMappings)(
    "maps Material icon '%s' to the correct Lucide component",
    (materialName, expectedComponent) => {
      const result = getIcon(materialName as string);
      expect(result).toBe(expectedComponent);
    },
  );

  it("returns undefined for unknown icon names", () => {
    expect(getIcon("nonexistent_icon")).toBeUndefined();
    expect(getIcon("")).toBeUndefined();
    expect(getIcon("foobar")).toBeUndefined();
  });

  it("exactly 29 mappings exist (28 Material + 1 logout extra)", () => {
    // The map has 29 entries: 28 Material→Lucide + "logout"→LogOut
    expect(expectedMappings.length).toBe(29);
  });
});
