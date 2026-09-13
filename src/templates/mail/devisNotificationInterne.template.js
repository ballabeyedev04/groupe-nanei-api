const { enveloppe } = require('./layout');

// Prévient l'équipe interne dès qu'une demande arrive, avec l'essentiel pour
// juger de l'urgence sans avoir à ouvrir l'admin.
function devisNotificationInterneHtml({ nom, societe, telephone, email, ville, typeBesoin, message }) {
  return enveloppe({
    preheader: `Nouvelle demande de devis — ${nom}`,
    titre: 'Nouvelle demande de devis',
    corps: `
      <table role="presentation" width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;">
        <tr><td style="color:#5B7A93;width:120px;">Nom</td><td><strong>${nom}</strong></td></tr>
        ${societe ? `<tr><td style="color:#5B7A93;">Société</td><td>${societe}</td></tr>` : ''}
        <tr><td style="color:#5B7A93;">Téléphone</td><td><a href="tel:${telephone}" style="color:#0A5EA8;">${telephone}</a></td></tr>
        <tr><td style="color:#5B7A93;">E-mail</td><td><a href="mailto:${email}" style="color:#0A5EA8;">${email}</a></td></tr>
        ${ville ? `<tr><td style="color:#5B7A93;">Ville / chantier</td><td>${ville}</td></tr>` : ''}
        ${typeBesoin ? `<tr><td style="color:#5B7A93;">Besoin</td><td>${typeBesoin}</td></tr>` : ''}
      </table>
      <p style="margin-top:16px;padding:12px 16px;background:#EAF6FF;border-radius:8px;white-space:pre-wrap;">${message}</p>
    `,
  });
}

module.exports = { devisNotificationInterneHtml };
