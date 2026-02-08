import { Resend } from 'resend'

let resend: Resend | null = null

export function getResend(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is not set')
    }
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

export const EMAIL_FROM = 'MarketManager <hello@timpia.ai>'

export interface LeadEmailData {
  clientId?: string
  nume_complet?: string
  firma?: string
  nr_locatii?: string
  email?: string
  telefon?: string
  telefon_whatsapp?: string
  functionalitati_dorite?: string
  alte_nevoi?: string | null
}

export function generateLeadNotificationEmail(lead: LeadEmailData): {
  subject: string
  html: string
  text: string
} {
  const subject = `🎯 Lead nou: ${lead.firma || lead.nume_complet || 'Client nou'}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎯 Lead Nou Primit</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">MarketManager Dashboard</p>
  </div>

  <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; border-top: none;">
    <h2 style="color: #333; margin-top: 0; font-size: 18px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Detalii Contact</h2>

    <table style="width: 100%; border-collapse: collapse;">
      ${lead.nume_complet ? `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; font-weight: 600; color: #555; width: 40%;">👤 Nume complet</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">${lead.nume_complet}</td>
      </tr>` : ''}

      ${lead.firma ? `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; font-weight: 600; color: #555;">🏢 Firmă</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">${lead.firma}</td>
      </tr>` : ''}

      ${lead.nr_locatii ? `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; font-weight: 600; color: #555;">📍 Nr. locații</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">${lead.nr_locatii}</td>
      </tr>` : ''}

      ${lead.email ? `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; font-weight: 600; color: #555;">📧 Email</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;"><a href="mailto:${lead.email}" style="color: #667eea;">${lead.email}</a></td>
      </tr>` : ''}

      ${lead.telefon || lead.telefon_whatsapp ? `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; font-weight: 600; color: #555;">📱 Telefon</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">${lead.telefon || lead.telefon_whatsapp}</td>
      </tr>` : ''}

      ${lead.functionalitati_dorite ? `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; font-weight: 600; color: #555;">✨ Funcționalități dorite</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">${lead.functionalitati_dorite}</td>
      </tr>` : ''}

      ${lead.alte_nevoi ? `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; font-weight: 600; color: #555;">📝 Alte nevoi</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">${lead.alte_nevoi}</td>
      </tr>` : ''}

      ${lead.clientId ? `
      <tr>
        <td style="padding: 12px 0; font-weight: 600; color: #555;">🔖 Client ID</td>
        <td style="padding: 12px 0; font-family: monospace; background: #f1f3f4; padding: 4px 8px; border-radius: 4px; font-size: 13px;">${lead.clientId}</td>
      </tr>` : ''}
    </table>
  </div>

  <div style="background: #fff; padding: 25px 30px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 12px 12px;">
    <a href="https://dashboard.timpia.ai/leads" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
      📊 Vezi în Dashboard
    </a>

    <p style="margin-top: 20px; font-size: 13px; color: #888;">
      Acest email a fost trimis automat de MarketManager Dashboard când un nou lead a fost înregistrat.
    </p>
  </div>
</body>
</html>
`

  const text = `
🎯 LEAD NOU PRIMIT - MarketManager Dashboard

DETALII CONTACT:
${lead.nume_complet ? `👤 Nume complet: ${lead.nume_complet}` : ''}
${lead.firma ? `🏢 Firmă: ${lead.firma}` : ''}
${lead.nr_locatii ? `📍 Nr. locații: ${lead.nr_locatii}` : ''}
${lead.email ? `📧 Email: ${lead.email}` : ''}
${lead.telefon || lead.telefon_whatsapp ? `📱 Telefon: ${lead.telefon || lead.telefon_whatsapp}` : ''}
${lead.functionalitati_dorite ? `✨ Funcționalități dorite: ${lead.functionalitati_dorite}` : ''}
${lead.alte_nevoi ? `📝 Alte nevoi: ${lead.alte_nevoi}` : ''}
${lead.clientId ? `🔖 Client ID: ${lead.clientId}` : ''}

📊 Vezi în Dashboard: https://dashboard.timpia.ai/leads
`.trim()

  return { subject, html, text }
}
