import { NextRequest, NextResponse } from "next/server";
import { installations, getAllAlerts, getKPIs } from "@/data/mockData";

// ─── CONFIGURACIÓN N8N ───
// Tu compañero del agente n8n debe proporcionar estas URLs:
// - Webhook URL: la URL del nodo "Webhook" en n8n (método POST)
// - Test URL: para desarrollo local de n8n
const N8N_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ||
  "http://localhost:5678/webhook/iris-solar-chat";

const N8N_TEST_URL =
  process.env.N8N_TEST_URL ||
  "http://localhost:5678/webhook-test/iris-solar-chat";

// Usar test URL en desarrollo, webhook URL en producción
const WEBHOOK_URL =
  process.env.NODE_ENV === "production" ? N8N_WEBHOOK_URL : N8N_TEST_URL;

// ─── CONTEXTO DE DATOS PARA N8N ───
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
  try {
    const { message, history } = await req.json();

    // Si no hay webhook configurado, usar fallback
    if (
      !process.env.N8N_WEBHOOK_URL &&
      !process.env.N8N_TEST_URL
    ) {
      const response = generateFallbackResponse(message);
      return NextResponse.json({ response, mode: "fallback" });
    }

    // Payload para n8n
    const payload = {
      message,
      history: history || [],
      context: buildContextPayload(),
      timestamp: new Date().toISOString(),
    };

    // Llamar al webhook de n8n
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000), // 15s timeout
    });

    if (!response.ok) {
      throw new Error(`n8n webhook returned ${response.status}`);
    }

    const data = await response.json();

    // n8n debe devolver: { response: "texto de respuesta" }
    // Si devuelve otro formato, intentar extraer el texto
    const reply =
      data.response || data.reply || data.message || data.output || data.text;

    if (!reply) {
      console.warn("n8n response missing expected field, using fallback");
      const fallback = generateFallbackResponse(message);
      return NextResponse.json({ response: fallback, mode: "fallback" });
    }

    return NextResponse.json({ response: reply, mode: "n8n" });
  } catch (error) {
    console.error("n8n webhook error:", error);
    // Fallback si n8n no responde
    const { message } = await req.json().catch(() => ({ message: "" }));
    const fallback = generateFallbackResponse(message);
    return NextResponse.json({ response: fallback, mode: "fallback" });
  }
}

