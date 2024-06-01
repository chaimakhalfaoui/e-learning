import React ,{useContext, useEffect, useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import axios from "axios";
import { useAuth } from '../../../context/authContext'; 
import MenuItems from './MenuItems';
import RSMobileMenu from './RSMobileMenu';
import CanvasMenu from './CanvasMenu';
import TopHeader from './TopBar';

import normalLogo from '../../../assets/img/logo/lite-logo.png';
import darkLogo from '../../../assets/img/logo/dark-logo.png';

import productImg1 from '../../../assets/img/shop/1.jpg';
import productImg2 from '../../../assets/img/shop/2.jpg';

const Header = (props) => {
	const { headerClass, parentMenu, secondParentMenu, activeMenu, headerNormalLogo, headerStickyLogo, mobileNormalLogo, TopBar, TopBarClass, CanvasLogo, CanvasClass } = props;
	const [menuOpen, setMenuOpen] = useState(false)

	const [isVisible, setIsVisible] = useState(false);
	useEffect(() => {
		// Sticky is displayed after scrolling for 100 pixels
		const toggleVisibility = () => {
			if (window.pageYOffset > 100) {
				setIsVisible(true);
			} else {
				setIsVisible(false);
			}
		};

		window.addEventListener("scroll", toggleVisibility);

		return () => window.removeEventListener("scroll", toggleVisibility);
	}, []);

	const searchModalAdd = () => {
		document.body.classList.add('modal-open');
	};

	const canvasMenuAdd = () => {
		document.body.classList.add('nav-expanded');
	};

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
		<React.Fragment>
			<div className={headerClass ? headerClass : 'full-width-header home8-style4 main-home'}>
				<header id="rs-header" className='rs-header'>
					{
						TopBar ? <TopHeader topBarClass={TopBarClass} /> : ""
					}

					<div className={isVisible ? 'menu-area menu-sticky sticky' : 'menu-area menu-sticky'}>
						<div className="container">
							<div className="row y-middle">
								<div className="col-lg-2">
									<div className="logo-area hidden-md">
										<Link to="/">
											<img className="normal-logo" src={headerNormalLogo ? headerNormalLogo : normalLogo} alt="" />
											<img className="sticky-logo" src={headerStickyLogo ? headerStickyLogo : darkLogo} alt="" />
										</Link>
									</div>
								</div>
								<div className="col-lg-8 text-end">
									<div className="rs-menu-area">
										<div className="main-menu">
											<div className="mobile-menu md-display-block">
												<Link to="/" className="mobile-normal-logo"><img className="normal-logo" src={mobileNormalLogo ? mobileNormalLogo : darkLogo} alt="" /></Link>
												<Link to="/" className="mobile-sticky-logo"><img src={darkLogo} alt="logo" /></Link>
												<Link to="#" className="rs-menu-toggle" onClick={() => {
													setMenuOpen(!menuOpen)
												}}>
													<i className="fa fa-bars"></i>
												</Link>
											</div>
											<nav className="rs-menu hidden-md">
												<ul className="nav-menu">
													<MenuItems
														parentMenu={parentMenu}
														secondParentMenu={secondParentMenu}
														activeMenu={activeMenu}
													/>
												</ul>
											</nav>
										</div>
									</div>
								</div>
								<div className="col-lg-2 text-end hidden-md">
									<div className="expand-btn-inner search-icon">
										<ul className="expand-items">
											
											{nam ?<>
											<li className="user-icon last-icon hidden-lg">
												<Link to="/profile"><i className="fa fa-user-o" aria-hidden="true"></i></Link>
											</li>
											</>  : <>
											<Link style={{color:"#ffff"}} to="/login">Login</Link>   </>}
											
										</ul>
									</div>
								</div>
							</div>
						</div>
					</div>

					<RSMobileMenu
						menuOpen={menuOpen}
						setMenuOpen={setMenuOpen}
						parentMenu={parentMenu}
						secondParentMenu={secondParentMenu}
					/>
					<div onClick={() => setMenuOpen(false)} className={menuOpen ? "body-overlay show" : "body-overlay"}></div>
				</header>
				<CanvasMenu
					canvasClass={CanvasClass ? CanvasClass : "right_menu_togle orange_color hidden-md"}
					canvasLogo={CanvasLogo ? CanvasLogo : darkLogo}
				/>
			</div>
		</React.Fragment>
	);
}

export default Header;