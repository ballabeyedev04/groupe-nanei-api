const { enveloppe } = require('./layout');

// Le message est saisi librement par l'admin (bouton "Répondre") : on le
// respecte tel quel (juste le retour à la ligne → <br/>), sans reformulation.
function devisReponseHtml({ nom, message }) {
  const messageHtml = String(message).replace(/\n/g, '<br/>');
  return enveloppe({
    preheader: 'Réponse à votre demande de devis',
    titre: `Bonjour ${nom},`,
    corps: `
      <p>${messageHtml}</p>
      <p style="margin-top:24px;">L'équipe Groupe Nanei</p>
    `,
  });
}

module.exports = { devisReponseHtml };
