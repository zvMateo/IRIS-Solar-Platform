import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { installations, getAllAlerts, getKPIs } from "@/data/mockData";

function isValidApiKey(key: string | undefined): boolean {
  if (!key || key.length < 20) return false;
  if (!key.startsWith("sk-proj-") && !key.startsWith("sk-")) return false;
  // Reject common placeholder patterns
  if (key.includes("your") || key.includes("placeholder") || key.includes("demo") || key.includes("example")) return false;
  return true;
}

const SYSTEM_PROMPT = `Eres el asistente inteligente de IRIS Solar Platform, una plataforma de monitoreo de instalaciones solares en Córdoba, Argentina.

CONTEXTO DEL SISTEMA - DATOS ACTUALES:

${installations.map((inst) => `- ${inst.name} (${inst.location}): ${inst.powerKwp} kWp, ${inst.panelCount} paneles ${inst.panelBrand}, inversor ${inst.inverterBrand} ${inst.inverterModel} de ${inst.inverterPowerKw}kW. Estado: ${inst.status}. Generación hoy: ${inst.generationTodayKwh} kWh. Generación mensual: ${inst.generationMonthKwh} kWh. Energía inyectada: ${inst.energyInjectedKwh} kWh. Energía consumida: ${inst.energyConsumedKwh} kWh. Tipo: ${inst.clientType}. Próximo mantenimiento: ${inst.nextMaintenance}. Alertas: ${inst.alerts.length > 0 ? inst.alerts.map((a) => `[${a.severity}] ${a.message}`).join(", ") : "Sin alertas"}.`).join("\n")}

KPIs TOTALES:
- Instalaciones activas: ${getKPIs().active} de ${installations.length}
- MW totales: ${getKPIs().totalMw.toFixed(1)} MW
- kWh generados hoy: ${getKPIs().totalTodayKwh.toLocaleString("es-AR")}
- Alertas activas: ${getAllAlerts().length}

INSTRUCCIONES:
- Respondé siempre en español rioplatense (usá "vos", "che" si es natural).
- Sé conciso pero informativo. Usá datos numéricos reales del contexto.
- Si te preguntan por una instalación específica, buscá por nombre.
- Si te preguntan por la que más generó, compará generationMonthKwh.
- Si te preguntan por alertas, listá las instalaciones con alerts.length > 0.
- Si te preguntan por mantenimiento, mirá nextMaintenance.
- Si te preguntan por un resumen ejecutivo, dá un overview con los KPIs y las alertas más importantes.
- Si no tenés información para responder, decí que no contás con ese dato pero ofrecé información relacionada.
- Usá formato markdown básico para listas y negritas.
- No inventes datos. Usá solo los datos proporcionados en el contexto.`;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!isValidApiKey(process.env.OPENAI_API_KEY)) {
      const response = generateFallbackResponse(message);
      return NextResponse.json({ response, mode: "fallback" });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history || []).map((msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 800,
      temperature: 0.3,
    });

    const response =
      completion.choices[0]?.message?.content ||
      "No pude generar una respuesta.";

    return NextResponse.json({ response, mode: "openai" });
  } catch (error) {
    console.error("Chat API error:", error);
    const fallback = generateFallbackResponse("");
    return NextResponse.json({ response: fallback, mode: "fallback" });
  }
}

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
