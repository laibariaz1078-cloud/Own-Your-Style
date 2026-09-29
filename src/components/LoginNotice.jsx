"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginNotice() {
  const searchParams = useSearchParams();
  const hasShownNotice = useRef(false);

  useEffect(() => {
    if (searchParams.get("reason") !== "auth" || hasShownNotice.current) return;

    hasShownNotice.current = true;
    toast.error("Please login or sign up to access this page");
  }, [searchParams]);

  return null;
}