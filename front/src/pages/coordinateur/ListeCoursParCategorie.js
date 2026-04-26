import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Layout/Header/Header";
import Footer from "../../components/Layout/Footer/Footer";
import SiteBreadcrumb from "../../components/Common/Breadcumb";
import Newsletter from "../../components/Common/Newsletter";
import ScrollToTop from "../../components/Common/ScrollTop";
import OffWrap from "../../components/Layout/Header/OffWrap";
import SearchModal from "../../components/Layout/Header/SearchModal";
import bannerbg from "../../assets/img/breadcrumbs/inner7.jpg";
import Logo from "../../assets/img/logo/dark-logo.png";
import footerLogo from "../../assets/img/logo/lite-logo.png";
import { useAuth } from "../../context/authContext";

const API_URL = 'http://localhost:8801/api';

const ListeCoursParCategorie = () => {
  const { idCategorie } = useParams();
  const { role, idUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [validationFilter, setValidationFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categorieName, setCategorieName] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [comment, setComment] = useState("");

  const isCoordinator = role === 'coordinateur' || role === 'admin';

  // Récupération des cours
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const includeHidden = isCoordinator ? '?includeHidden=true' : '';
      const res = await axios.get(`${API_URL}/cours/categorie/${idCategorie}/cours${includeHidden}`);
      const data = res.data.cours || res.data || [];
      setCourses(data);
      setFilteredCourses(data);
      if (res.data.categorie) setCategorieName(res.data.categorie.nom);
    } catch (err) {
      setError("Erreur lors du chargement des cours");
    } finally {
      setLoading(false);
    }
  }, [idCategorie, isCoordinator]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Filtrage
  useEffect(() => {
    let filtered = [...courses];
    
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.titre?.toLowerCase().includes(searchTerm) ||
        c.description?.toLowerCase().includes(searchTerm) ||
        c.type?.toLowerCase().includes(searchTerm) ||
        c.enseignant?.toLowerCase().includes(searchTerm)
      );
    }
    
    if (validationFilter !== "all") {
      filtered = filtered.filter(c => c.validation_status === validationFilter);
    }
    
    setFilteredCourses(filtered);
  }, [courses, searchTerm, validationFilter]);

  const handleApprove = async (courseId) => {
    const msg = comment || "Cours validé";
    if (!window.confirm(`Valider ce cours ?\nCommentaire: ${msg}`)) return;
    
    setUpdatingId(courseId);
    try {
      const userId = await idUser();
      await axios.put(`${API_URL}/cours/approve/${courseId}`, {
        validated_by: userId,
        comment: msg
      });
      
      setCourses(prev => prev.map(c => 
        c.id === courseId ? { ...c, validation_status: 'approved', validation_comment: msg } : c
      ));
      alert("✅ Cours validé !");
      setComment("");
    } catch (err) {
      alert("❌ Erreur");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (courseId) => {
    const msg = comment || "Cours rejeté";
    if (!window.confirm(`Rejeter ce cours ?\nMotif: ${msg}`)) return;
    
    setUpdatingId(courseId);
    try {
      await axios.put(`${API_URL}/cours/reject/${courseId}`, { comment: msg });
      
      setCourses(prev => prev.map(c => 
        c.id === courseId ? { ...c, validation_status: 'rejected', validation_comment: msg } : c
      ));
      alert("❌ Cours rejeté");
      setComment("");
    } catch (err) {
      alert("❌ Erreur");
    } finally {
      setUpdatingId(null);
    }
  };

  const getBadge = (status) => {
    switch(status) {
      case 'approved': return { text: '✓ Validé', bg: '#d4edda', color: '#155724' };
      case 'pending': return { text: '⏳ En attente', bg: '#fff3cd', color: '#856404' };
      case 'rejected': return { text: '✗ Rejeté', bg: '#f8d7da', color: '#721c24' };
      default: return null;
    }
  };

  const formatDuration = (d) => {
    if (!d) return null;
    const h = parseFloat(d);
    if (isNaN(h)) return null;
    return h === 1 ? "1 heure" : `${h} heures`;
  };

  if (loading) {
    return (
      <>
        <OffWrap />
        <Header parentMenu="Cours" secondParentMenu="others" headerNormalLogo={Logo}
          headerStickyLogo={Logo} CanvasLogo={Logo} mobileNormalLogo={Logo}
          CanvasClass="right_menu_togle hidden-md" headerClass="full-width-header header-style1 home8-style4"
          TopBar="enable" TopBarClass="topbar-area home8-topbar"
          emailAddress="admin@isetso.rnu.tn" Location="Cité Erriadh - B.P 135" />
        <SiteBreadcrumb pageTitle="Cours" pageName="Liste des Cours" breadcrumbsImg={bannerbg} />
        <div className="container pt-100 pb-100 text-center">
          <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Chargement...</span></div>
          <p className="mt-3">Chargement des cours...</p>
        </div>
        <Newsletter sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-80" />
        <Footer footerClass="rs-footer home9-style main-home" footerLogo={footerLogo} />
        <ScrollToTop scrollClassName="scrollup orange-color" />
        <SearchModal />
      </>
    );
  }

  if (error) {
    return (
      <>
        <OffWrap />
        <Header parentMenu="Cours" secondParentMenu="others" headerNormalLogo={Logo}
          headerStickyLogo={Logo} CanvasLogo={Logo} mobileNormalLogo={Logo}
          CanvasClass="right_menu_togle hidden-md" headerClass="full-width-header header-style1 home8-style4"
          TopBar="enable" TopBarClass="topbar-area home8-topbar"
          emailAddress="admin@isetso.rnu.tn" Location="Cité Erriadh - B.P 135" />
        <SiteBreadcrumb pageTitle="Cours" pageName="Liste des Cours" breadcrumbsImg={bannerbg} />
        <div className="container pt-100 pb-100">
          <div className="alert alert-danger text-center">
            <h4>Erreur !</h4>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchCourses}>Réessayer</button>
          </div>
        </div>
        <Newsletter sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-80" />
        <Footer footerClass="rs-footer home9-style main-home" footerLogo={footerLogo} />
        <ScrollToTop scrollClassName="scrollup orange-color" />
        <SearchModal />
      </>
    );
  }

  const counts = {
    all: courses.length,
    pending: courses.filter(c => c.validation_status === 'pending').length,
    approved: courses.filter(c => c.validation_status === 'approved').length,
    rejected: courses.filter(c => c.validation_status === 'rejected').length
  };

  const filterBtnStyle = (active) => ({
    padding: "8px 20px",
    fontSize: "14px",
    border: `1px solid ${active ? '#ff5421' : '#ddd'}`,
    borderRadius: "20px",
    backgroundColor: active ? '#ff5421' : '#fff',
    color: active ? '#fff' : '#666',
    cursor: "pointer"
  });

  return (
    <>
      <OffWrap />
      <Header parentMenu="Cours" secondParentMenu="others" headerNormalLogo={Logo}
        headerStickyLogo={Logo} CanvasLogo={Logo} mobileNormalLogo={Logo}
        CanvasClass="right_menu_togle hidden-md" headerClass="full-width-header header-style1 home8-style4"
        TopBar="enable" TopBarClass="topbar-area home8-topbar"
        emailAddress="admin@isetso.rnu.tn" Location="Cité Erriadh - B.P 135" />

      <SiteBreadcrumb pageTitle={categorieName || "Cours"} pageName="Liste des Cours" breadcrumbsImg={bannerbg} />
      
      <div className="container pt-100 pb-100">
        <h2 className="text-center mb-30">
          <i className="fas fa-folder-open" style={{ color: '#ff5421', marginRight: '10px' }}></i>
          {categorieName || `Catégorie ${idCategorie}`}
          <span className="badge bg-secondary ms-2">{filteredCourses.length}</span>
        </h2>

        {/* Filtres */}
        <div className="text-center mb-30">
          <div className="d-flex justify-content-center gap-2 flex-wrap">
            <button onClick={() => setValidationFilter("all")} style={filterBtnStyle(validationFilter === "all")}>📋 Tous ({counts.all})</button>
            <button onClick={() => setValidationFilter("pending")} style={filterBtnStyle(validationFilter === "pending")}>⏳ En attente ({counts.pending})</button>
            <button onClick={() => setValidationFilter("approved")} style={filterBtnStyle(validationFilter === "approved")}>✅ Validés ({counts.approved})</button>
            <button onClick={() => setValidationFilter("rejected")} style={filterBtnStyle(validationFilter === "rejected")}>❌ Rejetés ({counts.rejected})</button>
          </div>
        </div>

        {/* Recherche */}
        {courses.length > 0 && (
          <div className="text-center mb-30">
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              <input
                type="text"
                placeholder="🔍 Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                style={{ width: "300px", padding: "10px 15px", border: "1px solid #ddd", borderRadius: "25px", outline: "none" }}
              />
              {(searchTerm || validationFilter !== "all") && (
                <button onClick={() => { setSearchTerm(""); setValidationFilter("all"); }} style={{ padding: "10px 15px", border: "1px solid #ddd", borderRadius: "25px", background: "#f8f9fa", cursor: "pointer" }}>
                  ✖ Effacer
                </button>
              )}
            </div>
          </div>
        )}

        {/* Message aucun résultat */}
        {filteredCourses.length === 0 && (
          <div className="alert alert-info text-center">
            <i className="fas fa-info-circle"></i>
            <p>Aucun cours trouvé.</p>
          </div>
        )}

        {/* Grille des cours */}
        {filteredCourses.length > 0 && (
          <div className="row">
            {filteredCourses.map((course) => {
              const badge = getBadge(course.validation_status);
              const isPending = course.validation_status === 'pending';
              
              return (
                <div key={course.id} className="col-lg-4 col-md-6 mb-30">
                  <div className="card h-100" style={{ borderRadius: "10px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                    
                    {/* Badge validation */}
                    {badge && (
                      <div style={{ position: "absolute", top: "10px", left: "10px", zIndex: 10, padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", backgroundColor: badge.bg, color: badge.color }}>
                        {badge.text}
                      </div>
                    )}
                    
                    {/* Image */}
                    <img 
                      src={course.image ? `${API_URL}/image/${course.image}` : "https://via.placeholder.com/400x250"}
                      alt={course.titre}
                      style={{ width: "100%", height: "180px", objectFit: "cover" }}
                      onError={(e) => e.target.src = "https://via.placeholder.com/400x250"}
                    />
                    
                    <div className="card-body">
                      <span style={{ fontSize: "12px", color: "#ff5421" }}>
                        <i className="fas fa-tag"></i> {course.type || "Non catégorisé"}
                      </span>
                      
                      <h5 className="mt-2">
                        <a href={`/course/course/${course.id}`} style={{ color: "#333", textDecoration: "none" }}>
                          {course.titre}
                        </a>
                      </h5>
                      
                      {course.description && (
                        <p className="text-muted small">
                          {course.description.length > 100 ? course.description.substring(0, 100) + "..." : course.description}
                        </p>
                      )}
                      
                      <div className="mb-2">
                        <i className="fas fa-user" style={{ color: "#ff5421" }}></i>
                        <span className="ms-1 small">{course.enseignant || "Enseignant"}</span>
                      </div>
                      
                      {course.validation_comment && course.validation_status !== 'pending' && (
                        <div className="alert alert-light small p-2">
                          <i className="fas fa-comment"></i> {course.validation_comment}
                        </div>
                      )}
                      
                      <div className="d-flex justify-content-between text-muted small mb-3">
                        <span><i className="fas fa-clock"></i> {formatDuration(course.duration) || "N/A"}</span>
                        <span><i className="fas fa-signal"></i> {course.level || "Niveau"}</span>
                      </div>
                      
                      {/* Actions coordinateur */}
                      {isCoordinator && isPending && (
                        <div className="mt-2">
                          <textarea
                            className="form-control form-control-sm mb-2"
                            rows="2"
                            placeholder="Commentaire..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          />
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm w-50"
                              style={{ backgroundColor: "#ff5421", color: "white", border: "none" }}
                              onClick={() => handleApprove(course.id)}
                              disabled={updatingId === course.id}
                            >
                              {updatingId === course.id ? "..." : "✅ Valider"}
                            </button>
                            <button
                              className="btn btn-sm w-50"
                              style={{ backgroundColor: "#dc3545", color: "white", border: "none" }}
                              onClick={() => handleReject(course.id)}
                              disabled={updatingId === course.id}
                            >
                              ✗ Rejeter
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {!isCoordinator && isPending && (
                        <div className="alert alert-info text-center mt-2" style={{ fontSize: "12px", padding: "8px" }}>
                          <i className="fas fa-hourglass-half"></i> En attente de validation
                        </div>
                      )}
                      
                      {course.validation_status === 'rejected' && (
                        <div className="alert alert-warning text-center mt-2" style={{ fontSize: "12px", padding: "8px" }}>
                          <i className="fas fa-exclamation-triangle"></i> Cours rejeté
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {filteredCourses.length > 0 && (
          <div className="text-center mt-4 text-muted small">
            <i className="fas fa-chart-line"></i> {filteredCourses.length} cours sur {courses.length}
          </div>
        )}
      </div>
      
      <Newsletter sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-80" />
      <Footer footerClass="rs-footer home9-style main-home" footerLogo={footerLogo} />
      <ScrollToTop scrollClassName="scrollup orange-color" />
      <SearchModal />
    </>
  );
};

export default ListeCoursParCategorie;