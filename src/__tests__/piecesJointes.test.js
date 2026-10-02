// Pièces jointes de la réponse à une demande de devis : réception multipart
// (middleware réel, monté sur une mini-app Express) et transmission à l'e-mail.
const express = require('express');

jest.mock('../models', () => ({
  Devis: { create: jest.fn(), findByPk: jest.fn(), findAndCountAll: jest.fn() },
  AdminUser: {},
}));
jest.mock('../infrastructure/emailService', () => ({ envoyer: jest.fn() }));

const { Devis } = require('../models');
const emailService = require('../infrastructure/emailService');
const devisService = require('../modules/devis/devis.service');
const { piecesJointes, nomFichier, MAX_PAR_FICHIER } = require('../middlewares/piecesJointes.middleware');

// Mini-serveur : le middleware puis un écho de ce qu'il a produit.
function demarrerServeur() {
  const app = express();
  app.post('/test', piecesJointes, (req, res) =>
    res.json({ body: req.body, fichiers: req.piecesJointes.map(({ nom, taille }) => ({ nom, taille })) })
  );
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => res.status(err.statusCode || 500).json({ message: err.message }));
  return new Promise((resolve) => {
    const serveur = app.listen(0, () => resolve(serveur));
  });
}

async function envoyer(serveur, fichiers, champs = { sujet: 'Votre devis', message: 'Bonjour' }) {
  const form = new FormData();
  Object.entries(champs).forEach(([k, v]) => form.append(k, v));
  fichiers.forEach(({ nom, contenu }) => form.append('piecesJointes', new Blob([contenu]), nom));
  const reponse = await fetch(`http://127.0.0.1:${serveur.address().port}/test`, { method: 'POST', body: form });
  return { statut: reponse.status, corps: await reponse.json() };
}

describe('middleware piecesJointes', () => {
  let serveur;
  beforeAll(async () => {
    serveur = await demarrerServeur();
  });
  afterAll(() => new Promise((resolve) => serveur.close(resolve)));

  it('reçoit les champs texte et les fichiers autorisés, noms accentués compris', async () => {
    const { statut, corps } = await envoyer(serveur, [
      { nom: 'Devis-chantier-été.pdf', contenu: 'pdf' },
      { nom: 'plan.PNG', contenu: 'image' },
    ]);

    expect(statut).toBe(200);
    expect(corps.body).toEqual({ sujet: 'Votre devis', message: 'Bonjour' });
    expect(corps.fichiers).toEqual([
      { nom: 'Devis-chantier-été.pdf', taille: 3 },
      { nom: 'plan.PNG', taille: 5 },
    ]);
  });

  it('refuse un type de fichier non autorisé', async () => {
    const { statut, corps } = await envoyer(serveur, [{ nom: 'virus.exe', contenu: 'MZ' }]);

    expect(statut).toBe(422);
    expect(corps.message).toMatch(/non autorisé/);
  });

  it('refuse plus de 5 fichiers', async () => {
    const fichiers = Array.from({ length: 6 }, (_, i) => ({ nom: `doc-${i}.pdf`, contenu: 'x' }));
    const { statut, corps } = await envoyer(serveur, fichiers);

    expect(statut).toBe(422);
    expect(corps.message).toMatch(/5 pièces jointes maximum/);
  });

  it('refuse un fichier trop lourd', async () => {
    const { statut, corps } = await envoyer(serveur, [{ nom: 'gros.pdf', contenu: Buffer.alloc(MAX_PAR_FICHIER + 1) }]);

    expect(statut).toBe(413);
    expect(corps.message).toMatch(/taille maximale/);
  });

  it('refuse plus de 20 Mo au total', async () => {
    const neufMo = Buffer.alloc(9 * 1024 * 1024);
    const fichiers = [1, 2, 3].map((i) => ({ nom: `partie-${i}.pdf`, contenu: neufMo }));
    const { statut, corps } = await envoyer(serveur, fichiers);

    expect(statut).toBe(413);
    expect(corps.message).toMatch(/au total/);
  });

  it('laisse passer une requête JSON sans fichier', async () => {
    const reponse = await fetch(`http://127.0.0.1:${serveur.address().port}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sujet: 'x' }),
    });
    expect(reponse.status).toBe(200);
    expect((await reponse.json()).fichiers).toEqual([]);
  });
});

describe('nomFichier', () => {
  it('retire tout chemin du nom de fichier', () => {
    expect(nomFichier('../../etc/passwd.pdf')).toBe('passwd.pdf');
  });
});

describe('devisService.repondre — pièces jointes', () => {
  it("transmet les fichiers à l'e-mail et n'en garde que le nom et la taille", async () => {
    const devisMock = { id: 'd1', nom: 'Jean', email: 'jean@example.com', statut: 'nouveau', save: jest.fn() };
    Devis.findByPk.mockResolvedValue(devisMock);
    emailService.envoyer.mockResolvedValue({ id: 'email-1' });
    const pj = [{ nom: 'devis.pdf', contenu: Buffer.from('pdf'), taille: 3 }];

    await devisService.repondre('d1', { sujet: 'Votre devis', message: 'Bonjour' }, 'admin-1', pj);

    expect(emailService.envoyer).toHaveBeenCalledWith(expect.objectContaining({ piecesJointes: pj }));
    expect(devisMock.reponsePiecesJointes).toEqual([{ nom: 'devis.pdf', taille: 3 }]);
  });
});
