const AMOCRM_BASE_URL = (process.env.AMOCRM_BASE_URL || "https://visionschool.amocrm.ru").replace(/\/$/, "");
const AMOCRM_ACCESS_TOKEN = process.env.AMOCRM_ACCESS_TOKEN;
const AMOCRM_PIPELINE_ID = Number(process.env.AMOCRM_PIPELINE_ID || 9714418);

function normalizeTarifTag(value) {
  const raw = String(value || "").trim().replace(/^#/, "").toLowerCase();
  if (raw === "elementary") return "elementary";
  if (raw === "nazoratli") return "nazoratli";
  if (raw === "nazoratsiz") return "nazoratsiz";
  return "forma";
}

async function getBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function amoRequest(path, payload) {
  const response = await fetch(`${AMOCRM_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AMOCRM_ACCESS_TOKEN}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!response.ok) {
    const error = new Error(`amoCRM request failed with status ${response.status}`);
    error.status = response.status;
    error.details = data;
    throw error;
  }
  return data;
}

module.exports = async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  if (!AMOCRM_ACCESS_TOKEN) {
    return res.status(500).json({ ok: false, error: "amoCRM env variables are missing" });
  }

  try {
    const body = await getBody(req);
    const name = String(body.Ism || body.name || "").trim();
    const phone = String(body.TelefonRaqam || body.phone || "").trim();
    const submittedAt = String(body.SanaSoat || body.time || "").trim();
    const tarifTag = normalizeTarifTag(body.tag || body.Tarif || body.tarif);
    if (!name || !phone) {
      return res.status(400).json({ ok: false, error: "Name and phone are required" });
    }

    const tags = [{ name: "newwebsite_2" }, { name: tarifTag }];
    const now = Math.floor(Date.now() / 1000);

    const payload = [
      {
        source_name: "website leadlar",
        source_uid: "vision-scholl-website",
        pipeline_id: AMOCRM_PIPELINE_ID,
        created_at: now,
        metadata: {
          form_id: "website-leadlar",
          form_name: tarifTag,
          form_page: "website leadlar",
          form_sent_at: now,
        },
        _embedded: {
          leads: [
            {
              name: name,
              _embedded: { tags },
            },
          ],
          contacts: [
            {
              name,
              custom_fields_values: [
                {
                  field_code: "PHONE",
                  values: [{ value: phone, enum_code: "WORK" }],
                },
              ],
            },
          ],
        },
      },
    ];

    const result = await amoRequest("/api/v4/leads/unsorted/forms", payload);

    return res.status(200).json({
      ok: true,
      tags: ["newwebsite_2", tarifTag],
      pipeline_id: AMOCRM_PIPELINE_ID,
      amo: result,
      time: submittedAt,
    });
  } catch (error) {
    console.error("amoCRM integration error:", error);
    return res.status(error.status || 500).json({
      ok: false,
      error: "amoCRM request failed",
      details: error.details || error.message,
    });
  }
};
