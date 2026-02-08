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
  const subject = `Lead nou: ${lead.firma || lead.nume_complet || 'Client nou'}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #1a1a1a; padding: 24px 30px;">
    <h1 style="color: #fff; margin: 0; font-size: 20px; font-weight: 500;">Lead Nou</h1>
    <p style="color: #888; margin: 4px 0 0 0; font-size: 14px;">MarketManager Dashboard</p>
  </div>

  <div style="background: #fff; padding: 30px; border: 1px solid #e5e5e5; border-top: none;">
    <h2 style="color: #333; margin-top: 0; font-size: 16px; font-weight: 600; margin-bottom: 20px;">Detalii Contact</h2>

    <table style="width: 100%; border-collapse: collapse;">
      ${lead.nume_complet ? `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 500; color: #666; width: 40%;">Nume complet</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${lead.nume_complet}</td>
      </tr>` : ''}

      ${lead.firma ? `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 500; color: #666;">Firma</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${lead.firma}</td>
      </tr>` : ''}

      ${lead.nr_locatii ? `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 500; color: #666;">Nr. locatii</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${lead.nr_locatii}</td>
      </tr>` : ''}

      ${lead.email ? `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 500; color: #666;">Email</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><a href="mailto:${lead.email}" style="color: #333;">${lead.email}</a></td>
      </tr>` : ''}

      ${lead.telefon || lead.telefon_whatsapp ? `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 500; color: #666;">Telefon</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${lead.telefon || lead.telefon_whatsapp}</td>
      </tr>` : ''}

      ${lead.functionalitati_dorite ? `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 500; color: #666;">Functionalitati dorite</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${lead.functionalitati_dorite}</td>
      </tr>` : ''}

      ${lead.alte_nevoi ? `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 500; color: #666;">Alte nevoi</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${lead.alte_nevoi}</td>
      </tr>` : ''}

      ${lead.clientId ? `
      <tr>
        <td style="padding: 10px 0; font-weight: 500; color: #666;">Client ID</td>
        <td style="padding: 10px 0; font-family: monospace; font-size: 13px;">${lead.clientId}</td>
      </tr>` : ''}
    </table>
  </div>

  <div style="background: #fafafa; padding: 20px 30px; border: 1px solid #e5e5e5; border-top: none;">
    <a href="https://dashboard.timpia.ai/leads" style="display: inline-block; background: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; font-weight: 500; font-size: 14px;">
      Vezi in Dashboard
    </a>

    <p style="margin-top: 16px; font-size: 12px; color: #888;">
      Email trimis automat de MarketManager Dashboard.
    </p>
  </div>
</body>
</html>
`

  const text = `
LEAD NOU - MarketManager Dashboard

DETALII CONTACT:
${lead.nume_complet ? `Nume complet: ${lead.nume_complet}` : ''}
${lead.firma ? `Firma: ${lead.firma}` : ''}
${lead.nr_locatii ? `Nr. locatii: ${lead.nr_locatii}` : ''}
${lead.email ? `Email: ${lead.email}` : ''}
${lead.telefon || lead.telefon_whatsapp ? `Telefon: ${lead.telefon || lead.telefon_whatsapp}` : ''}
${lead.functionalitati_dorite ? `Functionalitati dorite: ${lead.functionalitati_dorite}` : ''}
${lead.alte_nevoi ? `Alte nevoi: ${lead.alte_nevoi}` : ''}
${lead.clientId ? `Client ID: ${lead.clientId}` : ''}

Vezi in Dashboard: https://dashboard.timpia.ai/leads
`.trim()

  return { subject, html, text }
}
