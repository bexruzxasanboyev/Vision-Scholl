async function sendFormData() {
  const rawData = localStorage.getItem("formData");
  if (!rawData) return;

  const data = JSON.parse(rawData);
  
  // Script URL (Yangi deploy qilingan URLni qo'ying)
  const scriptURL = "https://script.google.com/macros/s/AKfycby33DyRvFN7pzMs3ToT3V9miaj1qpURrB7QGdN88NYowERQM01oL-JjUXaeo4KX2gn8/exec";

  // URLSearchParams ma'lumotlarni to'g'ri formatlab beradi
  const params = new URLSearchParams();
  params.append("sheetName", "Lead");
  params.append("Ism", data.Ism || "Noma'lum");
  params.append("Telefon raqam", data.TelefonRaqam || "Noma'lum");
  params.append("Royhatdan o'tgan vaqti", data.SanaSoat || new Date().toLocaleString());
  params.append("Tarif", data.Tarif || "forma");

  try {
    // POST so'rovi
    await fetch(scriptURL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });

    console.log("Muvaffaqiyatli yuborildi!");
    localStorage.removeItem("formData"); // Yuborilgach tozalaymiz
  } catch (error) {
    console.error("Yuborishda xatolik:", error);
  }
}

window.onload = sendFormData;