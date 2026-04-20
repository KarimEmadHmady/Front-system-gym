import { useState, useEffect } from "react";
import { GymSettingsService } from "@/services/gymSettingsService";

export const useGymSettings = () => {
  const [logoUrl, setLogoUrl] = useState("");
  const [gymName, setGymName] = useState("");

  useEffect(() => {
    const svc = new GymSettingsService();
    svc.get().then((s) => {
      setLogoUrl(s?.logoUrl || "");
      setGymName(s?.gymName || "");
    });
  }, []);

  return { logoUrl, gymName };
};