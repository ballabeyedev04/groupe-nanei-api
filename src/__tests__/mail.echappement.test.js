// Les valeurs saisies sur le formulaire public ne doivent jamais injecter de
// HTML dans l'e-mail reçu par l'équipe interne.
const { devisNotificationInterneHtml } = require('../templates/mail/devisNotificationInterne.template');

const piege = '<script>alert(1)</script>';

describe('devisNotificationInterneHtml — échappement', () => {
  const html = devisNotificationInterneHtml({
    nom: `Jean ${piege}`,
    societe: `<b>Société</b>`,
    telephone: `06"><img src=x>`,
    email: 'jean@example.com',
    ville: `<i>Lyon</i>`,
    typesBesoin: ['Gestion des bennes'],
    message: `Première ligne\n${piege}`,
  });

  it("n'insère aucune balise saisie par le visiteur", () => {
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<b>Société</b>');
    expect(html).not.toContain('<i>Lyon</i>');
    expect(html).not.toContain('<img src=x>');
  });

  it('affiche les valeurs échappées, y compris dans les attributs', () => {
    expect(html).toContain('Jean &lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('href="tel:06&quot;&gt;&lt;img src=x&gt;"');
  });

  it('conserve les retours à la ligne du message', () => {
    expect(html).toContain('Première ligne<br/>&lt;script&gt;');
  });
});

describe('devisConfirmationHtml — échappement', () => {
  const { devisConfirmationHtml } = require('../templates/mail/devisConfirmation.template');

  it('échappe le nom du visiteur', () => {
    const html = devisConfirmationHtml({ nom: `Jean ${piege}` });
    expect(html).not.toContain('<script>');
    expect(html).toContain('Bonjour Jean &lt;script&gt;');
  });
});

describe('devisReponseHtml — échappement', () => {
  const { devisReponseHtml } = require('../templates/mail/devisReponse.template');

  const html = devisReponseHtml({
    devis: {
      nom: `Jean ${piege}`,
      societe: '<b>Société</b>',
      telephone: '0601020304',
      email: 'jean@example.com',
      ville: '<i>Lyon</i>',
      typesBesoin: ['Gestion des bennes'],
      message: `Demande initiale\n${piege}`,
    },
    // Texte brut de l'admin : un « < » doit s'afficher tel quel.
    message: 'Bonjour,\nDélai < 48 h & devis joint.',
  });

  it("n'insère aucune balise saisie par le visiteur", () => {
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<b>Société</b>');
    expect(html).not.toContain('<i>Lyon</i>');
  });

  it("affiche le message de l'admin tel qu'il l'a tapé, retours à la ligne compris", () => {
    expect(html).toContain('Bonjour,<br/>Délai &lt; 48 h &amp; devis joint.');
  });

  it('conserve les retours à la ligne du message initial', () => {
    expect(html).toContain('Demande initiale<br/>&lt;script&gt;');
  });
});
