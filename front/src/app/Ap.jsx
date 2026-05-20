import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

// Custom Components
import Home from '../pages/home';
import About from '../pages/about';
import CourseOne from '../pages/course';
import CourseTwo from '../pages/course-2';
import CourseThree from '../pages/course-3';
import CourseFour from '../pages/course-4';
import CourseFive from '../pages/course-5';
import CourseSix from '../pages/course-6';
import CourseSingle from '../pages/course/course-single';
import CourseCategoryPage from '../pages/course-categories';
import Team from '../pages/team';
import TeamSingle from '../pages/team/team-single';
import Users from '../pages/Users';
import Enseignants from '../pages/enseignant';
import Etudiants from '../pages/etudiant';
import Shop from '../pages/shop';
import ShopSingle from '../pages/shop/shop-single';
import Cart from '../pages/shop/cart';
import Checkout from '../pages/shop/checkout';
import MyAccount from '../pages/shop/my-account';
import Faq from '../pages/faq';
import Login from '../pages/login';
import Register from '../pages/register';
import Contact from '../pages/contact';

import Error from '../pages/404';
import LoadTop from '../components/Common/ScrollTop/LoadTop';
import CreateEns from '../pages/admin/createEns'
import { AuthContextProvider } from '../context/authContext';
import CreateEvt from '../pages/admin/createEvt';
import CreateCours from '../pages/admin/createCours';
import CreateChaCours from '../pages/admin/createChaCours';
import CreateActivite from '../pages/admin/CreateActivite';
import CreateQuestionQuiz from '../pages/admin/createQuestionQuiz';
import ModifierCours from '../pages/admin/ModifierCours';
//import ModifierEvent from '../pages/admin/ModifierEvent';
import Edu from '../pages/admin/Edu';
import Ens from '../pages/admin/Ens';
import Coordinateurs from '../pages/coordinateur';
import CreateCoord from '../pages/admin/CreateCoord'
import CreateEtd from '../pages/admin/CreateEtd';
import CreateCategorie from '../pages/coordinateur/CreateCategorie';
import ListeCategorie  from '../pages/coordinateur/ListeCategorie';
import ListeCoursParCategorie from '../pages/coordinateur/ListeCoursParCategorie';
//import Event from '../pages/event';
import Statistiques from '../pages/Statistiques';
import MesCoursSuivis from '../pages/etudiant/MesCoursSuivis';
import EtudiantsParCours from '../pages/enseignant/EtudiantsParCours';
import EtudiantsTravaux from '../pages/enseignant/EtudiantsTravaux';
import EditCategorie from '../pages/coordinateur/EditCategorie';




const App = () => {
    return (
        <div className='App'>
           
           <Router>
           <AuthContextProvider>
            <LoadTop/>
        <Routes>
                <Route exact path="/"  element={<Home/>} />
                    <Route path="/home" element={<Home/>} />
                    <Route path="/about" element={<About/>} />
                    <Route path="/course-2" element={<CourseTwo/>} />
                    <Route path="/course-4" element={<CourseFour/>} />
                    <Route path="/course-5" element={<CourseFive/>} />
                    <Route path="/course-6" element={<CourseSix/>} />
                    <Route path="/course-categories" element={<CourseCategoryPage/>} />
                    <Route path="/team" exact element={<Team/>} />
                    <Route path="/coordinateur/createcategorie"  element={<CreateCategorie/>}/>
                    <Route path="/coordinateur/listecategorie" element={<ListeCategorie/>}/>
                     <Route path="/coordinateur/listecours/:idCategorie" element={<ListeCoursParCategorie/>} />
                    <Route path="/shop" exact element={<Shop/>} />
                    <Route path="/shop/shop-single" element={<ShopSingle/>} />
                    <Route path="/shop/cart" element={<Cart/>} />
                    <Route path="/shop/checkout" element={<Checkout/>} />
                    <Route path="/shop/my-account" element={<MyAccount/>} />
                    <Route path="/faq" element={<Faq/>} />
                    <Route path="/login" element={<Login/>} />
                    <Route path="/register" element={<Register/>} />
                    <Route path="/contact" element={<Contact/>} />
                    <Route path="/404" element={<Error/>} />
                    <Route path="/admin/createns" element={<CreateEns/>} />
                    <Route path="/admin/createetudiant" element={<CreateEtd/>} />
                    <Route path="/admin/createcoordinateur" element={<CreateCoord/>} />
                    <Route path="/admin/statistiques" element={<Statistiques />} />
                    <Route path="/admin/createvt" element={<CreateEvt/>} />
                    <Route path="/admin/listeusers" element={<Users/>} />
                    <Route path="/admin/enseignant" element={<Enseignants />} />
                    <Route path="/admin/etudiant" element={<Etudiants />} />
                    <Route path="/admin/coordinateur" element={<Coordinateurs />} />
                    {/*<Route path="/admin/myevent" element={<Event />} />
                    <Route path="/event" element={<EventThree/>} />*/}
                    <Route path="/admin/createcours" element={<CreateCours/>} />
                    <Route path="/admin/mycours" element={<CourseThree/>} />
                    <Route path="/course" exact element={<CourseOne/>} />
                    <Route path="/admin/createchapitre/:id" exact element={<CreateChaCours/>} />
                    <Route path="/admin/createactivite/:id" exact element={<CreateActivite/>} />
                    <Route path="/course/course/:id" element={<CourseSingle/>} />
                    <Route path="/admin/createquestionq/:id" element={<CreateQuestionQuiz/>}/>
                    <Route path="/profile" element={<TeamSingle/>} />
                    <Route path="/cours/modifier/:id" element={<ModifierCours/>} />
                    {/*<Route path="/event/modifier/:id" element={<ModifierEvent/>} />*/}
                    <Route path="/admin/edu" element={<Edu/>} />
                    <Route path="/admin/ens" element={<Ens/>} />
                    <Route path="/etucours" element={<MesCoursSuivis />} />
                    <Route path="/cours/etudiants/:idCours" element={<EtudiantsParCours />} />
                    <Route path="/enseignant/travaux/:activiteId" element={<EtudiantsTravaux />} />
                     <Route path="/categorie/edit/:id" element={<EditCategorie />} />
                </Routes>
                </AuthContextProvider>
                </Router>
        </div>
    );
}

export default App;
