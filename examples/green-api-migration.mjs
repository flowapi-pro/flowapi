// Existing Green API code keeps working: only the host changes.
// Before: https://api.green-api.com/waInstance{id}/sendMessage/{token}
// After:  https://flowapi.pro/waInstance{id}/sendMessage/{token}
const HOST = "https://flowapi.pro"; // was "https://api.green-api.com"
const res = await fetch(`${HOST}/waInstance${process.env.ID_INSTANCE}/sendMessage/${process.env.API_TOKEN}`, {
  method: "POST", headers: { "content-type": "application/json" },
  body: JSON.stringify({ chatId: "972501234567@c.us", message: "Same request body as Green API" }),
});
console.log(await res.json());
