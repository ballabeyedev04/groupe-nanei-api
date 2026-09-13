const { Op } = require('sequelize');
const { Devis, AdminUser } = require('../../models');
const emailService = require('../../infrastructure/emailService');
const { devisConfirmationHtml } = require('../../templates/mail/devisConfirmation.template');
const { devisNotificationInterneHtml } = require('../../templates/mail/devisNotificationInterne.template');
const { devisReponseHtml } = require('../../templates/mail/devisReponse.template');
const env = require('../../config/env');
const AppError = require('../../utils/AppError');

async function creer(data, meta) {
  // Honeypot rempli → très probablement un robot. On répond succès (pour ne
  // pas lui apprendre que son remplissage a été détecté) sans rien créer ni
  // envoyer le moindre e-mail.
  if (data.site_web) {
    return { id: null, ignoree: true };
  }

  const devis = await Devis.create({
    nom: data.nom,
    societe: data.societe || null,
    telephone: data.telephone,
    email: data.email,
    ville: data.ville || null,
    typeBesoin: data.typeBesoin || null,
    message: data.message,
    consentementRgpd: data.consentementRgpd,
    ip: meta?.ip || null,
    userAgent: meta?.userAgent || null,
  });

  // Les deux e-mails sont du "meilleur effort" : un souci d'envoi ne doit
  // jamais faire échouer la demande de devis elle-même (déjà enregistrée).
  await emailService.envoyer({
    to: devis.email,
    subject: 'Votre demande de devis — Groupe Nanei',
    html: devisConfirmationHtml({ nom: devis.nom }),
  });

  if (env.adminNotificationEmail) {
    await emailService.envoyer({
      to: env.adminNotificationEmail,
      subject: `Nouvelle demande de devis — ${devis.nom}`,
      html: devisNotificationInterneHtml(devis),
    });
  }

  return { id: devis.id, ignoree: false };
}

async function lister({ page, limite, statut, recherche }) {
  const where = {};
  if (statut) where.statut = statut;
  if (recherche) {
    where[Op.or] = [
      { nom: { [Op.iLike]: `%${recherche}%` } },
      { email: { [Op.iLike]: `%${recherche}%` } },
      { societe: { [Op.iLike]: `%${recherche}%` } },
    ];
  }

  const { rows, count } = await Devis.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: limite,
    offset: (page - 1) * limite,
  });

  return { items: rows, total: count, page, limite, totalPages: Math.ceil(count / limite) || 1 };
}

async function obtenir(id) {
  const devis = await Devis.findByPk(id, {
    include: [{ model: AdminUser, as: 'reponduPar', attributes: ['id', 'nom', 'email'] }],
  });
  if (!devis) throw new AppError('Demande de devis introuvable.', 404);
  return devis;
}

async function repondre(id, { sujet, message }, adminId) {
  const devis = await obtenir(id);

  const resultat = await emailService.envoyer({
    to: devis.email,
    subject: sujet,
    html: devisReponseHtml({ devis, message }),
  });
  if (!resultat) {
    // Ici on informe l'admin de l'échec (contrairement à la confirmation
    // automatique) : c'est une action qu'il vient de déclencher lui-même,
    // il doit savoir si son e-mail est réellement parti.
    throw new AppError("L'envoi de l'e-mail a échoué. Vérifiez la configuration Resend et réessayez.", 502);
  }

  devis.statut = 'traite';
  devis.reponseSujet = sujet;
  devis.reponseMessage = message;
  devis.reponduLe = new Date();
  devis.reponduParId = adminId;
  await devis.save();

  return devis;
}

module.exports = { creer, lister, obtenir, repondre };
