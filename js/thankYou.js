const scriptURL =
  "https://script.google.com/macros/s/AKfycby33DyRvFN7pzMs3ToT3V9miaj1qpURrB7QGdN88NYowERQM01oL-JjUXaeo4KX2gn8/exec";

function getTarifTag(data) {
  const tarif = String((data && data.Tarif) || "").trim().replace(/^#/, "").toLowerCase();
  if (tarif === "elementary") return "elementary";
  if (tarif === "nazoratli") return "nazoratli";
  if (tarif === "nazoratsiz") return "nazoratsiz";
  return "forma";
}

async function sendToAmoCrm(data) {
  const tag = getTarifTag(data);
  const response = await fetch("/api/amocrm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Ism: data.Ism || "Noma'lum",
      TelefonRaqam: data.TelefonRaqam,
      SanaSoat: data.SanaSoat,
      tag: tag,
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) {
    throw new Error(result.error || "amoCRM response was not ok");
  }
  return result;
}

async function sendFormData() {
  const rawData = localStorage.getItem("formData");
  if (!rawData) return;

  const data = JSON.parse(rawData);

  const params = new URLSearchParams();
  params.append("sheetName", "Lead");
  params.append("Ism", data.Ism || "Noma'lum");
  params.append("Telefon raqam", data.TelefonRaqam || "Noma'lum");
  params.append("Royhatdan o'tgan vaqti", data.SanaSoat || new Date().toLocaleString());
  params.append("Tarif", data.Tarif || "forma");

  try {
    await fetch(scriptURL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    try {
      await sendToAmoCrm(data);
      console.log("Yuborildi. amo tags: newwebsite_2 +", getTarifTag(data));
    } catch (amoErr) {
      console.error("amoCRM yuborishda xatolik:", amoErr);
    }

    localStorage.removeItem("formData");
  } catch (error) {
    console.error("Yuborishda xatolik:", error);
  }
}

window.onload = sendFormData;
