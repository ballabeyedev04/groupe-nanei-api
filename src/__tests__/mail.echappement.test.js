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
