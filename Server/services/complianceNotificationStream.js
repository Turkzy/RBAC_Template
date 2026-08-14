const clients = new Set();
const HEARTBEAT_MS = 25000;

const toSseData = (payload) => `data: ${JSON.stringify(payload)}\n\n`;

const removeClient = (client) => {
  if (!client) return;

  if (client.heartbeat) {
    clearInterval(client.heartbeat);
  }

  clients.delete(client);
};

export const registerComplianceNotificationStream = (req, res) => {
  res.status(200);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  res.write("retry: 5000\n\n");
  res.write(toSseData({ type: "connected", timestamp: new Date().toISOString() }));

  const client = { req, res, heartbeat: null };
  clients.add(client);

  client.heartbeat = setInterval(() => {
    if (res.writableEnded || res.destroyed) {
      removeClient(client);
      return;
    }

    try {
      res.write(": keep-alive\n\n");
    } catch {
      removeClient(client);
    }
  }, HEARTBEAT_MS);

  const cleanup = () => removeClient(client);

  req.on("close", cleanup);
  req.on("aborted", cleanup);
  res.on("close", cleanup);
};

export const broadcastComplianceNotificationChange = (payload = {}) => {
  const message = toSseData({
    type: "compliance-notifications-changed",
    timestamp: new Date().toISOString(),
    ...payload,
  });

  for (const client of [...clients]) {
    if (!client?.res || client.res.writableEnded || client.res.destroyed) {
      removeClient(client);
      continue;
    }

    try {
      client.res.write(message);
    } catch {
      removeClient(client);
    }
  }
};
