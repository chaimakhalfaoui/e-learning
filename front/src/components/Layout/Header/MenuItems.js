import React ,{ useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/authContext'; 


const MenuItems = (props) => {
    const { parentMenu, secondParentMenu } = props;
    const [rol,setRol]=useState("");
    const { role } = useAuth();
    

    const location = useLocation();
    useEffect(() => {
        const fetchRole = async () => {
          try {
            const userRole = await role(); 
            console.log("Role de l'utilisateur:", userRole);
            setRol(userRole);
          } catch (error) {
            console.error("Erreur lors de la récupération du rôle:", error);
          }
        };
    
        fetchRole();
      }, []);

    return (
        <React.Fragment>
            <li className={parentMenu === 'home' ? 'rs-mega-menu menu-item-has-children current-menu-item' : 'rs-mega-menu menu-item-has-children'}><Link to="/">Home</Link>
            </li>

            {rol === 'admin' || rol === 'coordinateur' ? (
   <li className={parentMenu === 'statistiques' ? 'menu-item-has-children current-menu-item' : 'menu-item-has-children'}>
                <Link to="/admin/statistiques">Statistiques</Link>
            </li>   
            ) : null}
           
            {rol !== 'admin' && rol !== 'coordinateur'  && rol !== 'etudiant' ? (
            <li className={parentMenu === 'course' ? 'menu-item-has-children current-menu-item' : 'menu-item-has-children'}>
            <Link to="/course">Courses</Link>
                {rol === 'enseignant' ? (
                    <ul className="sub-menu">
                        <li>
                            <Link to="/admin/mycours" className={location.pathname === "/admin/mycours" ? "active-menu" : ""}>Liste des Cours</Link>
                        </li>
                        <li>
                            <Link to="/admin/createcours" className={location.pathname === "/admin/createcours" ? "active-menu" : ""}>Ajouter un Cours</Link>
                        </li>
                    </ul>
                ) : null}
            </li>) : null}
               {rol === 'etudiant' ? (
            <li className={parentMenu === 'course' ? 'menu-item-has-children current-menu-item' : 'menu-item-has-children'}>
            <Link to="">Courses</Link>
                    <ul className="sub-menu">
                        <li>
                            <Link to="/course" className={location.pathname === "/course" ? "active-menu" : ""}>Tous Les Cours</Link>
                        </li>
                        <li>
                            <Link to="/etucours" className={location.pathname === "/etucours" ? "active-menu" : ""}>Mes Cours  Suivis</Link>
                        </li>
                    </ul>
            </li>) : null}
            
            
              {rol === 'coordinateur' ? (
            <li className={parentMenu === 'categories' ? 'menu-item-has-children current-menu-item' : 'menu-item-has-children'}>
            <Link to="">Categories</Link>
                    <ul className="sub-menu">
                        <li>
                            <Link to="/coordinateur/listecategorie" 
                            className={location.pathname === "/coordinateur/listecategorie" ? "active-menu" : ""}>Liste Categories</Link>
                        </li>
                        <li>
                            <Link to="/coordinateur/createcategorie" 
                            className={location.pathname === "/coordinateur/createcategorie" ? "active-menu" : ""}>Ajouter Categorie</Link>
                        </li>
                    </ul>
                  
            </li>) : null}
        {rol === 'admin' && (
  <li className={parentMenu === 'users' ? 'menu-item-has-children current-menu-item' : 'menu-item-has-children'}>
    <Link to="">Users</Link>
    <ul className="sub-menu">
      <li>
        <Link 
          to="/admin/Coordinateur" 
          className={location.pathname === "/admin/Coordinateur" ? "active-menu" : ""}
        >
          Liste des Coordinateurs
        </Link>
      </li>
      <li>
        <Link 
          to="/admin/enseignant" 
          className={location.pathname === "/admin/enseignant" ? "active-menu" : ""}
        >
          Liste des Enseignants
        </Link>
      </li>
      <li>
        <Link 
          to="/admin/etudiant" 
          className={location.pathname === "/admin/etudiant" ? "active-menu" : ""}
        >
          Liste des Étudiants
        </Link>
      </li>
    </ul>
  </li>
)}

{rol === 'coordinateur' && (
  <li className={parentMenu === 'event' ? 'menu-item-has-children current-menu-item' : 'menu-item-has-children'}>
    <Link to="">Users</Link>
    <ul className="sub-menu">
      <li>
        <Link 
          to="/admin/enseignant" 
          className={location.pathname === "/admin/enseignant" ? "active-menu" : ""}
        >
          Liste des Enseignants
        </Link>
      </li>
      <li>
        <Link 
          to="/admin/etudiant" 
          className={location.pathname === "/admin/etudiant" ? "active-menu" : ""}
        >
          Liste des Étudiants
        </Link>
      </li>
    </ul>
  </li>
)}


 {/*{(rol === 'coordinateur' || rol === 'admin'  || rol === 'enseignant' || rol === 'etudiant') && (
  <li className={parentMenu === 'evenements' ? 'menu-item-has-children current-menu-item' : 'menu-item-has-children'}>
    <Link to="">Événements</Link>
    <ul className="sub-menu">
      <li>
        <Link 
          to="/admin/myevent" 
          className={location.pathname === "/admin/myevent" ? "active-menu" : ""}>
          Liste des Événements
        </Link>
      </li>
      {(rol === 'coordinateur' || rol === 'admin' ) && (
      <li>
        <Link 
          to="/admin/createvt" 
          className={location.pathname === "/admin/createvt" ? "active-menu" : ""}
        >
          Ajouter Événement
        </Link>
      </li>
  
)}  </ul>
  </li>
 )}*/}
    <li className={parentMenu === 'about' ? 'menu-item-has-children current-menu-item' : 'menu-item-has-children'}>
                <Link to="/about">About</Link>  
            </li>
            <li className={parentMenu === 'contact' ? 'menu-item-has-children current-menu-item' : 'menu-item-has-children'}>
                <Link to="/contact">
                    Contact
                </Link>
            </li>
            
        </React.Fragment>
    );
}

export default MenuItems;