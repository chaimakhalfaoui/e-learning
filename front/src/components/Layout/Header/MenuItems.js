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
            
            
            <li className={parentMenu === 'course' ? 'menu-item-has-children current-menu-item' : 'menu-item-has-children'}>
            <Link to="/course" as="#">Courses</Link>
                {rol && ( rol === 'enseignant') && (
                    <ul className="sub-menu">
                        <li>
                            <Link to="/admin/mycours" className={location.pathname === "/admin/mycours" ? "active-menu" : ""}>My Courses</Link>
                        </li>
                        <li>
                            <Link to="/admin/createcours" className={location.pathname === "/admin/createcours" ? "active-menu" : ""}>Add Courses</Link>
                        </li>
                    </ul>
                )}

                
            </li>
            
            <li className={parentMenu === 'event' ? 'menu-item-has-children current-menu-item' : 'menu-item-has-children'}>
                <Link to="/event">Evenement</Link>
                {rol && ( rol === 'enseignant') && (
                    <ul className="sub-menu">
                        <li>
                            <Link to="/admin/myevent" className={location.pathname === "/admin/myevent" ? "active-menu" : ""}>My Event</Link>
                        </li>
                        <li>
                            <Link to="/admin/createvt" className={location.pathname === "/admin/createvt" ? "active-menu" : ""}>Add Evenement</Link>
                        </li>
                        
                    </ul>
                )}
                
            </li>
            {rol && (rol === 'admin') && (
            <li className={parentMenu === 'enseignant' ? 'menu-item-has-children current-menu-item' : 'menu-item-has-children'}>
                <Link to="#">enseignant</Link>
                
                    <ul className="sub-menu">
                        <li>
                            <Link to="/admin/createns" className={location.pathname === "/admin/createns" ? "active-menu" : ""}>Add enseignant</Link>
                        </li>
                       
                        
                    </ul>
               
            </li>
             )}
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