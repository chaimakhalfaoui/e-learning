// src/pages/Coordinateur/EditCategorie.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import Header from "../../components/Layout/Header/Header";
import Footer from "../../components/Layout/Footer/Footer";
import SiteBreadcrumb from "../../components/Common/Breadcumb";
import Newsletter from "../../components/Common/Newsletter";
import ScrollToTop from "../../components/Common/ScrollTop";
import OffWrap from "../../components/Layout/Header/OffWrap";
import SearchModal from "../../components/Layout/Header/SearchModal";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import bannerbg from "../../assets/img/breadcrumbs/inner7.jpg";
import Logo from "../../assets/img/logo/dark-logo.png";
import footerLogo from "../../assets/img/logo/lite-logo.png";

const API_URL = 'http://isetso-alb-1947778921.us-east-1.elb.amazonaws.com/api';
const UPLOADS_URL = 'http://isetso-alb-1947778921.us-east-1.elb.amazonaws.com/api/uploads'; // Correction : pas de /api

const EditCategorie = () => {
  const { id } = useParams();
  const { role } = useAuth();
  const navigate = useNavigate();
  
  const [categorie, setCategorie] = useState({
    title: "",
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Vérification des droits (admin ou coordinateur)
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const userRole = await role();
        if (userRole !== 'admin' && userRole !== 'coordinateur') {
          navigate('/404');
        }
      } catch (error) {
        console.error("Erreur vérification rôle:", error);
        navigate('/404');
      }
    };
    checkAccess();
  }, [role, navigate]);

  // Récupérer les informations de la catégorie
  useEffect(() => {
    const fetchCategorie = async () => {
      try {
        // Récupérer directement la catégorie par ID
        const response = await axios.get(`${API_URL}/categorie/${id}`);
        const data = response.data;
        
        if (data) {
          setCategorie({
            title: data.title || "",
            image: null
          });
          
          // Stocker le nom de l'image actuelle
          if (data.image) {
  setCurrentImage(data.image);
  // data.image est déjà une URL S3 complète, on l'utilise telle quelle
  const fullImageUrl = data.image.startsWith("http")
    ? data.image
    : `${UPLOADS_URL}/${data.image}`;
  setImagePreview(fullImageUrl);
  console.log("Image chargée:", fullImageUrl);
} else {
  setCurrentImage(null);
  setImagePreview(null);
}
          setError(null);
        } else {
          setError("Catégorie non trouvée");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération:", error);
        setError("Impossible de charger la catégorie");
        toast.error("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchCategorie();
    }
  }, [id]);

  const handleInputChange = (e) => {
    setCategorie(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.match('image.*')) {
        toast.error("Veuillez sélectionner une image valide");
        return;
      }
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5MB");
        return;
      }
      setCategorie(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!categorie.title) {
      toast.error("Veuillez remplir le titre de la catégorie");
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", categorie.title);
      if (categorie.image) {
        formData.append("image", categorie.image);
      }

      await axios.put(`${API_URL}/categorie/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success("✅ Catégorie modifiée avec succès !");
      setTimeout(() => {
        navigate("/coordinateur/listecategorie");
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      toast.error("❌ Erreur lors de la modification de la catégorie");
    } finally {
      setSubmitting(false);
    }
  };

  // Styles
  const inputStyle = {
    width: "100%",
    padding: "12px 15px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "14px",
    transition: "all 0.3s ease",
    marginBottom: "15px"
  };

  const imageLabelStyle = {
    cursor: "pointer",
    width: "100%",
    height: "250px",
    background: "#f8f9fa",
    border: "2px dashed #ddd",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: "20px",
    transition: "all 0.3s ease"
  };

  const imagePreviewStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  };

  const placeholderStyle = {
    textAlign: "center",
    color: "#999"
  };

  const buttonStyle = {
    backgroundColor: "#ff5421",
    color: "white",
    border: "none",
    padding: "12px 30px",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginRight: "10px"
  };

  const cancelButtonStyle = {
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    padding: "12px 30px",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease"
  };

  const backButtonStyle = {
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "5px",
    cursor: "pointer",
    marginBottom: "20px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px"
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
          pageTitle="Modifier Catégorie"
          pageName="Modification"
          breadcrumbsImg={bannerbg}
        />
        <div className="container pt-100 pb-100 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement de la catégorie...</p>
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
          pageTitle="Modifier Catégorie"
          pageName="Modification"
          breadcrumbsImg={bannerbg}
        />
        <div className="container pt-100 pb-100">
          <div className="alert alert-danger text-center">
            <i className="fas fa-exclamation-triangle fa-2x mb-2 d-block"></i>
            <p>{error}</p>
            <Link to="/coordinateur/listecategorie" className="btn btn-primary mt-2">
              <i className="fas fa-arrow-left me-2"></i>Retour à la liste
            </Link>
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
        pageTitle="Modifier Catégorie"
        pageName="Modification"
        breadcrumbsImg={bannerbg}
      />

      <div className="register-section pt-100 pb-100 md-pt-80 md-pb-80">
        <div className="container">
          
          <div className="register-box" style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div className="sec-title text-center mb-30">
              <h2 className="title mb-10">
                <i className="fas fa-edit me-2" style={{ color: '#ff5421' }}></i>
                Modifier la Catégorie
              </h2>
              <p className="desc" style={{ color: '#666' }}>
                Modifiez les informations de la catégorie
              </p>
            </div>
            
            <div className="styled-form">
              <form onSubmit={handleSubmit}>
                <div className="row clearfix">
                  {/* Upload d'image */}
                  <div className="form-group col-lg-12">
                    <label style={{ fontWeight: "500", marginBottom: "10px", display: "block" }}>
                      <i className="fas fa-image me-2" style={{ color: '#ff5421' }}></i>
                      Image de la catégorie
                    </label>
                    <label htmlFor="image" style={imageLabelStyle}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ff5421'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}>
                      {imagePreview ? (
                        <img 
                          style={imagePreviewStyle} 
                          src={imagePreview} 
                          alt="Aperçu" 
                          onError={(e) => {
                            console.error("Erreur chargement image:", imagePreview);
                            // Afficher un placeholder en cas d'erreur
                            e.target.style.display = 'none';
                            const parent = e.target.parentElement;
                            const placeholder = document.createElement('div');
                            placeholder.style.textAlign = 'center';
                            placeholder.style.color = '#999';
                            placeholder.innerHTML = `
                              <i class="fas fa-image fa-3x mb-2" style="color:#ff5421"></i>
                              <p>Image non disponible</p>
                              <small>Cliquez pour changer l'image</small>
                            `;
                            parent.appendChild(placeholder);
                          }}
                        />
                      ) : (
                        <div style={placeholderStyle}>
                          <i className="fas fa-cloud-upload-alt fa-3x mb-2" style={{ color: '#ff5421' }}></i>
                          <p>Cliquez pour choisir une image</p>
                          <small>PNG, JPG, JPEG (max 5MB)</small>
                        </div>
                      )}
                      <input type="file" id="image" name="image" onChange={handleImageChange} accept="image/*" hidden />
                    </label>
                  </div>
                  
                  <div className="form-group col-lg-12">
                    <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>
                      <i className="fas fa-heading me-2" style={{ color: '#ff5421' }}></i>
                      Nom de la catégorie <span style={{ color: '#dc3545' }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      name="title" 
                      value={categorie.title} 
                      placeholder="Ex: Développement Web, Design, Marketing..." 
                      onChange={handleInputChange} 
                      style={inputStyle}
                      required 
                    />
                  </div>
                  
                  <div className="form-group col-lg-12 text-center">
                    <button 
                      type="submit" 
                      style={buttonStyle}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "#e04e1a"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "#ff5421"}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin me-2"></i>
                          Modification en cours...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Enregistrer les modifications
                        </>
                      )}
                    </button>
                    <button 
                      type="button" 
                      style={cancelButtonStyle}
                      onClick={() => navigate("/coordinateur/listecategorie")}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "#5a6268"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "#6c757d"}
                    >
                      <i className="fas fa-times me-2"></i>
                      Annuler
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Newsletter sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-80" />
      <Footer footerClass="rs-footer home9-style main-home" footerLogo={footerLogo} />
      <ScrollToTop scrollClassName="scrollup orange-color" />
      <SearchModal />
    </React.Fragment>
  );
};

export default EditCategorie;
