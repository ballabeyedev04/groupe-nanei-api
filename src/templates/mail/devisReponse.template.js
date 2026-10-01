const { enveloppe, carteInfo, badge, listeBesoins, echapper } = require('./layout');

// Envoyé au demandeur quand l'admin clique « Répondre » — contient à la
// fois le message rédigé par l'admin ET un récapitulatif complet de la
// demande d'origine, pour que le destinataire n'ait pas à se souvenir de ce
// qu'il avait écrit plusieurs jours plus tôt.
function devisReponseHtml({ devis, message }) {
  // Champs du visiteur ET message de l'admin (texte brut saisi dans un
  // textarea) : échappés, puis retours à la ligne convertis.
  const e = (v) => (v ? echapper(v) : v);
  const avecRetours = (v) => echapper(v).replace(/\n/g, '<br/>');
  const messageHtml = avecRetours(message);

  const corps = `
    <p style="margin:0 0 6px;">Bonjour ${e(devis.nom)},</p>
    <p style="margin:0 0 4px;">${badge('Votre demande a été traitée', '#1F8A5F', '#E9F7EF')}</p>

    <div style="background:#EAF6FF;border-left:3px solid #0A5EA8;border-radius:0 10px 10px 0;padding:16px 18px;margin:18px 0;">
      <p style="margin:0;white-space:pre-wrap;">${messageHtml}</p>
    </div>

    ${carteInfo(
      [
        { label: 'Société', valeur: e(devis.societe), icone: '🏢' },
        { label: 'Téléphone', valeur: e(devis.telephone), icone: '📞' },
        { label: 'E-mail', valeur: e(devis.email), icone: '✉️' },
        { label: 'Ville / chantier', valeur: e(devis.ville), icone: '📍' },
        { label: 'Vos besoins', valeur: listeBesoins(devis.typesBesoin), icone: '🧰' },
        { label: 'Votre message initial', valeur: devis.message ? avecRetours(devis.message) : null, icone: '💬' },
      ],
      { titre: 'Récapitulatif de votre demande' }
    )}

    <p style="margin:22px 0 0;">
      Pour toute question complémentaire, il vous suffit de répondre directement à cet e-mail.
    </p>
    <p style="margin:18px 0 0;font-weight:700;color:#073B6F;">L'équipe Groupe Nanei</p>
  `;

  return enveloppe({
    preheader: `Réponse à votre demande de devis — ${e(devis.nom)}`,
    titre: 'Réponse à votre demande de devis',
    soustitre: 'Groupe Nanei — Logistique de chantier',
    corps,
  });
}

module.exports = { devisReponseHtml };
