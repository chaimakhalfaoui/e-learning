import { createS3Upload } from "../middleware/s3upload.js";
import { db } from "../db.js";
import bcrypt from "bcryptjs";
import multer from "multer";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();


// Configuration Gmail - utilisez votre compte Gmail avec mot de passe d'application
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Vérifier la connexion au démarrage
const verifyEmailConnection = async () => {
    try {
        await transporter.verify();
        console.log('✅ Connexion email Gmail établie avec succès');
        console.log(`📧 Compte utilisé: ${process.env.EMAIL_USER}`);
    } catch (error) {
        console.error('❌ Erreur de connexion email:', error.message);
        console.log('⚠️ Vérifiez votre fichier .env et le mot de passe d\'application');
    }
};
verifyEmailConnection();

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationEmail = async (email, code) => {
    try {
        const info = await transporter.sendMail({
            from: `"ISETSO E-Learning" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Vérification de votre compte",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #ff5421; text-align: center;">Bienvenue sur ISETSO E-Learning !</h2>
                    <p>Merci de vous être inscrit sur notre plateforme.</p>
                    <p>Votre code de vérification est :</p>
                    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 5px; border-radius: 5px;">
                        ${code}
                    </div>
                    <p>Ce code expirera dans <strong>15 minutes</strong>.</p>
                    <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
                    <hr>
                    <small style="color: #999;">ISETSO E-Learning - Plateforme de formation en ligne</small>
                </div>
            `
        });
        
        console.log(`✅ Email envoyé à ${email}`);
        console.log(`📧 Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error("❌ Erreur envoi email:", error.message);
        return false;
    }
};


export const register = (req, res) => {
    const { username, email, password, age, telephone, genre, role } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const checkExistingUserQuery = "SELECT * FROM users WHERE email = ? OR username = ?";
    
    db.query(checkExistingUserQuery, [email, username], async (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length) return res.status(409).json("User already exists!");

        // Hacher le mot de passe
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        
        // Générer le code de vérification
        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        
        // Insérer l'utilisateur
        const insertUserQuery = `INSERT INTO users(username, email, password, role, age, telephone, genre, verification_code, verification_code_expires, is_verified) 
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)`;
        const values = [username, email, hash, role || 'etudiant', age || null, telephone || null, genre || null, verificationCode, expiresAt];

        db.query(insertUserQuery, values, async (err, data) => {
            if (err) return res.status(500).json(err);
            
            await sendVerificationEmail(email, verificationCode);
            
            return res.status(200).json({ 
                message: "User has been created. Verification code sent to email.",
                needsVerification: true 
            });
        });
    });
};

export const login = (req, res) => {
    const { email, password } = req.body;
    
    const checkUserQuery = "SELECT * FROM users WHERE email = ?";

    db.query(checkUserQuery, [email], async (err, userData) => {
        if (err) return res.status(500).json({ message: "Database query error", error: err });
        
        if (userData.length === 0) {
            const checkAdminQuery = "SELECT * FROM admins WHERE email = ?";
            db.query(checkAdminQuery, [email], (err, adminData) => {
                if (err) return res.status(500).json({ message: "Database query error", error: err });
                if (adminData.length === 0) return res.status(404).json({ message: "Email not found!" });
                processLogin(adminData[0], req, res);
            });
        } else {
            processLogin(userData[0], req, res);
        }
    });
};

const processLogin = async (userData, req, res) => {
    const isPasswordCorrect = bcrypt.compareSync(req.body.password, userData.password);

    if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Incorrect password!" });
    }
    
    // Vérifier si l'utilisateur a vérifié son email (sauf pour les admins)
    if (userData.role !== 'admin' && !userData.is_verified) {
        if (userData.verification_code && new Date(userData.verification_code_expires) > new Date()) {
            return res.status(200).json({ 
                message: "Please verify your email with the code sent.",
                needsVerification: true,
                email: userData.email
            });
        } else {
            const newCode = generateVerificationCode();
            const newExpires = new Date(Date.now() + 15 * 60 * 1000);
            const updateQuery = "UPDATE users SET verification_code = ?, verification_code_expires = ? WHERE id = ?";
            db.query(updateQuery, [newCode, newExpires, userData.id], async (err) => {
                if (!err) {
                    await sendVerificationEmail(userData.email, newCode);
                }
                return res.status(200).json({ 
                    message: "A new verification code has been sent to your email.",
                    needsVerification: true,
                    email: userData.email
                });
            });
            return;
        }
    }

    const token = jwt.sign(
        { id: userData.id, role: userData.role, name: userData.username },
        "jwtkey",
        { expiresIn: "24h" }
    );

    const { password, ...other } = userData;

    res
        .cookie("access_token", token, {
            httpOnly: true,
        })
        .status(200)
        .json({ token, ...other });
};

export const logout = (req, res) => {
    res.clearCookie("access_token").status(200).json("User has been logged out.");
};

export const verifyCode = (req, res) => {
    const { email, code } = req.body;
    
    const query = "SELECT * FROM users WHERE email = ? AND verification_code = ? AND is_verified = FALSE";
    db.query(query, [email, code], (err, data) => {
        if (err) return res.status(500).json({ message: "Erreur serveur", error: err });
        if (data.length === 0) return res.status(400).json({ message: "Code invalide ou expiré" });
        
        const user = data[0];
        
        if (new Date(user.verification_code_expires) < new Date()) {
            return res.status(400).json({ message: "Le code a expiré. Veuillez demander un nouveau code." });
        }
        
        const updateQuery = "UPDATE users SET is_verified = TRUE, verification_code = NULL, verification_code_expires = NULL, email_verified_at = NOW() WHERE id = ?";
        db.query(updateQuery, [user.id], (err) => {
            if (err) return res.status(500).json({ message: "Erreur lors de la vérification", error: err });
            
            const token = jwt.sign(
                { id: user.id, role: user.role },
                "jwtkey",
                { expiresIn: "24h" }
            );
            
            res.json({ 
                success: true, 
                token, 
                role: user.role,
                id: user.id,
                message: "Email vérifié avec succès" 
            });
        });
    });
};

export const resendCode = (req, res) => {
    const { email } = req.body;
    const newCode = generateVerificationCode();
    const newExpires = new Date(Date.now() + 15 * 60 * 1000);
    
    const updateQuery = "UPDATE users SET verification_code = ?, verification_code_expires = ? WHERE email = ? AND is_verified = FALSE";
    db.query(updateQuery, [newCode, newExpires, email], async (err, result) => {
        if (err) return res.status(500).json({ message: "Erreur serveur", error: err });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé ou déjà vérifié" });
        }
        
        const emailSent = await sendVerificationEmail(email, newCode);
        if (emailSent) {
            res.json({ success: true, message: "Un nouveau code a été envoyé à votre email" });
        } else {
            res.status(500).json({ message: "Erreur lors de l'envoi de l'email" });
        }
    });
};

export const checkUserRole = (req, res) => {
    const userId = req.params.id;
    const selectUserRoleQuery = "SELECT role FROM users WHERE id = ?";

    db.query(selectUserRoleQuery, [userId], (err, data) => {
        if (err) {
            console.error("Erreur lors de la récupération du rôle de l'utilisateur :", err);
            return res.status(500).json("Une erreur s'est produite lors de la récupération du rôle de l'utilisateur.");
        }
        if (data.length === 0) return res.status(404).json("Utilisateur non trouvé.");
        return res.status(200).json({ role: data[0].role });
    });
};

export const checkUserRoleA = (req, res) => {
    const userId = req.params.id;
    const selectUserRoleQuery = "SELECT role FROM admins WHERE id = ?";

    db.query(selectUserRoleQuery, [userId], (err, data) => {
        if (err) {
            console.error("Erreur lors de la récupération du rôle de l'admin :", err);
            return res.status(500).json("Une erreur s'est produite lors de la récupération du rôle de l'admin.");
        }
        if (data.length === 0) return res.status(404).json("Utilisateur non trouvé.");
        return res.status(200).json({ role: data[0].role });
    });
};

export const countUsers = (req, res) => {
    const countUsersQuery = "SELECT COUNT(*) as userCount FROM users WHERE role = 'etudiant'";

    db.query(countUsersQuery, (err, data) => {
        if (err) {
            console.error("Erreur lors de la récupération du nombre d'utilisateurs :", err);
            return res.status(500).json("Une erreur s'est produite lors de la récupération du nombre d'utilisateurs.");
        }
        return res.status(200).json({ userCount: data[0].userCount });
    });
};

export const getLatestTeachers = (req, res) => {
    const latestTeachersQuery = "SELECT * FROM users WHERE role = 'enseignant' ORDER BY id DESC LIMIT 6";

    db.query(latestTeachersQuery, (err, data) => {
        if (err) {
            console.error("Erreur lors de la récupération des derniers enseignants :", err);
            return res.status(500).json("Une erreur s'est produite lors de la récupération des derniers enseignants.");
        }
        return res.status(200).json(data);
    });
};

export const getUserById = (req, res) => {
    const userId = req.params.id;
    const selectUserQuery = "SELECT id, username, email, image, age, telephone, genre, role, is_verified, created_at FROM users WHERE id = ?";

    db.query(selectUserQuery, [userId], (err, data) => {
        if (err) {
            console.error("Erreur lors de la récupération des informations de l'utilisateur :", err);
            return res.status(500).json("Une erreur s'est produite lors de la récupération des informations de l'utilisateur.");
        }
        if (data.length === 0) return res.status(404).json("Utilisateur non trouvé.");
        return res.status(200).json(data[0]);
    });
};

export const getAdminById = (req, res) => {
    const userId = req.params.id;
    const selectUserQuery = "SELECT id, username, email FROM admins WHERE id = ?";

    db.query(selectUserQuery, [userId], (err, data) => {
        if (err) {
            console.error("Erreur lors de la récupération des informations de l'utilisateur :", err);
            return res.status(500).json("Une erreur s'est produite lors de la récupération des informations de l'utilisateur.");
        }
        if (data.length === 0) return res.status(404).json("Utilisateur non trouvé.");
        return res.status(200).json(data[0]);
    });
};

export const updateAdminById = (req, res) => {
    const userId = req.params.id;
    const { username, email } = req.body;

    const updateUserQuery = "UPDATE admins SET username = ?, email = ? WHERE id = ?";

    db.query(updateUserQuery, [username, email, userId], (err, result) => {
        if (err) {
            console.error("Erreur lors de la mise à jour des informations de l'utilisateur :", err);
            return res.status(500).json("Une erreur s'est produite lors de la mise à jour des informations de l'utilisateur.");
        }
        if (result.affectedRows === 0) return res.status(404).json("Utilisateur non trouvé.");
        return res.status(200).json("Informations de l'utilisateur mises à jour avec succès.");
    });
};

// Définir le stockage pour multer
const upload = createS3Upload("uploads");



export const updateprofil = (req, res) => {
    upload.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error("Erreur Multer :", err);
            return res.status(500).json("Une erreur s'est produite lors du téléchargement de l'image.");
        } else if (err) {
            console.error("Erreur inattendue lors du téléchargement de l'image :", err);
            return res.status(500).json("Une erreur inattendue s'est produite lors du téléchargement de l'image.");
        }

        const id = req.params.id;
        const { username, age, genre, email, telephone } = req.body;

        if (!id || !username || !email) {
            return res.status(400).json("Les champs requis sont manquants.");
        }

        let updateUserQuery;
        let values;

        if (req.file) {
            const imageName = req.file.location;
            updateUserQuery = "UPDATE users SET username = ?, age = ?, genre = ?, email = ?, telephone = ?, image = ? WHERE id = ?";
            values = [username, age || null, genre || null, email, telephone || null, imageName, id];
        } else {
            updateUserQuery = "UPDATE users SET username = ?, age = ?, genre = ?, email = ?, telephone = ? WHERE id = ?";
            values = [username, age || null, genre || null, email, telephone || null, id];
        }

        db.query(updateUserQuery, values, (err, data) => {
            if (err) {
                console.error("Erreur lors de la mise à jour du profil utilisateur :", err);
                return res.status(500).json("Une erreur s'est produite lors de la mise à jour du profil utilisateur.");
            }
            if (data.affectedRows === 0) return res.status(404).json("L'utilisateur n'existe pas.");
            return res.status(200).json("Profil utilisateur mis à jour avec succès.");
        });
    });
};
// authController.js - Version corrigée

export const getStatistics = async (req, res) => {
    try {
        // Utilisation de Promise.all pour exécuter les requêtes en parallèle
        const [
            etudiantsResult,
            enseignantsResult,
            coordinateursResult,
            adminsResult,
            totalUsersResult,
            totalCoursesResult,
            publishedCoursesResult,
            categoriesTotalResult
        ] = await Promise.all([
            new Promise((resolve, reject) => 
                db.query("SELECT COUNT(*) as count FROM users WHERE role = 'etudiant'", (err, result) => err ? reject(err) : resolve(result))),
            new Promise((resolve, reject) => 
                db.query("SELECT COUNT(*) as count FROM users WHERE role = 'enseignant'", (err, result) => err ? reject(err) : resolve(result))),
            new Promise((resolve, reject) => 
                db.query("SELECT COUNT(*) as count FROM users WHERE role = 'coordinateur'", (err, result) => err ? reject(err) : resolve(result))),
            new Promise((resolve, reject) => 
                db.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'", (err, result) => err ? reject(err) : resolve(result))),
            new Promise((resolve, reject) => 
                db.query("SELECT COUNT(*) as count FROM users", (err, result) => err ? reject(err) : resolve(result))),
            new Promise((resolve, reject) => 
                db.query("SELECT COUNT(*) as count FROM cours", (err, result) => err ? reject(err) : resolve(result))),
            new Promise((resolve, reject) => 
                db.query("SELECT COUNT(*) as count FROM cours WHERE status = 'published'", (err, result) => err ? reject(err) : resolve(result))),
            new Promise((resolve, reject) => 
                db.query("SELECT COUNT(*) as count FROM categorie", (err, result) => err ? reject(err) : resolve(result)))
        ]);

        const stats = {
            users: {
                total: totalUsersResult[0]?.count || 0,
                etudiants: etudiantsResult[0]?.count || 0,
                enseignants: enseignantsResult[0]?.count || 0,
                coordinateurs: coordinateursResult[0]?.count || 0,
                admins: adminsResult[0]?.count || 0
            },
            courses: {
                total: totalCoursesResult[0]?.count || 0,
                published: publishedCoursesResult[0]?.count || 0,
                hidden: (totalCoursesResult[0]?.count || 0) - (publishedCoursesResult[0]?.count || 0)
            },
            categories: {
                total: categoriesTotalResult[0]?.count || 0
            }
        };

        res.status(200).json(stats);
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }
};

export const getMonthlyInscriptions = async (req, res) => {
    try {
        const monthlyQuery = `
            SELECT 
                MONTH(created_at) as mois_num,
                YEAR(created_at) as annee,
                COUNT(*) as count
            FROM users 
            WHERE created_at IS NOT NULL AND created_at <= NOW()
            GROUP BY YEAR(created_at), MONTH(created_at)
            ORDER BY annee ASC, mois_num ASC
            LIMIT 12
        `;
        
        const results = await new Promise((resolve, reject) => 
            db.query(monthlyQuery, (err, result) => err ? reject(err) : resolve(result))
        );

        const moisNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        
        let data = [];
        if (results && results.length > 0) {
            data = results.map(r => ({
                mois: moisNames[(r.mois_num - 1)] || 'Jan',
                count: Number(r.count) || 0
            }));
        } else {
            // Données par défaut si aucune inscription
            data = moisNames.map(mois => ({ mois, count: 0 }));
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Monthly inscriptions error:', error);
        // Retourner des données vides au lieu d'une erreur
        const moisNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        res.status(200).json(moisNames.map(mois => ({ mois, count: 0 })));
    }
};

export const getCoursParCategorie = async (req, res) => {
    try {
        const query = `
            SELECT 
                c.id,
                c.title as nom,
                COUNT(co.id) as count
            FROM categorie c
            LEFT JOIN cours co ON c.id = co.id_categorie
            GROUP BY c.id, c.title
            ORDER BY count DESC
        `;
        
        const results = await new Promise((resolve, reject) => 
            db.query(query, (err, result) => err ? reject(err) : resolve(result))
        );
        
        let sanitizedResults = [];
        if (results && results.length > 0) {
            sanitizedResults = results.map(item => ({
                id: item.id,
                nom: String(item.nom || 'Sans catégorie'),
                count: Number(item.count) || 0
            }));
        } else {
            // Données par défaut
            sanitizedResults = [{ nom: 'Aucune catégorie', count: 0 }];
        }
        
        res.status(200).json(sanitizedResults);
    } catch (error) {
        console.error('Cours par cat error:', error);
        // Retourner des données par défaut au lieu d'une erreur
        res.status(200).json([{ nom: 'Erreur de chargement', count: 0 }]);
    }
};

export const getAllTeachers = (req, res) => {
    const getAllTeachersQuery = "SELECT id, username, email, image, age, telephone, genre, role FROM users WHERE role = 'enseignant'";

    db.query(getAllTeachersQuery, (err, data) => {
        if (err) {
            console.error("Erreur lors de la récupération des enseignants :", err);
            return res.status(500).json([]);
        }
        return res.status(200).json(data || []);
    });
};

export const getAllStudents = (req, res) => {
    const getAllStudentsQuery = "SELECT id, username, email, image, age, telephone, genre, role FROM users WHERE role = 'etudiant'";

    db.query(getAllStudentsQuery, (err, data) => {
        if (err) {
            console.error("Erreur lors de la récupération des étudiants :", err);
            return res.status(500).json([]);
        }
        return res.status(200).json(data || []);
    });
};

const deleteCourseByUser = (userId, callback) => {
    const deleteCourseQuery = "SELECT id FROM cours WHERE id_user = ?";
    db.query(deleteCourseQuery, [userId], (err, courses) => {
        if (err) return callback(err);

        const tasks = courses.map(course => {
            return new Promise((resolve, reject) => {
                const id_cours = course.id;
                db.beginTransaction(err => {
                    if (err) return reject(err);
                    
                    const deleteReponsesQuery = `DELETE FROM reponse WHERE idquestion IN (SELECT id FROM question WHERE id_quiz IN (SELECT id FROM Quiz WHERE id_cours = ?))`;
                    db.query(deleteReponsesQuery, [id_cours], (err) => {
                        if (err) return db.rollback(() => reject(err));
                        
                        const deleteLectureQuery = "DELETE FROM lecture WHERE id_cours = ?";
                        db.query(deleteLectureQuery, [id_cours], (err) => {
                            if (err) return db.rollback(() => reject(err));
                            
                            const deleteAVCQuery = "DELETE FROM avc WHERE idCours = ?";
                            db.query(deleteAVCQuery, [id_cours], (err) => {
                                if (err) return db.rollback(() => reject(err));
                                
                                const deleteActivitiesQuery = `DELETE Activite FROM Activite JOIN Chapitre ON Activite.id_chapitre = Chapitre.id_chapitre WHERE Chapitre.id_cours = ?`;
                                db.query(deleteActivitiesQuery, [id_cours], (err) => {
                                    if (err) return db.rollback(() => reject(err));
                                    
                                    const deleteChaptersQuery = "DELETE FROM Chapitre WHERE id_cours = ?";
                                    db.query(deleteChaptersQuery, [id_cours], (err) => {
                                        if (err) return db.rollback(() => reject(err));
                                        
                                        const deleteQuizQuestionsQuery = `DELETE question FROM question JOIN Quiz ON question.id_quiz = Quiz.id WHERE Quiz.id_cours = ?`;
                                        db.query(deleteQuizQuestionsQuery, [id_cours], (err) => {
                                            if (err) return db.rollback(() => reject(err));
                                            
                                            const deleteQuizzesQuery = "DELETE FROM Quiz WHERE id_cours = ?";
                                            db.query(deleteQuizzesQuery, [id_cours], (err) => {
                                                if (err) return db.rollback(() => reject(err));
                                                
                                                const deleteCourseQuery = "DELETE FROM cours WHERE id = ?";
                                                db.query(deleteCourseQuery, [id_cours], (err) => {
                                                    if (err) return db.rollback(() => reject(err));
                                                    
                                                    db.commit(err => {
                                                        if (err) return db.rollback(() => reject(err));
                                                        resolve();
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

        Promise.all(tasks).then(() => callback(null)).catch(callback);
    });
};

const deleteUserAssociations = (userId, callback) => {
    db.beginTransaction(err => {
        if (err) return callback(err);

        const deleteLectureQuery = "DELETE FROM lecture WHERE id_user = ?";
        db.query(deleteLectureQuery, [userId], (err) => {
            if (err) return db.rollback(() => callback(err));

            const deleteReponseQuery = "DELETE FROM reponse WHERE idUser = ?";
            db.query(deleteReponseQuery, [userId], (err) => {
                if (err) return db.rollback(() => callback(err));

                db.commit(err => {
                    if (err) return db.rollback(() => callback(err));
                    callback(null);
                });
            });
        });
    });
};

export const deleteUser = (req, res) => {
    const userId = req.params.id;

    const getUserQuery = "SELECT role FROM users WHERE id = ?";
    db.query(getUserQuery, [userId], (err, results) => {
        if (err) return res.status(500).json("Une erreur s'est produite lors de la récupération de l'utilisateur.");
        if (results.length === 0) return res.status(404).json("Utilisateur non trouvé.");

        const userRole = results[0].role;

        if (userRole === 'enseignant') {
            deleteCourseByUser(userId, (err) => {
                if (err) return res.status(500).json("Erreur lors de la suppression des cours de l'utilisateur.");
                
                const deleteEvenementQuery = "DELETE FROM evenement WHERE iduser = ?";
                db.query(deleteEvenementQuery, [userId], (err) => {
                    if (err) return res.status(500).json("Erreur lors de la suppression des événements.");
                    
                    const deleteCommentaireQuery = "DELETE FROM commentaire WHERE iduser = ?";
                    db.query(deleteCommentaireQuery, [userId], (err) => {
                        if (err) return res.status(500).json("Erreur lors de la suppression des commentaires.");
                        
                        const deleteUserQuery = "DELETE FROM users WHERE id = ?";
                        db.query(deleteUserQuery, [userId], (err) => {
                            if (err) return res.status(500).json("Erreur lors de la suppression de l'utilisateur.");
                            return res.status(200).json("Utilisateur supprimé avec succès.");
                        });
                    });
                });
            });
        } else if (userRole === 'etudiant') {
            deleteUserAssociations(userId, (err) => {
                if (err) return res.status(500).json("Erreur lors de la suppression des associations de l'utilisateur.");
                
                const deleteUserQuery = "DELETE FROM users WHERE id = ?";
                db.query(deleteUserQuery, [userId], (err) => {
                    if (err) return res.status(500).json("Erreur lors de la suppression de l'utilisateur.");
                    return res.status(200).json("Utilisateur supprimé avec succès.");
                });
            });
        } else {
            const deleteUserQuery = "DELETE FROM users WHERE id = ?";
            db.query(deleteUserQuery, [userId], (err) => {
                if (err) return res.status(500).json("Erreur lors de la suppression de l'utilisateur.");
                return res.status(200).json("Utilisateur supprimé avec succès.");
            });
        }
    });
};

export const updatePassword = async (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    const getUserQuery = "SELECT password FROM users WHERE id = ?";
    db.query(getUserQuery, [id], async (err, data) => {
        if (err) return res.status(500).json("Erreur serveur");
        if (data.length === 0) return res.status(404).json("Utilisateur non trouvé");
        
        const isPasswordValid = await bcrypt.compare(currentPassword, data[0].password);
        if (!isPasswordValid) {
            return res.status(401).json("Mot de passe actuel incorrect");
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        const updateQuery = "UPDATE users SET password = ? WHERE id = ?";
        db.query(updateQuery, [hashedPassword, id], (err) => {
            if (err) return res.status(500).json("Erreur lors de la mise à jour");
            res.status(200).json("Mot de passe mis à jour avec succès");
        });
    });
};