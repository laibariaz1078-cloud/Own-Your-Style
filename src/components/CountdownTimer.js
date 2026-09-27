"use client";

import { useEffect, useState } from "react";

function getTimeLeft(target) {
  const diff = Math.max(target.getTime() - Date.now(), 0);
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function CountdownTimer({
  targetDate,
  variant = "light",
}) {
  const [time, setTime] = useState(() => getTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Minutes", value: time.minutes },
    { label: "Seconds", value: time.seconds },
  ];

  if (variant === "dark") {
    return (
      <div className="flex items-center gap-4">
        {units.map((unit) => (
          <div key={unit.label} className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black">
              {String(unit.value).padStart(2, "0")}
            </div>
            <span className="mt-1 text-xs text-black">{unit.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {units.map((unit) => (
        <div key={unit.label} className="flex flex-col items-center">
          <span className="text-xs text-gray-500">{unit.label}</span>
          <span className="text-2xl font-semibold text-black">
            {String(unit.value).padStart(2, "0")}
          </span>
        </div>
      ))}
    </div>
  );
}