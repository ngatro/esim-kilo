"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Tawk_API?: {
      maximize?: () => void;
      [key: string]: unknown;
    };
    Tawk_LoadStart?: number;
  }
}

interface TawkSettings {
  tawkPropertyId: string;
  tawkWidgetId: string;
}

export default function TawkToWidget() {
  const [settings, setSettings] = useState<TawkSettings>({ tawkPropertyId: "", tawkWidgetId: "" });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.tawkPropertyId && data.tawkWidgetId) {
          setSettings({ tawkPropertyId: data.tawkPropertyId, tawkWidgetId: data.tawkWidgetId });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!settings.tawkPropertyId || !settings.tawkWidgetId) return;

    const script = document.createElement("script");
    script.src = "https://embed.tawk.to/" + settings.tawkPropertyId + "/" + settings.tawkWidgetId;
    script.async = true;
    script.charset = "utf-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [settings.tawkPropertyId, settings.tawkWidgetId]);

  return null;
}