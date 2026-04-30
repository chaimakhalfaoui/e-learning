import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import OffWrap from '../../components/Layout/Header/OffWrap';
import SearchModal from '../../components/Layout/Header/SearchModal';
import Newsletter from '../../components/Common/Newsletter';
import ScrollToTop from '../../components/Common/ScrollTop';
import SiteBreadcrumb from '../../components/Common/Breadcumb';
import { useAuth } from '../../context/authContext'; 
import { useNavigate } from 'react-router-dom';

// Images
import favIcon from '../../assets/img/fav-orange.png';
import Logo from '../../assets/img/logo/dark-logo.png';
import footerLogo from '../../assets/img/logo/lite-logo.png';
import bannerbg from '../../assets/img/breadcrumbs/2.jpg';

const API_URL = process.env.REACT_APP_API_URL;

const Etudiants = () => {
    const { role } = useAuth();
    const [etudiants, setEtudiants] = useState([]);
    const [filteredEtudiants, setFilteredEtudiants] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [selectedEtudiant, setSelectedEtudiant] = useState(null);
    const [selectedRole, setSelectedRole] = useState("");
    const [updatingRole, setUpdatingRole] = useState(false);
    const [editingCell, setEditingCell] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const rolesList = [
        { value: 'coordinateur', label: 'Coordinateur', icon: 'fas fa-users-gear', color: '#ff5421' },
        { value: 'etudiant', label: 'Étudiant', icon: 'fas fa-user-graduate', color: '#28a745' },
        { value: 'enseignant', label: 'Enseignant', icon: 'fas fa-chalkboard-user', color: '#17a2b8' }
    ];

    const showMessage = useCallback((type, title, text) => {
        setMessage({ type, title, text });
        const timer = setTimeout(() => setMessage(null), 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const userRole = await role();
                if (userRole !== 'admin' && userRole !== 'coordinateur' && userRole !== 'enseignant') {
                    navigate('/404');
                }
            } catch (error) {
                navigate('/404');
            }
        };
        checkAccess();
    }, [role, navigate]);

    useEffect(() => {
        fetchEtudiants();
    }, []);

    const fetchEtudiants = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/etudiants`);
            setEtudiants(response.data);
            setFilteredEtudiants(response.data);
        } catch (error) {
            setError("Impossible de charger la liste des étudiants.");
            showMessage('error', 'Erreur', "Impossible de charger la liste des étudiants");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        
        if (term === "") {
            setFilteredEtudiants([...etudiants]);
        } else {
            const filtered = etudiants.filter(etd => 
                etd.username?.toLowerCase().includes(term) ||
                etd.email?.toLowerCase().includes(term) ||
                etd.telephone?.toLowerCase().includes(term) ||
                etd.genre?.toLowerCase().includes(term) ||
                etd.role?.toLowerCase().includes(term) ||
                etd.id?.toString().includes(term)
            );
            setFilteredEtudiants([...filtered]);
        }
    };

    const clearSearch = () => {
        setSearchTerm("");
        setFilteredEtudiants([...etudiants]);
        showMessage('info', 'Recherche', 'Filtre de recherche réinitialisé');
    };

    const handleDelete = async (id, username) => {
        if (window.confirm(`Voulez-vous vraiment supprimer "${username}" ?`)) {
            try {
                await axios.delete(`${API_URL}/etudiants/${id}`);
                const updated = etudiants.filter(etd => etd.id !== id);
                setEtudiants([...updated]);
                setFilteredEtudiants([...updated]);
                showMessage('success', 'Suppression réussie', `L'étudiant "${username}" a été supprimé`);
            } catch (error) {
                showMessage('error', 'Erreur', `Impossible de supprimer "${username}"`);
            }
        }
    };

    const startEditing = (id, field, value) => {
        setEditingCell({ id, field });
        setEditValue(value || '');
    };

    const cancelEditing = () => {
        setEditingCell(null);
        setEditValue("");
    };

    const saveEditing = async () => {
        if (!editingCell) return;
        
        const { id, field } = editingCell;
        const userToUpdate = etudiants.find(u => u.id === id);
        if (!userToUpdate) return;
        
        const updatedData = {
            username: field === 'username' ? editValue : userToUpdate.username,
            email: field === 'email' ? editValue : userToUpdate.email,
            age: field === 'age' ? editValue : userToUpdate.age,
            telephone: field === 'telephone' ? editValue : userToUpdate.telephone,
            genre: field === 'genre' ? editValue : userToUpdate.genre
        };
        
        try {
            await axios.put(`${API_URL}/etudiants/${id}`, updatedData);
            
            const updatedEtudiants = etudiants.map(etd =>
                etd.id === id ? { ...etd, [field]: editValue } : etd
            );
            setEtudiants([...updatedEtudiants]);
            setFilteredEtudiants([...updatedEtudiants]);
            
            const fieldNames = {
                username: 'Nom',
                email: 'Email',
                age: 'Âge',
                telephone: 'Téléphone',
                genre: 'Genre'
            };
            
            showMessage('success', 'Succès', `${fieldNames[field]} mis à jour`);
            cancelEditing();
        } catch (error) {
            console.error("Erreur modification:", error);
            showMessage('error', 'Erreur', "Modification impossible");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            saveEditing();
        } else if (e.key === 'Escape') {
            cancelEditing();
        }
    };

    const openRoleModal = (etudiant) => {
        setSelectedEtudiant(etudiant);
        setSelectedRole(etudiant.role || 'etudiant');
        setShowRoleModal(true);
    };

    const closeRoleModal = () => {
        setShowRoleModal(false);
        setSelectedEtudiant(null);
        setSelectedRole("");
    };

    const updateRole = async () => {
        if (!selectedEtudiant) return;
        
        setUpdatingRole(true);
        try {
            const response = await axios.put(`${API_URL}/users/${selectedEtudiant.id}/role`, {
                role: selectedRole
            });
            
            const updatedUsers = etudiants.map(user => 
                user.id === selectedEtudiant.id ? { ...user, role: selectedRole } : user
            );
            setEtudiants([...updatedUsers]);
            setFilteredEtudiants([...updatedUsers]);
            
            const nouveauRoleLabel = rolesList.find(r => r.value === selectedRole)?.label;
            const ancienRoleLabel = rolesList.find(r => r.value === response.data.ancienRole)?.label;
            
            showMessage('success', 'Rôle modifié', `${selectedEtudiant.username} : ${ancienRoleLabel} → ${nouveauRoleLabel}`);
            closeRoleModal();
        } catch (error) {
            console.error("Erreur mise à jour rôle:", error);
            showMessage('error', 'Erreur', "Impossible de modifier le rôle");
        } finally {
            setUpdatingRole(false);
        }
    };

    const getRoleBadge = (role) => {
        const roleInfo = rolesList.find(r => r.value === role) || rolesList[1];
        return (
            <span style={{
                backgroundColor: roleInfo.color,
                color: 'white',
                padding: '5px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
            }}>
                <i className={roleInfo.icon}></i>
                {roleInfo.label}
            </span>
        );
    };

    const renderEditableCell = (etd, field, displayValue, icon) => {
        const isEditing = editingCell && editingCell.id === etd.id && editingCell.field === field;
        
        if (isEditing) {
            if (field === 'genre') {
                return (
                    <select
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveEditing}
                        onKeyPress={handleKeyPress}
                        className="form-control form-control-sm"
                        autoFocus
                    >
                        <option value="">Sélectionner</option>
                        <option value="Homme">Homme</option>
                        <option value="Femme">Femme</option>
                    </select>
                );
            }
            
            return (
                <input
                    type={field === 'age' ? 'number' : field === 'email' ? 'email' : 'text'}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={saveEditing}
                    onKeyPress={handleKeyPress}
                    className="form-control form-control-sm"
                    autoFocus
                />
            );
        }
        
        return (
            <span onDoubleClick={() => startEditing(etd.id, field, displayValue)} style={{ cursor: 'pointer' }}>
                {icon && <i className={icon} style={{ marginRight: '5px', color: '#ff5421' }}></i>}
                {displayValue || '_'}
                {field === 'age' && displayValue ? ' ans' : ''}
            </span>
        );
    };

    const MessageToast = () => {
        if (!message) return null;
        const colors = {
            success: { bg: '#d4edda', border: '#28a745', text: '#155724' },
            error: { bg: '#f8d7da', border: '#dc3545', text: '#721c24' },
            info: { bg: '#d1ecf1', border: '#17a2b8', text: '#0c5460' }
        };
        const style = colors[message.type] || colors.info;
        
        return (
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 10000,
                backgroundColor: style.bg,
                borderLeft: `4px solid ${style.border}`,
                padding: '12px 16px',
                borderRadius: '4px',
                minWidth: '300px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <strong style={{ color: style.text }}>{message.title}</strong>
                <div style={{ color: style.text, fontSize: '14px', marginTop: '4px' }}>{message.text}</div>
            </div>
        );
    };

    if (loading) {
        return (
            <React.Fragment>
                <Helmet><link rel="icon" href={favIcon} /></Helmet>
                <OffWrap />
                <Header parentMenu='admin' secondParentMenu='etudiants' headerNormalLogo={Logo}
                    headerStickyLogo={Logo} CanvasLogo={Logo} mobileNormalLogo={Logo}
                    CanvasClass="right_menu_togle hidden-md" headerClass="full-width-header header-style1 home8-style4"
                    TopBar='enable' TopBarClass="topbar-area home8-topbar"
                    emailAddress='isetso.rnu.tn' Location='Cité Erriadh - B.P 135' />
                <SiteBreadcrumb pageTitle="Liste des Etudiants" pageName="Etudiants" breadcrumbsImg={bannerbg} />
                <div className="container mt-5 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="mt-3">Chargement des étudiants...</p>
                </div>
                <Newsletter sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-70" />
                <Footer footerClass="rs-footer home9-style main-home" footerLogo={footerLogo} />
                <ScrollToTop scrollClassName="scrollup orange-color" />
                <SearchModal />
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            <Helmet><link rel="icon" href={favIcon} /></Helmet>
            <MessageToast />
            
            <OffWrap />
            <Header
                parentMenu='admin'
                secondParentMenu='etudiants'
                headerNormalLogo={Logo}
                headerStickyLogo={Logo}
                CanvasLogo={Logo}
                mobileNormalLogo={Logo}
                CanvasClass="right_menu_togle hidden-md"
                headerClass="full-width-header header-style1 home8-style4"
                TopBar='enable'
                TopBarClass="topbar-area home8-topbar"
                emailAddress='isetso.rnu.tn'
                Location='Cité Erriadh - B.P 135'
            />

            <SiteBreadcrumb
                pageTitle="Liste des Etudiants"
                pageName="Etudiants"
                breadcrumbsImg={bannerbg}
            />
            <br />

            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                    <h2>
                        <i className="fas fa-users me-2" style={{ color: '#ff5421' }}></i>
                        Liste des Étudiants
                        {filteredEtudiants.length > 0 && (
                            <span className="badge bg-secondary ms-2">{filteredEtudiants.length}</span>
                        )}
                    </h2>
                    <div className="btn-part">
                        <Link className="readon orange-btn transparent" to="/admin/createetudiant" style={{
                            backgroundColor: "#ff5421",
                            color: "white",
                            border: "none",
                            padding: "10px 20px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px"
                        }}>
                            <i className="fas fa-plus me-2"></i> Ajouter Étudiant
                        </Link>
                    </div>
                </div>

                <div style={{
                    marginBottom: "20px",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px"
                }}>
                    <input
                        type="text"
                        placeholder="🔍 Rechercher par nom, email, téléphone..."
                        value={searchTerm}
                        onChange={handleSearch}
                        style={{
                            padding: "10px 15px",
                            fontSize: "14px",
                            border: "1px solid #ddd",
                            borderRadius: "5px",
                            outline: "none",
                            width: "300px"
                        }}
                    />
                    {searchTerm && (
                        <button onClick={clearSearch} style={{
                            padding: "10px 15px",
                            fontSize: "14px",
                            border: "1px solid #ddd",
                            borderRadius: "5px",
                            backgroundColor: "#f8f9fa",
                            cursor: "pointer"
                        }}>
                            ✖ Effacer
                        </button>
                    )}
                </div>

                {error && (
                    <div className="alert alert-danger text-center">
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={fetchEtudiants}>Réessayer</button>
                    </div>
                )}

                {!error && filteredEtudiants.length === 0 && (
                    <div className="alert alert-info text-center">
                        <p>Aucun étudiant trouvé.</p>
                    </div>
                )}

                {!error && filteredEtudiants.length > 0 && (
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered table-hover">
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Nom</th>
                                    <th>Email</th>
                                    <th>Âge</th>
                                    <th>Téléphone</th>
                                    <th>Genre</th>
                                    <th>Rôle</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEtudiants.map(etd => (
                                    <tr key={etd.id}>
                                        <td>{etd.id}</td>
                                        <td>{renderEditableCell(etd, 'username', etd.username, 'fas fa-user-graduate')}</td>
                                        <td>{renderEditableCell(etd, 'email', etd.email, 'fas fa-envelope')}</td>
                                        <td>{renderEditableCell(etd, 'age', etd.age, null)}</td>
                                        <td>{renderEditableCell(etd, 'telephone', etd.telephone, 'fas fa-phone')}</td>
                                        <td>{renderEditableCell(etd, 'genre', etd.genre, null)}</td>
                                        <td>
                                            <button
                                                onClick={() => openRoleModal(etd)}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    padding: 0,
                                                    cursor: "pointer"
                                                }}
                                                title="Cliquer pour modifier le rôle"
                                            >
                                                {getRoleBadge(etd.role || 'etudiant')}
                                            </button>
                                        </td>
                                        <td>
                                            {etd.created_at ? new Date(etd.created_at).toLocaleDateString('fr-FR') : '_'}
                                        </td>
                                        <td className="text-center">
                                            <button
                                                onClick={() => handleDelete(etd.id, etd.username)}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    padding: 0,
                                                    cursor: "pointer",
                                                    color: "red"
                                                }}
                                                title="Supprimer"
                                            >
                                                <i className="fas fa-trash fa-lg"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {!error && filteredEtudiants.length > 0 && (
                    <div className="mt-3 text-muted text-center">
                        <small>
                            <i className="fas fa-chart-line me-1"></i>
                            Total: {filteredEtudiants.length} étudiant(s)
                            {searchTerm && ` (filtré sur ${etudiants.length} total)`}
                        </small>
                    </div>
                )}
            </div>

            {/* Modal Rôle */}
            {showRoleModal && selectedEtudiant && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999
                    }}
                    onClick={closeRoleModal}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            borderRadius: "10px",
                            padding: "30px",
                            width: "90%",
                            maxWidth: "500px",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>
                                <i className="fas fa-user-tag" style={{ color: '#ff5421', marginRight: '10px' }}></i>
                                Modifier le rôle
                            </h3>
                            <button onClick={closeRoleModal} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}>×</button>
                        </div>
                        
                        <p><strong>Utilisateur :</strong> {selectedEtudiant.username}</p>
                        <p><strong>Email :</strong> {selectedEtudiant.email}</p>
                        <p><strong>Rôle actuel :</strong> {getRoleBadge(selectedEtudiant.role || 'etudiant')}</p>
                        
                        <label style={{ display: 'block', marginTop: '20px', fontWeight: 'bold' }}>Nouveau rôle :</label>
                        <select 
                            value={selectedRole} 
                            onChange={(e) => setSelectedRole(e.target.value)} 
                            style={{
                                width: "100%",
                                padding: "10px",
                                marginTop: "10px",
                                marginBottom: "20px",
                                border: "1px solid #ddd",
                                borderRadius: "5px",
                                fontSize: "14px"
                            }}
                            disabled={updatingRole}
                        >
                            {rolesList.map(role => (
                                <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                        </select>
                        
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <button onClick={closeRoleModal} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }} disabled={updatingRole}>
                                Annuler
                            </button>
                            <button onClick={updateRole} style={{ padding: '10px 20px', backgroundColor: '#ff5421', color: 'white', border: 'none', borderRadius: '5px', cursor: updatingRole ? 'not-allowed' : 'pointer' }} disabled={updatingRole}>
                                {updatingRole ? 'Mise à jour...' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Newsletter sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-70" />
            <Footer footerClass="rs-footer home9-style main-home" footerLogo={footerLogo} />
            <ScrollToTop scrollClassName="scrollup orange-color" />
            <SearchModal />
        </React.Fragment>
    );
};

export default Etudiants;