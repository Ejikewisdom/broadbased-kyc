const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const store = getStore("verifications");
    const { blobs } = await store.list();

    const records = await Promise.all(
      blobs.map(async ({ key }) => {
        try {
          return await store.get(key, { type: "json" });
        } catch {
          return null;
        }
      })
    );

    const sorted = records
      .filter(Boolean)
      .sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ results: sorted }),
    };
  } catch (err) {
    console.error("Results fetch error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to fetch results", results: [] }),
    };
  }
};
