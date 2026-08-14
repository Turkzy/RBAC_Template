import { useEffect, useRef } from "react";
import { API_BASE_URL } from "../config/api.js";

const useComplianceNotificationStream = (onMessage, enabled = true) => {
  const handlerRef = useRef(onMessage);

  useEffect(() => {
    handlerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !window.EventSource) {
      return undefined;
    }

    const streamUrl = `${API_BASE_URL.replace(/\/$/, "")}/compliance/stream`;
    const source = new EventSource(streamUrl, { withCredentials: true });

    source.onmessage = (event) => {
      if (!event?.data) return;

      try {
        const payload = JSON.parse(event.data);
        if (payload?.type === "connected") return;
        handlerRef.current?.(payload);
      } catch {
        handlerRef.current?.({ type: "compliance-notifications-changed" });
      }
    };

    source.onerror = () => {
      if (source.readyState === EventSource.CLOSED) {
        source.close();
      }
    };

    return () => {
      source.close();
    };
  }, [enabled]);
};

export default useComplianceNotificationStream;
