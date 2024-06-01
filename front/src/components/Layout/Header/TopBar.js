import React ,{useContext, useEffect, useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import axios from "axios";
import { useAuth } from '../../../context/authContext'; 

const TopHeader = (props) => {
	const { topBarClass, emailAddress, phoneNumber, Location } = props;
    const navigate = useNavigate();
    const [nam,setName]=useState("");
    const { name } = useAuth();
    const fetchName = async () => {
        try {
          const userName = await name(); 
          console.log("name de l'utilisateur:", userName);
          setName(userName);
        } catch (error) {
          console.error("Erreur lors de la récupération du rôle:", error);
        }
      };
    useEffect(() => {
        
    
        fetchName();
      }, []);
      const handleLogout = async (e) => {
        e.preventDefault();
        try {
          // Appel de l'API pour se déconnecter
          const response = await axios.post('http://localhost:8801/api/auth/logout');
          if (response.status === 200) {
            localStorage.removeItem('access_token');
            navigate("/");
          } else {
            console.error('Erreur lors de la déconnexion :', response.data);
          }
        } catch (error) {
          console.error('Erreur lors de la déconnexion :', error);
        }
      };

    return (
        <div className={topBarClass ? topBarClass : "topbar-area home8-topbar hidden-md"}>
            <div className="container">
                <div className="row y-middle">
                    <div className="col-md-7">
                        <ul className="topbar-contact">
                            {emailAddress ? 
                                <li>
                                    <i className="flaticon-email"></i>
                                    <a href={'mailto:' + emailAddress}>{emailAddress}</a>
                                </li> : ""
                            }
                            {phoneNumber ? 
                                <li>
                                    <i className="flaticon-call"></i>
                                    <a href={'tel:+' + phoneNumber}>{phoneNumber}</a>
                                </li> : ""
                            }
                            {Location ? 
                                <li>
                                    <i className="flaticon-location"></i>
                                    {Location}
                                </li> : ""
                            }
                        </ul>
                    </div>
                    <div className="col-md-5 text-end">
                        <ul className="topbar-right">
                            <li className="login-register">
                                {nam ?<><button style={{border:"none" , background:"transparent"}} onClick={handleLogout}><i className="fa fa-sign-in" ></i></button>{nam}</>  : <><Link to="/login">Login</Link>/<Link to="/register">Register</Link></>}
                            </li>
                            <li className="btn-part">
                                <Link to="/contact" className="apply-btn">Apply Now</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TopHeader;