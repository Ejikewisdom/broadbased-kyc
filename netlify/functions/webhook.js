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

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const store = getStore("verifications");

    const record = {
      id: `ver_${Date.now()}`,
      receivedAt: new Date().toISOString(),
      status: payload?.data?.verification?.status || "UNKNOWN",
      reference: payload?.data?.verification?.reference || null,
      firstName: payload?.verification_response_data?.data?.first_name || null,
      lastName: payload?.verification_response_data?.data?.last_name || null,
      faceConfidence: payload?.verification_response_data?.data?.face_data?.confidence || null,
      userId: payload?.metadata?.user_id || null,
      raw: payload,
    };

    await store.setJSON(record.id, record);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ received: true, id: record.id }),
    };
  } catch (err) {
    console.error("Webhook error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to process webhook" }),
    };
  }
};
