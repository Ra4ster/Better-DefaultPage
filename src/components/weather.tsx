"use client";

import * as React from "react";

type WeatherData = {
  tempC: number;
  code: number;
  name?: string;
};

function codeToText(code: number) {
  // Open-Meteo weather codes (condensed)
  if (code === 0) return "Clear";
  if (code === 1 || code === 2) return "Mostly clear";
  if (code === 3) return "Cloudy";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 95) return "Thunder";
  return "Weather";
}

export function Weather() {
  const [data, setData] = React.useState<WeatherData | null>(null);
  const [status, setStatus] = React.useState<"idle" | "loading" | "denied">(
    "idle"
  );

  React.useEffect(() => {
    let cancelled = false;

    async function load(lat: number, lon: number) {
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}` +
          `&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=celsius`;
        const res = await fetch(url);
        const j = await res.json();
        const temp = j?.current?.temperature_2m;
        const code = j?.current?.weather_code;
        if (cancelled) return;
        if (typeof temp === "number" && typeof code === "number") {
          setData({ tempC: temp, code });
        } else {
          setData(null);
        }
      } catch {
        if (!cancelled) setData(null);
      }
    }

    setStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        load(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        if (cancelled) return;
        setStatus("denied");
      },
      { maximumAge: 60_000, timeout: 8_000 }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "denied") {
    return (
      <div className="text-sm text-muted-foreground">
        Location blocked. Enable location to show weather.
      </div>
    );
  }

  if (data === null) {
    return <div className="text-sm text-muted-foreground">Loading…</div>;
  }

  const tempF = Math.round((data.tempC * 9) / 5 + 32);

  return (
    <div className="space-y-1">
      <div className="text-3xl font-semibold">{tempF}°</div>
      <div className="text-sm text-muted-foreground">{codeToText(data.code)}</div>
      <div className="text-xs text-muted-foreground">Powered by Open-Meteo</div>
    </div>
  );
}