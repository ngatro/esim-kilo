"use client";

import { useEffect, useState } from "react";

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

    const existing = document.querySelector('script[src*="tawk.to"]');
    if (existing) return;

    const script = document.createElement("script");
    script.src = `https://embed.tawk.to/${settings.tawkPropertyId}/${settings.tawkWidgetId}?disableCollapsed=true`;
    script.async = true;
    script.charset = "utf-8";
    script.setAttribute("crossorigin", "*");
    script.setAttribute("data-auto-invisible", "true");
    document.body.appendChild(script);

    return () => {
      // Don't remove script on unmount
    };
  }, [settings.tawkPropertyId, settings.tawkWidgetId]);

  return null;
}