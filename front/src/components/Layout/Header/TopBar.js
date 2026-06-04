import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { useAuth } from '../../../context/authContext';

const TopHeader = (props) => {
    const { topBarClass, emailAddress, phoneNumber, Location } = props;
    const navigate = useNavigate();
    const [nam, setName] = useState("");
    const { name } = useAuth();

    const fetchName = async () => {
        try {
            const userName = await name();
            setName(userName || "");
        } catch (error) {
            console.error("Erreur lors de la récupération du nom:", error);
        }
    };

    useEffect(() => {
        fetchName();
    }, []);

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://isetso-alb-1947778921.us-east-1.elb.amazonaws.com/api/auth/logout');
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_role');
            setName("");
            navigate("/");
        }
    };

    return (
        <div className={topBarClass ? topBarClass : "topbar-area home8-topbar hidden-md"}>
            <div className="container">
                <div className="row y-middle">
                    <div className="col-md-7">
                        <ul className="topbar-contact">
                            {emailAddress && (
                                <li>
                                    <i className="flaticon-email"></i>
                                    <a href={'mailto:' + emailAddress}>{emailAddress}</a>
                                </li>
                            )}
                            {phoneNumber && (
                                <li>
                                    <i className="flaticon-call"></i>
                                    <a href={'tel:+' + phoneNumber}>{phoneNumber}</a>
                                </li>
                            )}
                            {Location && (
                                <li>
                                    <i className="flaticon-location"></i>
                                    {Location}
                                </li>
                            )}
                        </ul>
                    </div>
                    <div className="col-md-5 text-end">
                        <ul className="topbar-right">
                            <li className="login-register">
                                {nam ? (
                                    <>
                                        <button style={{ border: "none", background: "transparent" }} onClick={handleLogout}>
                                            <i className="fa fa-sign-out"></i>
                                        </button>
                                        {String(nam)}
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login">Login</Link> / <Link to="/register">Register</Link>
                                    </>
                                )}
                            </li>
                            <li className="btn-part">
                                <Link to="/contact" className="apply-btn">Contacter-Nous</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopHeader;
