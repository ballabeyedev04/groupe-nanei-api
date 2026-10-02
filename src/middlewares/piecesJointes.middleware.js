const path = require('path');
const multer = require('multer');
const AppError = require('../utils/AppError');

// Pièces jointes de la réponse à une demande de devis. Gardées en mémoire le
// temps de l'envoi (jamais écrites sur le disque du serveur) puis transmises
// à Resend. 5 fichiers de 3 Mo au plus : 15 Mo au total, bien sous le
// plafond de Resend (40 Mo par e-mail, base64 compris, soit environ +33 %).
const MAX_FICHIERS = 5;
const MAX_PAR_FICHIER = 3 * 1024 * 1024;
const MESSAGE_TROP_LOURD = 'Veuillez mettre un fichier inférieur à 3 Mo.';

// Documents courants d'un devis. Pas d'exécutable ni d'archive : souvent
// bloqués par les messageries des destinataires.
const EXTENSIONS = [
  '.pdf',
  '.jpg', '.jpeg', '.png', '.webp', '.gif',
  '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.odt', '.ods', '.odp',
  '.txt', '.csv',
];

// multer lit le nom de fichier en latin1 : sans cette conversion,
// « Devis-chantier-été.pdf » arriverait illisible chez le destinataire.
// On retire aussi tout chemin et caractère de contrôle éventuel.
function nomFichier(originalname) {
  const nom = path.basename(Buffer.from(originalname, 'latin1').toString('utf8'));
  return nom.replace(/[\u0000-\u001f\u007f]/g, '').trim() || 'piece-jointe';
}

function extensionAutorisee(nom) {
  return EXTENSIONS.includes(path.extname(nom).toLowerCase());
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: MAX_FICHIERS, fileSize: MAX_PAR_FICHIER, fields: 10 },
  fileFilter(req, fichier, cb) {
    const nom = nomFichier(fichier.originalname);
    if (!extensionAutorisee(nom)) {
      return cb(new AppError(`Type de fichier non autorisé : « ${nom} ». Formats acceptés : ${EXTENSIONS.join(', ')}.`, 422));
    }
    return cb(null, true);
  },
}).array('piecesJointes', MAX_FICHIERS);

const MESSAGES_MULTER = {
  LIMIT_FILE_SIZE: MESSAGE_TROP_LOURD,
  LIMIT_FILE_COUNT: `${MAX_FICHIERS} pièces jointes maximum par réponse.`,
  LIMIT_UNEXPECTED_FILE: `${MAX_FICHIERS} pièces jointes maximum par réponse.`,
};

// Rend les pièces jointes disponibles dans req.piecesJointes
// ({ nom, contenu, taille }) ; une requête JSON classique (sans fichier)
// passe telle quelle, avec une liste vide.
function piecesJointes(req, res, next) {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return next(new AppError(MESSAGES_MULTER[err.code] || 'Pièces jointes invalides.', err.code === 'LIMIT_FILE_SIZE' ? 413 : 422));
    }
    if (err) return next(err);

    const fichiers = req.files || [];
    req.piecesJointes = fichiers.map((f) => ({ nom: nomFichier(f.originalname), contenu: f.buffer, taille: f.size }));
    return next();
  });
}

module.exports = { piecesJointes, nomFichier, extensionAutorisee, MAX_FICHIERS, MAX_PAR_FICHIER, EXTENSIONS };