// ─── FALLBACK (se usa si n8n no está disponible) ───
function generateFallbackResponse(message: string): string {
  const msg = message.toLowerCase();

  if (
    msg.includes("más generó") ||
    msg.includes("mas genero") ||
    msg.includes("mayor generación")
  ) {
    const sorted = [...installations].sort(
      (a, b) => b.generationMonthKwh - a.generationMonthKwh,
    );
    const top3 = sorted.slice(0, 3);
    return `🏆 Las instalaciones que más generaron este mes son:\n\n1. **${top3[0].name}** - ${top3[0].generationMonthKwh.toLocaleString("es-AR")} kWh (${top3[0].powerKwp} kWp)\n2. **${top3[1].name}** - ${top3[1].generationMonthKwh.toLocaleString("es-AR")} kWh (${top3[1].powerKwp} kWp)\n3. **${top3[2].name}** - ${top3[2].generationMonthKwh.toLocaleString("es-AR")} kWh (${top3[2].powerKwp} kWp)\n\nEn total, las ${installations.length} instalaciones generaron ${getKPIs().totalTodayKwh.toLocaleString("es-AR")} kWh hoy.`;
  }

  if (msg.includes("alerta")) {
    const withAlerts = installations.filter((i) => i.alerts.length > 0);
    let response = `⚠️ Hay **${getAllAlerts().length} alertas activas** en el sistema:\n\n`;
    withAlerts.forEach((inst) => {
      inst.alerts.forEach((alert) => {
        response += `• **${inst.name}** [${alert.severity}]: ${alert.message}\n`;
      });
    });
    return response;
  }

  if (msg.includes("resumen") || msg.includes("ejecutivo")) {
    const kpis = getKPIs();
    const withAlerts = installations.filter((i) => i.alerts.length > 0);
    const inMaintenance = installations.filter(
      (i) => i.status === "mantenimiento",
    );
    return `📊 **Resumen Ejecutivo - IRIS Solar Platform**\n\n🔋 **Estado General:**\n• ${kpis.active} de ${installations.length} instalaciones operativas\n• ${kpis.totalMw.toFixed(1)} MW totales instalados\n• ${kpis.totalTodayKwh.toLocaleString("es-AR")} kWh generados hoy\n\n⚠️ **Atención requerida:**\n• ${getAllAlerts().length} alertas activas en ${withAlerts.length} instalaciones\n• ${inMaintenance.length} instalación(es) en mantenimiento\n\n🏆 **Top generación hoy:**\n• Estancia Santa Rosa: 960 kWh\n• Agroindustrial Oncativo: 720 kWh\n• Establecimiento San Antonio: 624 kWh\n\nEl sistema opera dentro de parámetros normales en la mayoría de las instalaciones.`;
  }

  if (msg.includes("mantenimiento") || msg.includes("mantenimientos")) {
    const upcoming = [...installations]
      .sort((a, b) => a.nextMaintenance.localeCompare(b.nextMaintenance))
      .slice(0, 5);
    let response = `🔧 **Próximos mantenimientos:**\n\n`;
    upcoming.forEach((inst) => {
      response += `• **${inst.name}** - ${inst.nextMaintenance} (${inst.location})\n`;
    });
    const inMaint = installations.filter((i) => i.status === "mantenimiento");
    if (inMaint.length > 0) {
      response += `\n🟡 **En mantenimiento ahora:**\n`;
      inMaint.forEach((inst) => {
        response += `• ${inst.name}\n`;
      });
    }
    return response;
  }

  if (
    msg.includes("lácteos") ||
    msg.includes("linea dorada") ||
    msg.includes("línea dorada")
  ) {
    const inst = installations.find((i) => i.name.includes("Lácteos"));
    if (inst) {
      return `🏭 **${inst.name}**\n\n📍 ${inst.location}\n⚡ Potencia: ${inst.powerKwp} kWp\n🔆 Paneles: ${inst.panelCount} x ${inst.panelBrand}\n🔄 Inversor: ${inst.inverterBrand} ${inst.inverterModel} (${inst.inverterPowerKw} kW)\n\n📊 **Generación:**\n• Hoy: ${inst.generationTodayKwh} kWh\n• Este mes: ${inst.generationMonthKwh.toLocaleString("es-AR")} kWh\n• Inyectada a red: ${inst.energyInjectedKwh.toLocaleString("es-AR")} kWh\n• Autoconsumo: ${inst.energyConsumedKwh.toLocaleString("es-AR")} kWh\n\nEstado: ${inst.status} ✅`;
    }
  }

  if (
    msg.includes("cuánta energía") ||
    msg.includes("cuanta energia") ||
    msg.includes("inyectó") ||
    msg.includes("inyecto")
  ) {
    const instName = msg
      .replace(
        /cuánta energía|cuanta energia|inyectó|inyecto|el cliente|la/gi,
        "",
      )
      .trim();
    const found = installations.find(
      (i) =>
        i.name.toLowerCase().includes(instName) ||
        instName.includes(i.name.toLowerCase().split(" ")[0]),
    );
    if (found) {
      return `⚡ **${found.name}** inyectó **${found.energyInjectedKwh.toLocaleString("es-AR")} kWh** a la red este mes.\n\nDe un total de ${found.generationMonthKwh.toLocaleString("es-AR")} kWh generados:\n• ${found.energyInjectedKwh.toLocaleString("es-AR")} kWh inyectados a red (${Math.round((found.energyInjectedKwh / found.generationMonthKwh) * 100)}%)\n• ${found.energyConsumedKwh.toLocaleString("es-AR")} kWh de autoconsumo`;
    }
  }

  if (
    msg.includes("hola") ||
    msg.includes("buenas") ||
    msg.includes("buen día")
  ) {
    return `¡Hola! 👋 Soy el asistente de IRIS Solar Platform.\n\nPuedo ayudarte con:\n• 📊 Resumen ejecutivo del sistema\n• 🏆 Instalaciones con mayor generación\n• ⚠️ Alertas activas\n• 🔧 Próximos mantenimientos\n• 📋 Detalle de cualquier instalación\n\n¿Qué querés saber?`;
  }

  // Default
  return `Entiendo tu consulta. Para darte la mejor respuesta, te sugiero preguntarme sobre:\n\n• "Dame un resumen ejecutivo de hoy"\n• "¿Cuál es la instalación que más generó este mes?"\n• "¿Qué parques tienen alertas activas?"\n• "¿Qué instalaciones necesitan mantenimiento pronto?"\n• "¿Cuánta energía inyectó [nombre de instalación]?"\n\nTambién podés preguntarme por cualquier instalación específica por su nombre.`;
}
