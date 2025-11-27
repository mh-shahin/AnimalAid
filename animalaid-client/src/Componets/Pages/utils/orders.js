export async function createOrderApi(payload) {
  try {
    const res = await fetch("http://localhost:8000/orders/create/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error("Network error creating order:", err);
    return { ok: false, status: 0, data: null };
  }
}
