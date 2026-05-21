import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
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
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'http://isetso-backend-lb-667158618.us-east-1.elb.amazonaws.com:8801/api';

const ListCategorie = () => {
  const { role } = useAuth();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseCounts, setCourseCounts] = useState({});

  // Vérification des droits (admin ou coordinateur)
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const userRole = await role();
        if (userRole !== 'admin' && userRole !== 'coordinateur') {
          window.location.href = '/404';
        }
      } catch (error) {
        console.error("Erreur vérification rôle:", error);
      }
    };
    checkAccess();
  }, [role]);

  // Récupérer le nombre de cours par catégorie
  const fetchCourseCounts = async (categoriesData) => {
    const counts = {};
    for (const cat of categoriesData) {
      try {
        const response = await axios.get(`${API_URL}/cours/categorie/${cat.id}/cours?includeHidden=true`);
        const coursData = response.data.cours || response.data || [];
        counts[cat.id] = coursData.length;
      } catch (error) {
        console.error(`Erreur pour catégorie ${cat.id}:`, error);
        counts[cat.id] = 0;
      }
    }
    setCourseCounts(counts);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/categorie`);
        const categoriesData = response.data;
        setCategories(categoriesData);
        setFilteredCategories(categoriesData);
        setError(null);
        
        // Récupérer le nombre de cours pour chaque catégorie
        await fetchCourseCounts(categoriesData);
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
        setError("Impossible de charger les catégories. Veuillez réessayer plus tard.");
        toast.error("Erreur de chargement des catégories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === "") {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(cat => 
        cat.title?.toLowerCase().includes(term) ||
        cat.description?.toLowerCase().includes(term) ||
        cat.id?.toString().includes(term)
      );
      setFilteredCategories(filtered);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredCategories(categories);
  };

  const handleDelete = async (id) => {
    if (window.confirm("⚠️ Voulez-vous vraiment supprimer cette catégorie ?\nTous les cours associés seront également supprimés !")) {
      try {
        await axios.delete(`${API_URL}/categorie/${id}`);
        const updatedCategories = categories.filter(cat => cat.id !== id);
        setCategories(updatedCategories);
        setFilteredCategories(updatedCategories);
        
        // Mettre à jour les compteurs
        const newCounts = { ...courseCounts };
        delete newCounts[id];
        setCourseCounts(newCounts);
        
        toast.success("✅ Catégorie supprimée avec succès !");
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        toast.error("❌ Erreur lors de la suppression de la catégorie.");
      }
    }
  };

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

  const cardStyle = {
    padding: "20px",
    textAlign: "center",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.3s ease",
    height: "100%",
    position: "relative"
  };

  const imageStyle = {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    borderRadius: "8px"
  };

  const buttonStyle = {
    background: "none",
    border: "none",
    cursor: "pointer",
    transition: "transform 0.2s ease",
    fontSize: "18px"
  };

  const resultCountStyle = {
    textAlign: "center",
    marginTop: "20px",
    marginBottom: "30px",
    color: "#666",
    fontSize: "14px"
  };

  const courseCountBadge = {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "#ff5421",
    color: "white",
    borderRadius: "20px",
    padding: "4px 10px",
    fontSize: "12px",
    fontWeight: "bold"
  };

  if (loading) {
    return (
      <React.Fragment>
        <OffWrap />
        <Header
          parentMenu="categorie"
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
          pageTitle="Catégories"
          pageName="Liste des catégories"
          breadcrumbsImg={bannerbg}
        />
        <div className="container pt-100 pb-100 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement des catégories...</p>
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
          parentMenu="categorie"
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
          pageTitle="Catégories"
          pageName="Liste des catégories"
          breadcrumbsImg={bannerbg}
        />
        <div className="container pt-100 pb-100">
          <div className="alert alert-danger text-center">
            <i className="fas fa-exclamation-triangle fa-2x mb-2 d-block"></i>
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
        parentMenu="categorie"
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
        pageTitle="Catégories"
        pageName="Liste des catégories"
        breadcrumbsImg={bannerbg}
      />

      <div className="container pt-100 pb-100">
        <h2 className="text-center mb-30">
          <i className="fas fa-tags me-2" style={{ color: '#ff5421' }}></i>
          Toutes les catégories
          {filteredCategories.length > 0 && (
            <span className="badge bg-secondary ms-2">{filteredCategories.length}</span>
          )}
        </h2>
        
        <div style={searchContainerStyle}>
          <input
            type="text"
            placeholder="🔍 Rechercher une catégorie..."
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

        {!loading && !error && (
          <div style={resultCountStyle}>
            📊 {filteredCategories.length} catégorie(s) trouvée(s)
          </div>
        )}

        {!loading && !error && (
          <div className="row">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => (
                <div key={cat.id} className="col-lg-4 col-md-6 mb-30">
                  <div className="card" style={cardStyle}>
                    <div style={courseCountBadge}>
                      📚 {courseCounts[cat.id] || 0} cours
                    </div>
                    <img
                      src={cat.image ? (cat.image.startsWith("http") ? cat.image : `http://isetso-backend-lb-667158618.us-east-1.elb.amazonaws.com:8801/api/uploads/${cat.image}`) : "/placeholder.svg"}
                      alt={cat.title}
                      style={imageStyle}
                      onError={(e) => {
                        e.target.src = "/placeholder.svg";
                      }}
                    />
                    <h4 style={{ marginTop: "15px", fontSize: "18px", fontWeight: "bold" }}>
                      {cat.title}
                    </h4>
                    {cat.description && (
                      <p style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>
                        {cat.description.substring(0, 80)}
                        {cat.description.length > 80 ? "..." : ""}
                      </p>
                    )}
                    <div style={{ display: "flex", justifyContent: "center", gap: "25px", marginTop: "15px" }}>
                      <Link 
                        to={`/coordinateur/listecours/${cat.id}`} 
                        style={{ color: '#ff5421', fontWeight: 'bold', textDecoration: 'none' }}
                        title="Voir les cours de cette catégorie"
                      >
                        <i className="fas fa-book-open"></i> Voir Cours
                      </Link>
                      <Link 
                        to={`/categorie/edit/${cat.id}`} 
                        title="Modifier la catégorie"
                        style={{ color: '#007bff', textDecoration: 'none' }}
                      >
                        <i className="fas fa-edit" style={{ fontSize: "18px" }}></i>
                      </Link>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        style={buttonStyle}
                        title="Supprimer la catégorie"
                      >
                        <i className="fas fa-trash" style={{ color: "#dc3545", fontSize: "18px" }}></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="alert alert-info text-center" role="alert">
                  <i className="fas fa-search fa-2x mb-2 d-block"></i>
                  <p className="mb-2">
                    Aucune catégorie trouvée pour "<strong>{searchTerm}</strong>"
                  </p>
                  <button className="btn btn-link" onClick={clearSearch}>
                    <i className="fas fa-times"></i> Effacer la recherche
                  </button>
                </div>
              </div>
            )}
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

export default ListCategorie;