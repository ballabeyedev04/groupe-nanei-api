// Emballage HTML commun à tous les e-mails du site — mêmes couleurs que la
// direction artistique du site vitrine (cahier §1) : bleu marine (#073B6F)
// pour l'en-tête, bleu ciel (#EAF6FF) pour le fond, bleu action (#0A5EA8)
// pour les liens/boutons.
function enveloppe({ preheader = '', titre, corps }) {
  return `<!doctype html>
<html lang="fr">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
  <body style="margin:0;padding:0;background:#EAF6FF;font-family:Arial,Helvetica,sans-serif;">
    <span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EAF6FF;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:#073B6F;padding:20px 28px;">
                <span style="color:#FFFFFF;font-size:18px;font-weight:bold;letter-spacing:0.5px;">GROUPE NANEI</span>
                <div style="color:#CFEAFF;font-size:11px;letter-spacing:1px;">LOGISTIQUE DE CHANTIER</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <h1 style="color:#073B6F;font-size:20px;margin:0 0 16px;">${titre}</h1>
                <div style="color:#1F2937;font-size:14px;line-height:1.6;">${corps}</div>
              </td>
            </tr>
            <tr>
              <td style="background:#F5FAFF;padding:16px 28px;color:#5B7A93;font-size:11px;">
                Groupe Nanei — Logistique de chantier · Île-de-France et toute la France
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

module.exports = { enveloppe };
