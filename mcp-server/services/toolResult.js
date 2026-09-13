export function ok(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

export function fail(message) {
  return { content: [{ type: "text", text: message }], isError: true };
}

// Wraps an async handler so a thrown Error (e.g. the API client rejecting
// on a 404/400) becomes a proper MCP error result instead of crashing the
// server process.
export function safely(handler) {
  return async (args) => {
    try {
      return await handler(args);
    } catch (err) {
      return fail(err.message);
    }
  };
}
