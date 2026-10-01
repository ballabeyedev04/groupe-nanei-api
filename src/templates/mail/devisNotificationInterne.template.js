const { enveloppe, carteInfo, badge, listeBesoins, echapper } = require('./layout');

// Prévient l'équipe interne dès qu'une demande arrive, avec l'essentiel pour
// juger de l'urgence sans avoir à ouvrir l'admin.
function devisNotificationInterneHtml({ nom, societe, telephone, email, ville, typesBesoin, message }) {
  // Toutes ces valeurs viennent du formulaire public : échappées avant insertion.
  const e = (v) => (v ? echapper(v) : v);
  const messageHtml = message ? echapper(message).replace(/\n/g, '<br/>') : '';

  const corps = `
    <p style="margin:0 0 4px;">${badge('Nouvelle demande', '#0A5EA8', '#E6F1FB')}</p>

    ${carteInfo(
      [
        { label: 'Nom', valeur: `<strong>${e(nom)}</strong>`, icone: '👤' },
        { label: 'Société', valeur: e(societe), icone: '🏢' },
        { label: 'Téléphone', valeur: `<a href="tel:${e(telephone)}" style="color:#0A5EA8;text-decoration:none;">${e(telephone)}</a>`, icone: '📞' },
        { label: 'E-mail', valeur: `<a href="mailto:${e(email)}" style="color:#0A5EA8;text-decoration:none;">${e(email)}</a>`, icone: '✉️' },
        { label: 'Ville / chantier', valeur: e(ville), icone: '📍' },
        { label: 'Besoins', valeur: listeBesoins(typesBesoin), icone: '🧰' },
      ],
      { titre: 'Coordonnées du demandeur' }
    )}

    <div style="margin-top:6px;">
      <div style="color:#0A5EA8;font-size:12px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:8px;">Message</div>
      <p style="margin:0;padding:16px 18px;background:#EAF6FF;border-radius:10px;white-space:pre-wrap;">${messageHtml}</p>
    </div>

    <p style="margin:22px 0 0;">Ouvrez l'espace admin pour répondre directement au demandeur.</p>
  `;

  return enveloppe({
    preheader: `Nouvelle demande de devis — ${e(nom)}`,
    titre: 'Nouvelle demande de devis',
    soustitre: 'Reçue depuis le site vitrine',
    corps,
  });
}

module.exports = { devisNotificationInterneHtml };
