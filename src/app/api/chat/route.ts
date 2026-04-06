import { NextRequest, NextResponse } from "next/server";
import { installations, getAllAlerts, getKPIs } from "@/data/mockData";

const N8N_WEBHOOK_ID = "fd961bb8-31a4-4cf8-a820-00de3e595a36";

const N8N_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ||
  `http://localhost:5678/webhook/${N8N_WEBHOOK_ID}`;

const N8N_TEST_URL =
  process.env.N8N_TEST_URL ||
  `http://localhost:5678/webhook-test/${N8N_WEBHOOK_ID}`;

const WEBHOOK_URL =
  process.env.NODE_ENV === "production" ? N8N_WEBHOOK_URL : N8N_TEST_URL;

function buildContextPayload() {
  return {
    installations: installations.map((inst) => ({
      id: inst.id,
      name: inst.name,
      location: inst.location,
      powerKwp: inst.powerKwp,
      panelCount: inst.panelCount,
      panelBrand: inst.panelBrand,
      inverterBrand: inst.inverterBrand,
      inverterModel: inst.inverterModel,
      status: inst.status,
      generationTodayKwh: inst.generationTodayKwh,
      generationMonthKwh: inst.generationMonthKwh,
      energyInjectedKwh: inst.energyInjectedKwh,
      energyConsumedKwh: inst.energyConsumedKwh,
      clientType: inst.clientType,
      nextMaintenance: inst.nextMaintenance,
      alerts: inst.alerts.map((a) => ({
        severity: a.severity,
        message: a.message,
      })),
    })),
    kpis: getKPIs(),
    totalAlerts: getAllAlerts().length,
  };
}

export async function POST(req: NextRequest) {
  let message = "";
  let history: unknown[] = [];

  try {
    const body = await req.json();
    message = typeof body.message === "string" ? body.message : "";
    history = Array.isArray(body.history) ? body.history : [];
    const sessionId =
      typeof body.sessionId === "string" && body.sessionId.trim()
        ? body.sessionId.trim()
        : `web-${Date.now()}`;
    const context = buildContextPayload();

    const payload = {
      message,
      query: message,
      chatInput: message,
      input: message,
      history,
      sessionId,
      context,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook returned ${response.status}`);
    }

    const data = await response.json();

    const outputText =
      typeof data.output === "string"
        ? data.output
        : typeof data.output === "object" && data.output !== null
          ? (data.output as { text?: unknown }).text
          : undefined;

    const reply = (
      data.response ||
      data.reply ||
      data.message ||
      data.text ||
      outputText
    )?.toString();

    if (!reply) {
      throw new Error("n8n response missing text field");
    }

    return NextResponse.json({ response: reply, mode: "n8n" });
  } catch (error) {
    console.error("n8n webhook error:", error);
    return NextResponse.json(
      {
        error:
          "No se pudo obtener respuesta del agente n8n. Verificá que el workflow esté activo y el webhook configurado.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 },
    );
  }
}
