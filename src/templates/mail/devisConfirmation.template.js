const { enveloppe } = require('./layout');

// Accusé de réception envoyé au visiteur juste après sa demande — rassure
// sur la bonne prise en compte sans présumer d'un délai de réponse précis.
function devisConfirmationHtml({ nom }) {
  return enveloppe({
    preheader: 'Votre demande de devis a bien été reçue.',
    titre: 'Votre demande a bien été reçue',
    corps: `
      <p>Bonjour ${nom},</p>
      <p>Merci pour votre demande. Notre équipe l'étudie et revient vers vous dans les meilleurs délais pour échanger sur votre chantier et vos besoins logistiques.</p>
      <p>À très bientôt,<br/>L'équipe Groupe Nanei</p>
    `,
  });
}

module.exports = { devisConfirmationHtml };
