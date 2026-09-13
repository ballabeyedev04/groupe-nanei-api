// Emballage HTML commun à tous les e-mails du site — mêmes couleurs que la
// direction artistique du site vitrine (cahier §1) : bleu marine (#073B6F)
// pour l'en-tête/pied de page, bleu ciel (#EAF6FF/#CFEAFF) pour les fonds
// doux, bleu action (#0A5EA8) pour les liens et accents.
//
// Contraintes e-mail (Outlook desktop en tête) : pas de box-shadow, pas de
// dégradé CSS fiable, pas de logo raster (aucun fichier PNG/SVG définitif
// fourni par le client — voir web/src/components/public/Logo.jsx) → la
// carte est délimitée par une bordure fine plutôt qu'une ombre, et l'en-tête
// reste une identité typographique soignée plutôt qu'une image.
function enveloppe({ preheader = '', titre, soustitre = '', corps, pied = '' }) {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
  </head>
  <body style="margin:0;padding:0;background:#EAF6FF;font-family:'Segoe UI',Arial,Helvetica,sans-serif;">
    <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EAF6FF;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;border:1px solid #CFEAFF;overflow:hidden;">
            <!-- Liseré d'accent -->
            <tr><td style="background:#0A5EA8;height:4px;line-height:4px;font-size:0;">&nbsp;</td></tr>

            <!-- En-tête -->
            <tr>
              <td style="background:#073B6F;padding:28px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <span style="color:#FFFFFF;font-size:20px;font-weight:800;letter-spacing:0.4px;">GROUPE NANEI</span>
                      <div style="color:#9FC3E0;font-size:11px;letter-spacing:1.6px;margin-top:2px;">LOGISTIQUE DE CHANTIER</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Corps -->
            <tr>
              <td style="padding:34px 32px 8px;">
                <h1 style="color:#073B6F;font-size:21px;font-weight:800;margin:0 0 6px;line-height:1.3;">${titre}</h1>
                ${soustitre ? `<p style="color:#5B7A93;font-size:13.5px;margin:0 0 24px;">${soustitre}</p>` : '<div style="height:20px;"></div>'}
                <div style="color:#16324A;font-size:14.5px;line-height:1.65;">${corps}</div>
              </td>
            </tr>

            <tr><td style="padding:8px 32px 32px;">${pied}</td></tr>

            <!-- Pied de page -->
            <tr>
              <td style="background:#F5FAFF;border-top:1px solid #E3F1FC;padding:18px 32px;">
                <p style="margin:0;color:#5B7A93;font-size:11.5px;line-height:1.6;">
                  Groupe Nanei — Logistique de chantier · Île-de-France et toute la France
                </p>
              </td>
            </tr>
          </table>
          <p style="max-width:600px;margin:16px auto 0;color:#8FAFC7;font-size:11px;text-align:center;">
            Cet e-mail vous est envoyé par Groupe Nanei suite à une demande effectuée sur notre site.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// Bloc « carte » réutilisé pour récapituler les champs d'une demande de
// devis — mêmes lignes que le formulaire public, dans le même ordre, pour
// que le destinataire reconnaisse immédiatement sa propre demande.
function carteInfo(lignes, { titre } = {}) {
  const visibles = lignes.filter((l) => l && l.valeur);
  const corpsLignes = visibles
    .map(
      (l, i) => `
        <tr>
          <td style="padding:10px 0;${i < visibles.length - 1 ? 'border-bottom:1px solid #E3F1FC;' : ''}width:150px;color:#5B7A93;font-size:12.5px;font-weight:600;vertical-align:top;">
            ${l.icone ? `${l.icone} ` : ''}${l.label}
          </td>
          <td style="padding:10px 0;${i < visibles.length - 1 ? 'border-bottom:1px solid #E3F1FC;' : ''}color:#16324A;font-size:14px;vertical-align:top;">
            ${l.valeur}
          </td>
        </tr>`
    )
    .join('');

  return `
    <div style="background:#F5FAFF;border:1px solid #E3F1FC;border-radius:12px;padding:18px 20px;margin:18px 0;">
      ${titre ? `<div style="color:#0A5EA8;font-size:12px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:6px;">${titre}</div>` : ''}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${corpsLignes}</table>
    </div>`;
}

// Petit badge de statut (utilisé pour distinguer visuellement les e-mails).
function badge(texte, couleur = '#0A5EA8', fond = '#E6F1FB') {
  return `<span style="display:inline-block;background:${fond};color:${couleur};font-size:11.5px;font-weight:700;letter-spacing:0.03em;padding:4px 12px;border-radius:999px;">${texte}</span>`;
}

module.exports = { enveloppe, carteInfo, badge };
