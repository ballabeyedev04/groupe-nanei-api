const { enveloppe, badge, echapper } = require('./layout');

// Accusé de réception envoyé au visiteur juste après sa demande — rassure
// sur la bonne prise en compte sans présumer d'un délai de réponse précis.
function devisConfirmationHtml({ nom }) {
  const corps = `
    <p style="margin:0 0 4px;">${badge('Demande reçue', '#0A5EA8', '#E6F1FB')}</p>
    <p style="margin:16px 0 0;">Bonjour ${echapper(nom)},</p>
    <p style="margin:12px 0 0;">
      Merci pour votre demande. Notre équipe l'étudie et revient vers vous dans les meilleurs délais pour échanger
      sur votre chantier et vos besoins logistiques.
    </p>
    <p style="margin:22px 0 0;font-weight:700;color:#073B6F;">L'équipe Groupe Nanei</p>
  `;

  return enveloppe({
    preheader: 'Votre demande de devis a bien été reçue.',
    titre: 'Votre demande a bien été reçue',
    soustitre: 'Nous revenons vers vous rapidement',
    corps,
  });
}

module.exports = { devisConfirmationHtml };
