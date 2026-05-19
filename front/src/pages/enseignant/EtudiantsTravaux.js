// pages/enseignant/TravauxEtudiants.js - Version avec tableau des étudiants

import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import Newsletter from '../../components/Common/Newsletter';
import ScrollToTop from '../../components/Common/ScrollTop';
import OffWrap from '../../components/Layout/Header/OffWrap';
import SiteBreadcrumb from '../../components/Common/Breadcumb';
import SearchModal from '../../components/Layout/Header/SearchModal';
import { useAuth } from '../../context/authContext';
// Image
import favIcon from '../../assets/img/fav-orange.png';
import Logo from '../../assets/img/logo/dark-logo.png';
import footerLogo from '../../assets/img/logo/lite-logo.png';
import bannerbg from '../../assets/img/breadcrumbs/inner7.jpg';

const EtudiantsTravaux = () => {
    const { activiteId } = useParams();
    const [travaux, setTravaux] = useState([]);
    const [activite, setActivite] = useState(null);
    const [etudiants, setEtudiants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTravail, setSelectedTravail] = useState(null);
    const [noteValue, setNoteValue] = useState('');
    const [commentaireValue, setCommentaireValue] = useState('');
    const [activeView, setActiveView] = useState('etudiants'); // Changé: 'etudiants' par défaut
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { idUser } = useAuth();

    useEffect(() => {
        fetchData();
    }, [activiteId]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        await fetchActivite();
        await fetchTravaux();
        await fetchEtudiantsDuCours();
        setLoading(false);
    };

    const fetchActivite = async () => {
        try {
            const response = await axios.get(`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/activite/getActivite/${activiteId}`);
            setActivite(response.data);
            return response.data;
        } catch (error) {
            console.error("Erreur fetchActivite:", error);
            toast.error("Erreur lors du chargement de l'activité");
            return null;
        }
    };

    const fetchTravaux = async () => {
        try {
            const response = await axios.get(`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/travaux/getByActivite/${activiteId}`);
            setTravaux(response.data);
        } catch (error) {
            console.error("Erreur fetchTravaux:", error);
            setTravaux([]);
        }
    };

    const fetchEtudiantsDuCours = async () => {
        try {
            const activiteResponse = await axios.get(`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/activite/getActivite/${activiteId}`);
            
            if (!activiteResponse.data || !activiteResponse.data.id_chapitre) {
                console.error("Pas d'id_chapitre dans l'activité");
                setError("Impossible de récupérer le chapitre de cette activité");
                setEtudiants([]);
                return;
            }
            
            const chapitreId = activiteResponse.data.id_chapitre;
            
            const chapitreResponse = await axios.get(`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/chapitre/getChapitre/${chapitreId}`);
            
            if (!chapitreResponse.data || !chapitreResponse.data.id_cours) {
                console.error("Pas d'id_cours dans le chapitre");
                setError("Impossible de récupérer le cours de ce chapitre");
                setEtudiants([]);
                return;
            }
            
            const coursId = chapitreResponse.data.id_cours;
            
            const response = await axios.get(`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/cours/getEtudiantsByCours/${coursId}`);
            
            if (response.data && Array.isArray(response.data)) {
                setEtudiants(response.data);
            } else {
                setEtudiants([]);
            }
        } catch (error) {
            console.error("Erreur fetchEtudiantsDuCours:", error);
            setEtudiants([]);
        }
    };

    const handleNoter = async (idTravail) => {
        if (!noteValue || noteValue < 0 || noteValue > 20) {
            toast.warning("Veuillez entrer une note entre 0 et 20");
            return;
        }

        try {
            await axios.put(`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/travaux/noter/${idTravail}`, {
                note: noteValue,
                commentaire: commentaireValue
            });
            toast.success("Note attribuée avec succès");
            setSelectedTravail(null);
            setNoteValue('');
            setCommentaireValue('');
            fetchTravaux();
        } catch (error) {
            console.error("Erreur:", error);
            toast.error("Erreur lors de l'attribution de la note");
        }
    };

    const getInitials = (nom) => {
        if (!nom) return 'E';
        return nom.charAt(0).toUpperCase();
    };

    const getStatutTravail = (etudiantId) => {
        const travail = travaux.find(t => t.id_etudiant === etudiantId);
        if (!travail) { 
            return { 
                status: 'non_rendu', 
                text: 'Non rendu', 
                color: '#dc3545', 
                icon: 'fa-times-circle',
                borderColor: '#dc3545',
                bgColor: '#f8d7da'
            };
        }
        if (travail.note) { 
            return { 
                status: 'note', 
                text: `Noté (${travail.note}/20)`, 
                color: '#28a745', 
                icon: 'fa-check-circle',
                borderColor: '#28a745',
                bgColor: '#d4edda'
            };
        }
        return { 
            status: 'rendu', 
            text: 'Rendu, non noté', 
            color: '#ffc107', 
            icon: 'fa-clock',
            borderColor: '#ffc107',
            bgColor: '#fff3cd'
        };
    };

    // Styles du tableau
    const styles = {
        container: { padding: '30px 0' },
        header: {
            background: 'linear-gradient(135deg, #ff5421 0%, #e03a00 100%)',
            padding: '30px',
            borderRadius: '15px',
            color: 'white',
            marginBottom: '30px'
        },
        backButton: {
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
        },
        viewTabs: {
            display: 'flex',
            gap: '10px',
            marginBottom: '30px',
            borderBottom: '2px solid #eee'
        },
        viewTab: (isActive) => ({
            padding: '12px 30px',
            fontSize: '16px',
            fontWeight: 600,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: isActive ? '#ff5421' : '#666',
            borderBottom: isActive ? '3px solid #ff5421' : 'none',
            transition: 'all 0.3s ease'
        }),
        // Styles du tableau
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            background: '#fff',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        },
        th: {
            background: '#f8f9fa',
            padding: '15px',
            textAlign: 'left',
            fontWeight: '600',
            color: '#333',
            borderBottom: '2px solid #eee'
        },
        td: {
            padding: '15px',
            borderBottom: '1px solid #eee',
            verticalAlign: 'middle'
        },
        statutBadge: (color, bgColor) => ({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '500',
            background: bgColor || (color + '20'),
            color: color
        }),
        noteInput: {
            width: '80px',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '13px',
            marginRight: '10px'
        },
        textarea: {
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '13px',
            marginTop: '5px',
            resize: 'vertical'
        },
        button: {
            background: '#ff5421',
            color: '#fff',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px'
        },
        buttonSmall: {
            background: '#28a745',
            color: '#fff',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            marginRight: '5px'
        },
        buttonCancel: {
            background: '#6c757d',
            color: '#fff',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
        },
        downloadLink: {
            background: '#ff5421',
            color: '#fff',
            padding: '5px 10px',
            borderRadius: '4px',
            textDecoration: 'none',
            fontSize: '11px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
        },
        externalLink: {
            background: '#28a745',
            color: '#fff',
            padding: '5px 10px',
            borderRadius: '4px',
            textDecoration: 'none',
            fontSize: '11px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            marginRight: '5px'
        },
        loadingContainer: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
        },
        emptyContainer: {
            textAlign: 'center',
            padding: '50px',
            color: '#999',
            background: '#fff',
            borderRadius: '12px'
        },
        statsBar: {
            display: 'flex',
            gap: '20px',
            marginBottom: '30px',
            flexWrap: 'wrap'
        },
        statCard: {
            background: '#fff',
            borderRadius: '12px',
            padding: '20px',
            flex: '1',
            minWidth: '150px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            border: '1px solid #eee'
        },
        statNumber: {
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#ff5421'
        },
        statLabel: {
            fontSize: '14px',
            color: '#666',
            marginTop: '5px'
        },
        noteFormContainer: {
            marginTop: '10px',
            padding: '10px',
            background: '#f5f5f5',
            borderRadius: '8px'
        }
    };

    // Calcul des statistiques
    const totalEtudiants = etudiants.length;
    const travauxRendus = travaux.length;
    const travauxNotes = travaux.filter(t => t.note).length;
    const travauxNonNotes = travauxRendus - travauxNotes;

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    return (
        <React.Fragment>
            <Helmet><link rel="icon" href={favIcon} /></Helmet>
            <OffWrap />
            <Header parentMenu='cours' secondParentMenu='others' headerNormalLogo={Logo}
                headerStickyLogo={Logo} CanvasLogo={Logo} mobileNormalLogo={Logo}
                CanvasClass="right_menu_togle hidden-md" headerClass="full-width-header header-style1 home8-style4"
                TopBar='enable' TopBarClass="topbar-area home8-topbar"
                emailAddress='admin@isetso.rnu.tn' Location='Cité Erriadh - B.P 135' />

            <SiteBreadcrumb pageTitle="Travaux des étudiants" pageName="Gestion des travaux" breadcrumbsImg={bannerbg} />

            <div style={styles.container} className="register-section pt-100 pb-100">
                <div className="container">
                    <div style={styles.header}>
                        <button style={styles.backButton} onClick={() => navigate(-1)}>
                            <i className="fas fa-arrow-left"></i> Retour
                        </button>
                        <h2 style={{ margin: 0 }}>{activite?.titre || 'Activité'}</h2>
                        <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
                            Gestion des travaux des étudiants
                        </p>
                    </div>

                    {/* Barre de statistiques */}
                    <div style={styles.statsBar}>
                        <div style={styles.statCard}>
                            <div style={styles.statNumber}>{totalEtudiants}</div>
                            <div style={styles.statLabel}>Étudiants inscrits</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statNumber}>{travauxRendus}</div>
                            <div style={styles.statLabel}>Travaux rendus</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statNumber}>{travauxNotes}</div>
                            <div style={styles.statLabel}>Travaux notés</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statNumber}>{travauxNonNotes}</div>
                            <div style={styles.statLabel}>Travaux non notés</div>
                        </div>
                    </div>

                    {/* Onglets */}
                    <div style={styles.viewTabs}>
                        <button onClick={() => setActiveView('etudiants')} style={styles.viewTab(activeView === 'etudiants')}>
                            <i className="fas fa-users me-2"></i>Liste des étudiants ({totalEtudiants})
                        </button>
                    </div>

                    {/* Vue des travaux rendus (en cartes) */}
                    {activeView === 'travaux' && (
                        <>
                            {travaux.length === 0 ? (
                                <div style={styles.emptyContainer}>
                                    <i className="fas fa-inbox fa-3x mb-3"></i>
                                    <p>Aucun travail n'a été rendu pour cette activité</p>
                                </div>
                            ) : (
                                <div className="row">
                                    {travaux.map((travail) => (
                                        <div key={travail.id} className="col-md-6 mb-3">
                                            <div className="card">
                                                <div className="card-body">
                                                    <h5 className="card-title">
                                                        {travail.etudiant_nom || travail.username || `Étudiant #${travail.id_etudiant}`}
                                                    </h5>
                                                    <p className="card-text"><strong>Titre:</strong> {travail.titre}</p>
                                                    <p className="card-text"><strong>Description:</strong> {travail.description}</p>
                                                    <p className="card-text"><strong>Date:</strong> {new Date(travail.date_rendu).toLocaleDateString()}</p>
                                                    {travail.lien && (
                                                        <a href={travail.lien} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-success me-2">
                                                            Voir le lien
                                                        </a>
                                                    )}
                                                    {travail.fichier && (
                                                        <a href={`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/travaux/fichier/${travail.fichier}`} className="btn btn-sm btn-primary">
                                                            Télécharger
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Vue de la liste des étudiants (TABLEAU) */}
                    {activeView === 'etudiants' && (
                        <>
                            {etudiants.length === 0 ? (
                                <div style={styles.emptyContainer}>
                                    <i className="fas fa-users fa-3x mb-3"></i>
                                    <p>Aucun étudiant inscrit dans ce cours</p>
                                    <small>Vérifiez que des étudiants sont inscrits à ce cours</small>
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.th}>#</th>
                                                <th style={styles.th}>Étudiant</th>
                                                <th style={styles.th}>Email</th>
                                                <th style={styles.th}>Titre du travail</th>
                                                <th style={styles.th}>Date de rendu</th>
                                                <th style={styles.th}>État</th>
                                                <th style={styles.th}>Actions</th>
                                                <th style={styles.th}>Note</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {etudiants.map((etudiant, index) => {
                                                const travail = travaux.find(t => t.id_etudiant === etudiant.id);
                                                const statut = getStatutTravail(etudiant.id);
                                                const isEditing = selectedTravail === travail?.id;
                                                
                                                return (
                                                    <tr key={etudiant.id} style={{ borderBottom: '1px solid #eee' }}>
                                                        <td style={styles.td}>{index + 1}</td>
                                                        <td style={styles.td}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <div style={{
                                                                    width: '35px',
                                                                    height: '35px',
                                                                    borderRadius: '50%',
                                                                    background: '#ff5421',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    color: 'white',
                                                                    fontWeight: 'bold'
                                                                }}>
                                                                    {getInitials(etudiant.username)}
                                                                </div>
                                                                <span style={{ fontWeight: '500' }}>{etudiant.username}</span>
                                                            </div>
                                                        </td>
                                                        <td style={styles.td}>{etudiant.email || '-'}</td>
                                                        <td style={styles.td}>
                                                            {travail ? travail.titre : '-'}
                                                            {travail?.description && (
                                                                <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                                                                    {travail.description.substring(0, 50)}...
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td style={styles.td}>
                                                            {travail ? new Date(travail.date_rendu).toLocaleDateString() : '-'}
                                                        </td>
                                                        <td style={styles.td}>
                                                            <span style={styles.statutBadge(statut.color, statut.bgColor)}>
                                                                <i className={`fas ${statut.icon}`}></i>
                                                                {statut.text}
                                                            </span>
                                                        </td>
                                                        <td style={styles.td}>
                                                            {travail && (
                                                                <div>
                                                                    {travail.lien && (
                                                                        <a href={travail.lien} target="_blank" rel="noopener noreferrer" style={styles.externalLink}>
                                                                            <i className="fas fa-link"></i>
                                                                        </a>
                                                                    )}
                                                                    {travail.fichier && (
                                                                        <a href={`http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/travaux/fichier/${travail.fichier}`} target="_blank" rel="noopener noreferrer" style={styles.downloadLink}>
                                                                            <i className="fas fa-download"></i>
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td style={styles.td}>
                                                            {travail?.note ? (
                                                                <div>
                                                                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#28a745' }}>
                                                                        {travail.note}/20
                                                                    </span>
                                                                    {travail.commentaire && (
                                                                        <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                                                                            {travail.commentaire}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : travail && !isEditing ? (
                                                                <button 
                                                                    style={styles.buttonSmall}
                                                                    onClick={() => {
                                                                        setSelectedTravail(travail.id);
                                                                        setNoteValue('');
                                                                        setCommentaireValue('');
                                                                    }}
                                                                >
                                                                    <i className="fas fa-star"></i> Noter
                                                                </button>
                                                            ) : null}
                                                            
                                                            {isEditing && (
                                                                <div style={styles.noteFormContainer}>
                                                                    <input 
                                                                        type="number" 
                                                                        placeholder="Note /20" 
                                                                        value={noteValue}
                                                                        onChange={(e) => setNoteValue(e.target.value)}
                                                                        style={styles.noteInput}
                                                                        min="0"
                                                                        max="20"
                                                                        step="0.5"
                                                                        autoFocus
                                                                    />
                                                                    <textarea 
                                                                        placeholder="Commentaire"
                                                                        value={commentaireValue}
                                                                        onChange={(e) => setCommentaireValue(e.target.value)}
                                                                        style={styles.textarea}
                                                                        rows="2"
                                                                    />
                                                                    <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                                                        <button 
                                                                            style={styles.buttonSmall}
                                                                            onClick={() => handleNoter(travail.id)}
                                                                        >
                                                                            <i className="fas fa-save"></i> Enregistrer
                                                                        </button>
                                                                        <button 
                                                                            style={styles.buttonCancel}
                                                                            onClick={() => {
                                                                                setSelectedTravail(null);
                                                                                setNoteValue('');
                                                                                setCommentaireValue('');
                                                                            }}
                                                                        >
                                                                            Annuler
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <Newsletter sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-80" />
            <Footer footerClass="rs-footer home9-style main-home" footerLogo={footerLogo} />
            <ScrollToTop scrollClassName="scrollup orange-color" />
            <SearchModal />
            <ToastContainer position="top-right" autoClose={3000} />
        </React.Fragment>
    );
};

export default EtudiantsTravaux;