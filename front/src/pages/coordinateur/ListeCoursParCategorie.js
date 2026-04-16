import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import CourseSingleTwo from "../../components/Courses/CourseSingleTwo";
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

const ListeCoursParCategorie = () => {
  const { idCategorie } = useParams();
  const { role } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categorieName, setCategorieName] = useState("");
  const [categorieInfo, setCategorieInfo] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Récupérer le rôle de l'utilisateur
  useEffect(() => {
    const getUserRole = async () => {
      try {
        const userRoleValue = await role();
        setUserRole(userRoleValue);
      } catch (error) {
        console.error("Erreur récupération rôle:", error);
      }
    };
    getUserRole();
  }, [role]);

  // Récupérer les informations de la catégorie
  useEffect(() => {
    const fetchCategorieInfo = async () => {
      try {
        const response = await axios.get(`http://localhost:8801/api/categorie/${idCategorie}`);
        if (response.data) {
          setCategorieInfo(response.data);
          setCategorieName(response.data.title || response.data.nom || `Catégorie ${idCategorie}`);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du nom de la catégorie:", error);
        setCategorieName(`Catégorie ${idCategorie}`);
      }
    };
    
    if (idCategorie) {
      fetchCategorieInfo();
    }
  }, [idCategorie]);

  // Récupérer les cours
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Si l'utilisateur est admin ou coordinateur, inclure les cours cachés
        const includeHidden = (userRole === 'admin' || userRole === 'coordinateur') ? '?includeHidden=true' : '';
        const response = await axios.get(`http://localhost:8801/api/cours/categorie/${idCategorie}/cours${includeHidden}`);
        
        let coursesData = [];
        if (response.data.cours && Array.isArray(response.data.cours)) {
          coursesData = response.data.cours;
          if (response.data.categorie) {
            setCategorieName(response.data.categorie.nom);
          }
        } else if (Array.isArray(response.data)) {
          coursesData = response.data;
        } else {
          coursesData = [];
        }
        
        setCourses(coursesData);
        setFilteredCourses(coursesData);
        
      } catch (error) {
        console.error("Erreur:", error);
        
        if (error.response) {
          if (error.response.status === 404) {
            setError("Catégorie non trouvée");
          } else if (error.response.status === 500) {
            setError("Erreur serveur. Veuillez réessayer plus tard.");
          } else {
            setError(error.response.data?.message || "Erreur lors du chargement des cours");
          }
        } else if (error.request) {
          setError("Impossible de se connecter au serveur.");
        } else {
          setError(error.message || "Une erreur inattendue s'est produite");
        }
        
        setCourses([]);
        setFilteredCourses([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (userRole !== null) {
      fetchCourses();
    }
  }, [idCategorie, userRole]);

  // Vérifier si l'utilisateur peut modifier le statut
  const canModifyStatus = () => {
    return userRole === 'admin' || userRole === 'coordinateur';
  };

  // Modifier le statut du cours
  const updateCourseStatus = async (courseId, currentStatus) => {
    if (!canModifyStatus()) {
      alert("Vous n'avez pas les droits pour modifier le statut d'un cours.");
      return;
    }
    
    const newStatus = currentStatus === 'published' ? 'hidden' : 'published';
    const actionText = newStatus === 'published' ? 'publier' : 'cacher';
    
    if (window.confirm(`Voulez-vous vraiment ${actionText} ce cours ?`)) {
      setUpdatingStatus(courseId);
      
      try {
        const response = await axios.put(`http://localhost:8801/api/cours/status/${courseId}`, {
          status: newStatus
        });
        
        if (response.status === 200) {
          const updatedCourses = courses.map(course => 
            course.id === courseId ? { ...course, status: newStatus } : course
          );
          setCourses(updatedCourses);
          setFilteredCourses(updatedCourses);
          alert(`Cours ${newStatus === 'published' ? 'publié' : 'caché'} avec succès !`);
        }
      } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur lors de la modification du statut.");
      } finally {
        setUpdatingStatus(null);
      }
    }
  };

  // Recherche
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === "") {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(cours => 
        cours.titre?.toLowerCase().includes(term) ||
        cours.description?.toLowerCase().includes(term) ||
        cours.type?.toLowerCase().includes(term) ||
        cours.level?.toLowerCase().includes(term) ||
        cours.enseignant?.toLowerCase().includes(term)
      );
      setFilteredCourses(filtered);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredCourses(courses);
  };

  // Styles
  const searchContainerStyle = {
    marginBottom: "30px",
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    flexWrap: "wrap"
  };

  const searchInputStyle = {
    width: "100%",
    maxWidth: "500px",
    padding: "12px 20px",
    fontSize: "16px",
    border: "2px solid #ddd",
    borderRadius: "25px",
    outline: "none",
    transition: "all 0.3s ease"
  };

  const clearButtonStyle = {
    padding: "12px 20px",
    fontSize: "16px",
    border: "2px solid #ddd",
    borderRadius: "25px",
    backgroundColor: "#f8f9fa",
    cursor: "pointer",
    transition: "all 0.3s ease",
    color: "#666"
  };

  const resultCountStyle = {
    textAlign: "center",
    marginTop: "20px",
    marginBottom: "20px",
    color: "#666",
    fontSize: "14px"
  };

  const statusButtonStyle = (status) => ({
    padding: "5px 10px",
    fontSize: "12px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    marginTop: "10px",
    backgroundColor: status === 'published' ? '#28a745' : '#dc3545',
    color: "white",
    transition: "all 0.3s ease",
    width: "100%",
    opacity: canModifyStatus() ? 1 : 0.5
  });

  const cardStyle = {
    padding: "15px",
    textAlign: "center",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.3s ease",
    height: "100%",
    position: "relative"
  };

  const statusBadgeStyle = (status) => ({
    position: "absolute",
    top: "10px",
    right: "10px",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "bold",
    backgroundColor: status === 'published' ? '#28a745' : '#dc3545',
    color: "white",
    zIndex: 10
  });

  if (loading) {
    return (
      <React.Fragment>
        <OffWrap />
        <Header
          parentMenu="Cours de la catégorie"
          secondParentMenu="others"
          headerNormalLogo={Logo}
          headerStickyLogo={Logo}
          CanvasLogo={Logo}
          mobileNormalLogo={Logo}
          CanvasClass="right_menu_togle hidden-md"
          headerClass="full-width-header header-style1 home8-style4"
          TopBar="enable"
          TopBarClass="topbar-area home8-topbar"
          emailAddress="admin@isetso.rnu.tn"
          Location="Cité Erriadh - B.P 135"
        />
        <SiteBreadcrumb
          pageTitle="Cours de la catégorie"
          pageName="Liste des Cours"
          breadcrumbsImg={bannerbg}
        />
        <div className="container pt-100 pb-100 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement des cours...</p>
        </div>
        <Newsletter sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-80" />
        <Footer footerClass="rs-footer home9-style main-home" footerLogo={footerLogo} />
        <ScrollToTop scrollClassName="scrollup orange-color" />
        <SearchModal />
      </React.Fragment>
    );
  }

  if (error) {
    return (
      <React.Fragment>
        <OffWrap />
        <Header
          parentMenu="Cours de la catégorie"
          secondParentMenu="others"
          headerNormalLogo={Logo}
          headerStickyLogo={Logo}
          CanvasLogo={Logo}
          mobileNormalLogo={Logo}
          CanvasClass="right_menu_togle hidden-md"
          headerClass="full-width-header header-style1 home8-style4"
          TopBar="enable"
          TopBarClass="topbar-area home8-topbar"
          emailAddress="admin@isetso.rnu.tn"
          Location="Cité Erriadh - B.P 135"
        />
        <SiteBreadcrumb
          pageTitle="Cours de la catégorie"
          pageName="Liste des Cours"
          breadcrumbsImg={bannerbg}
        />
        <div className="container pt-100 pb-100">
          <div className="alert alert-danger text-center">
            <h4>Erreur !</h4>
            <p>{error}</p>
            <button className="btn btn-primary mt-2" onClick={() => window.location.reload()}>
              Réessayer
            </button>
          </div>
        </div>
        <Newsletter sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-80" />
        <Footer footerClass="rs-footer home9-style main-home" footerLogo={footerLogo} />
        <ScrollToTop scrollClassName="scrollup orange-color" />
        <SearchModal />
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <OffWrap />
      <Header
        parentMenu="Cours de la catégorie"
        secondParentMenu="others"
        headerNormalLogo={Logo}
        headerStickyLogo={Logo}
        CanvasLogo={Logo}
        mobileNormalLogo={Logo}
        CanvasClass="right_menu_togle hidden-md"
        headerClass="full-width-header header-style1 home8-style4"
        TopBar="enable"
        TopBarClass="topbar-area home8-topbar"
        emailAddress="admin@isetso.rnu.tn"
        Location="Cité Erriadh - B.P 135"
      />

      <SiteBreadcrumb
        pageTitle={categorieName || "Cours par catégorie"}
        pageName="Liste des Cours"
        breadcrumbsImg={bannerbg}
      />
      
      <div className="container pt-100 pb-100">
        <h2 className="text-center mb-30">
          <i className="fas fa-folder-open" style={{ color: '#ff5421', marginRight: '10px' }}></i>
          {categorieName ? `Cours de la catégorie : ${categorieName}` : `Cours de la catégorie N°${idCategorie}`}
          {filteredCourses.length > 0 && (
            <span className="badge bg-secondary ms-2">{filteredCourses.length}</span>
          )}
        </h2>
        
        {categorieInfo && categorieInfo.description && (
          <div className="text-center mb-40" style={{ color: '#666', maxWidth: '800px', margin: '0 auto 30px auto' }}>
            <p>{categorieInfo.description}</p>
          </div>
        )}
        
        {courses.length > 0 && (
          <div style={searchContainerStyle}>
            <input
              type="text"
              placeholder="🔍 Rechercher un cours..."
              value={searchTerm}
              onChange={handleSearch}
              style={searchInputStyle}
              onFocus={(e) => e.target.style.borderColor = "#ff5421"}
              onBlur={(e) => e.target.style.borderColor = "#ddd"}
            />
            {searchTerm && (
              <button onClick={clearSearch} style={clearButtonStyle}>
                ✖ Effacer
              </button>
            )}
          </div>
        )}

        {!loading && !error && courses.length > 0 && (
          <div style={resultCountStyle}>
            <i className="fas fa-chalkboard"></i> {filteredCourses.length} cours trouvé(s) sur {courses.length} total
            {searchTerm && ` pour "${searchTerm}"`}
          </div>
        )}
        
        {filteredCourses.length === 0 && searchTerm && (
          <div className="alert alert-warning text-center">
            <i className="fas fa-search"></i>
            <p className="mt-2 mb-2">
              Aucun cours ne correspond à votre recherche "<strong>{searchTerm}</strong>"
            </p>
            <button className="btn btn-link" onClick={clearSearch}>
              Afficher tous les cours
            </button>
          </div>
        )}

        {filteredCourses.length === 0 && !searchTerm && courses.length === 0 && (
          <div className="alert alert-info text-center">
            <i className="fas fa-info-circle"></i>
            <p className="mt-2 mb-0">Aucun cours trouvé pour cette catégorie.</p>
          </div>
        )}
        
        {filteredCourses.length > 0 && (
          <div className="row">
            {filteredCourses.map((cours) => (
              <div key={cours.id} className="col-lg-4 col-md-6 mb-30">
                <div style={cardStyle}>
                  <div style={statusBadgeStyle(cours.status || 'hidden')}>
                    {cours.status === 'published' ? '✓ Publié' : '🔒 Caché'}
                  </div>
                  
                  <CourseSingleTwo
                    courseClass="courses-item"
                    courseImg={cours.image ? `http://localhost:8801/api/image/${cours.image}` : "https://via.placeholder.com/400x250?text=Image+non+disponible"}
                    courseTitle={cours.titre}
                    courseCategory={cours.type}
                    courseid={cours.id}
                    coursePrice="New"
                  />
                  
                  {canModifyStatus() && (
                    <button
                      onClick={() => updateCourseStatus(cours.id, cours.status || 'hidden')}
                      style={statusButtonStyle(cours.status || 'hidden')}
                      disabled={updatingStatus === cours.id}
                    >
                      {updatingStatus === cours.id ? (
                        <span>Chargement...</span>
                      ) : (
                        cours.status === 'published' ? '🔒 Cacher' : '✓ Publier'
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredCourses.length > 0 && (
          <div className="text-center mt-4">
            <small className="text-muted">
              <i className="fas fa-chart-line me-1"></i>
              Total: {filteredCourses.length} cours
              {searchTerm && ` (filtré sur ${courses.length} total)`}
            </small>
          </div>
        )}
      </div>
      
      <Newsletter sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-80" />
      <Footer footerClass="rs-footer home9-style main-home" footerLogo={footerLogo} />
      <ScrollToTop scrollClassName="scrollup orange-color" />
      <SearchModal />
    </React.Fragment>
  );
};

export default ListeCoursParCategorie;