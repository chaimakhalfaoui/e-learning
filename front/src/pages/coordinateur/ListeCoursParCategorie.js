import React, { useEffect, useState } from "react";
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
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api';

const ListeCoursParCategorie = () => {
  const { idCategorie } = useParams();
  const { role } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categorieName, setCategorieName] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // ✅ Pour tester, forcez isCoordinator = true
  // const isCoordinator = role === 'coordinateur' || role === 'admin';
  const isCoordinator = true; // 🔥 TEMPORAIRE POUR TESTER

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const url = `${API_URL}/cours/categorie/${idCategorie}/cours?includeHidden=true`;
      console.log("🔍 URL:", url);
      
      const res = await axios.get(url);
      console.log("📦 Réponse:", res.data);
      
      const coursData = res.data.cours || [];
      setCourses(coursData);
      
      if (res.data.categorie) {
        setCategorieName(res.data.categorie.nom);
      }
    } catch (err) {
      console.error("Erreur:", err);
      toast.error("Erreur lors du chargement des cours");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idCategorie) {
      fetchCourses();
    }
  }, [idCategorie]);

  const handleApprove = async (courseId) => {
    if (!window.confirm("✅ Valider ce cours ?")) return;
    setUpdatingId(courseId);
    try {
      await axios.put(`${API_URL}/cours/approve/${courseId}`, {
        validated_by: 1,
        comment: "Cours validé par le coordinateur"
      });
      toast.success("✅ Cours validé avec succès !");
      fetchCourses();
    } catch (err) {
      toast.error("❌ Erreur lors de la validation");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (courseId) => {
    if (!window.confirm("❌ Rejeter ce cours ?")) return;
    setUpdatingId(courseId);
    try {
      await axios.put(`${API_URL}/cours/reject/${courseId}`, { 
        comment: "Cours rejeté, veuillez modifier" 
      });
      toast.warning("❌ Cours rejeté");
      fetchCourses();
    } catch (err) {
      toast.error("❌ Erreur lors du rejet");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': 
        return <span className="badge bg-success">✅ Validé</span>;
      case 'pending': 
        return <span className="badge bg-warning text-dark">⏳ En attente</span>;
      case 'rejected': 
        return <span className="badge bg-danger">❌ Rejeté</span>;
      default: 
        return <span className="badge bg-secondary">📝 Non soumis</span>;
    }
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
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3">Chargement des cours...</p>
        </div>
        <Newsletter sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-80" />
        <Footer footerClass="rs-footer home9-style main-home" footerLogo={footerLogo} />
        <ScrollToTop scrollClassName="scrollup orange-color" />
        <SearchModal />
      </>
    );
  }

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
          <i className="fas fa-folder-open me-2" style={{ color: '#ff5421' }}></i>
          {categorieName || `Catégorie ${idCategorie}`}
          <span className="badge bg-secondary ms-2">{courses.length}</span>
        </h2>

        {courses.length === 0 && (
          <div className="alert alert-info text-center">
            <i className="fas fa-info-circle fa-2x mb-2 d-block"></i>
            <p>Aucun cours trouvé dans cette catégorie.</p>
          </div>
        )}

        <div className="row">
          {courses.map((course) => (
            <div key={course.id} className="col-lg-4 col-md-6 mb-30">
              <div className="card h-100 shadow-sm" style={{ borderRadius: "10px", overflow: "hidden" }}>
                <img 
                  src={course.image ? course.image && course.image.startsWith("http") ? course.image : `${API_URL}/image/${course.image}` : "https://via.placeholder.com/400x250"}
                  className="card-img-top"
                  alt={course.titre}
                  style={{ height: "180px", objectFit: "cover" }}
                  onError={(e) => e.target.src = "https://via.placeholder.com/400x250"}
                />
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-secondary">{course.type || "Non catégorisé"}</span>
                    {getStatusBadge(course.validation_status)}
                  </div>
                  <h5 className="card-title">{course.titre}</h5>
                  <p className="card-text text-muted small">
                    {course.description?.substring(0, 100)}
                    {course.description?.length > 100 ? "..." : ""}
                  </p>
                  <div className="small text-muted mb-2">
                    <i className="fas fa-user me-1"></i> {course.enseignant || "Enseignant"}
                  </div>
                  <div className="small text-muted mb-3">
                    <i className="fas fa-clock me-1"></i> Durée: {course.duration || "N/A"} heures
                  </div>
                  
                  {/* ✅ Boutons visibles pour TOUS les cours en attente */}
                  {course.validation_status === 'pending' && (
                    <div className="d-flex gap-2 mt-2">
                      <button
                        className="btn btn-success btn-sm w-50"
                        onClick={() => handleApprove(course.id)}
                        disabled={updatingId === course.id}
                      >
                        {updatingId === course.id ? "..." : "✅ Valider"}
                      </button>
                      <button
                        className="btn btn-danger btn-sm w-50"
                        onClick={() => handleReject(course.id)}
                        disabled={updatingId === course.id}
                      >
                        {updatingId === course.id ? "..." : "❌ Rejeter"}
                      </button>
                    </div>
                  )}
                  
                  {course.validation_status !== 'pending' && (
                    <div className="text-center text-muted small mt-2">
                      <i className="fas fa-check-circle"></i> Déjà traité
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {courses.length > 0 && (
          <div className="text-center mt-4 text-muted small">
            <i className="fas fa-chart-line"></i> {courses.length} cours au total
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
