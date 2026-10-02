const { Resend } = require('resend');
const env = require('../config/env');

// Instancié une seule fois. Si la clé API n'est pas configurée (ex. en test
// ou en développement local sans Resend), on ne plante pas le process — on
// journalise et on laisse l'appelant décider (voir chaque `send*` ci-dessous,
// aucun n'est censé faire échouer l'action métier qui les déclenche).
const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

// `piecesJointes` : [{ nom, contenu (Buffer) }], optionnel.
async function envoyer({ to, subject, html, piecesJointes = [] }) {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY absent — envoi ignoré (mode dev/test).', { to, subject });
    return null;
  }
  try {
    const { data, error } = await resend.emails.send({
      from: env.resendFrom,
      to,
      subject,
      html,
      ...(piecesJointes.length > 0 && {
        attachments: piecesJointes.map((p) => ({ filename: p.nom, content: p.contenu })),
      }),
    });
    if (error) {
      console.error('[email] échec Resend', error);
      return null;
    }
    return data;
  } catch (e) {
    console.error('[email] exception Resend', e);
    return null;
  }
}

module.exports = { envoyer };
