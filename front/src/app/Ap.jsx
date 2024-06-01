import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Custom Components
import Home from '../pages/home';
import HomeTwo from '../pages/home-2';
import HomeThree from '../pages/home-3';
import HomeFour from '../pages/home-4';
import HomeFive from '../pages/home-5';
import HomeSix from '../pages/home-6';
import HomeSeven from '../pages/home-7';
import HomeEight from '../pages/home-8';
import HomeNine from '../pages/home-9';
import HomeTen from '../pages/home-10';
import HomeEleven from '../pages/home-11';
import HomeTwelve from '../pages/home-12';
import HomeThirteen from '../pages/home-13';
import HomeFourteen from '../pages/home-14';
import HomeFifteen from '../pages/home-15';
import About from '../pages/about';
import AboutTwo from '../pages/about-2';
import CourseOne from '../pages/course';
import CourseTwo from '../pages/course-2';
import CourseThree from '../pages/course-3';
import CourseFour from '../pages/course-4';
import CourseFive from '../pages/course-5';
import CourseSix from '../pages/course-6';
import CourseSingle from '../pages/course/course-single';
import CourseCategoryPage from '../pages/course-categories';
import Team from '../pages/team';
import TeamTwo from '../pages/team-2';
import TeamSingle from '../pages/team/team-single';
import Event from '../pages/event';
import EventTwo from '../pages/event-2';
import EventThree from '../pages/event-3';
import Gallery from '../pages/gallery';
import GalleryTwo from '../pages/gallery-2';
import GalleryThree from '../pages/gallery-3';
import Shop from '../pages/shop';
import ShopSingle from '../pages/shop/shop-single';
import Cart from '../pages/shop/cart';
import Checkout from '../pages/shop/checkout';
import MyAccount from '../pages/shop/my-account';
import Faq from '../pages/faq';
import Login from '../pages/login';
import Register from '../pages/register';
import Blog from '../pages/blog';
import BlogLeft from '../pages/blog/BlogLeft';
import BlogRight from '../pages/blog/BlogRight';
import SinglePostLeftSidebar from '../pages/blog/single-post-left-sidebar';
import SinglePostRightSidebar from '../pages/blog/single-post-right-sidebar';
import SinglePostFullWidth from '../pages/blog/single-post-full-width';
import Contact from '../pages/contact';
import ContactTwo from '../pages/contact-2';
import ContactThree from '../pages/contact-3';
import ContactFour from '../pages/contact-4';
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
import ModifierEvent from '../pages/admin/ModifierEvent';


const App = () => {
    return (
        <div className='App'>
           
           <Router>
           <AuthContextProvider>
            <LoadTop/>
        <Routes>
                <Route exact path="/"  element={<Home/>} />
                    <Route path="/home" element={<Home/>} />
                    <Route path="/home-2" element={<HomeTwo/>} />
                    <Route path="/home-3" element={<HomeThree/>} />
                    <Route path="/home-4" element={<HomeFour/>} />
                    <Route path="/home-5" element={<HomeFive/>} />
                    <Route path="/home-6" element={<HomeSix/>} />
                    <Route path="/home-7" element={<HomeSeven/>} />
                    <Route path="/home-8" element={<HomeEight/>} />
                    <Route path="/home-9" element={<HomeNine/>} />
                    <Route path="/home-10" element={<HomeTen/>} />
                    <Route path="/home-11" element={<HomeEleven/>} />
                    <Route path="/home-12" element={<HomeTwelve/>} />
                    <Route path="/home-13" element={<HomeThirteen/>} />
                    <Route path="/home-14" element={<HomeFourteen/>} />
                    <Route path="/home-15" element={<HomeFifteen/>} />
                    <Route path="/about" element={<About/>} />
                    <Route path="/about-2" element={<AboutTwo/>} />
                    
                    <Route path="/course-2" element={<CourseTwo/>} />
                   
                    <Route path="/course-4" element={<CourseFour/>} />
                    <Route path="/course-5" element={<CourseFive/>} />
                    <Route path="/course-6" element={<CourseSix/>} />
                   
                    <Route path="/course-categories" element={<CourseCategoryPage/>} />
                    <Route path="/team" exact element={<Team/>} />
                    <Route path="/team-2" element={<TeamTwo/>} />
                    
                    
                    <Route path="/event-2" element={<EventTwo/>} />
                    
                    <Route path="/gallery" element={<Gallery/>} />
                    <Route path="/gallery-2" element={<GalleryTwo/>} />
                    <Route path="/gallery-3" element={<GalleryThree/>} />
                    <Route path="/shop" exact element={<Shop/>} />
                    <Route path="/shop/shop-single" element={<ShopSingle/>} />
                    <Route path="/shop/cart" element={<Cart/>} />
                    <Route path="/shop/checkout" element={<Checkout/>} />
                    <Route path="/shop/my-account" element={<MyAccount/>} />
                    <Route path="/faq" element={<Faq/>} />
                    <Route path="/login" element={<Login/>} />
                    <Route path="/register" element={<Register/>} />
                    <Route path="/blog" exact element={<Blog/>} />
                    <Route path="/blog/blog-left-sidebar" element={<BlogLeft/>} />
                    <Route path="/blog/blog-right-sidebar" element={<BlogRight/>} />
                    <Route path="/blog/single-post-left-sidebar" element={<SinglePostLeftSidebar/>} />
                    <Route path="/blog/single-post-right-sidebar" element={<SinglePostRightSidebar/>} />
                    <Route path="/blog/single-post-full-width" element={<SinglePostFullWidth/>} />
                    <Route path="/contact" element={<Contact/>} />
                    <Route path="/contact-2" element={<ContactTwo/>} />
                    <Route path="/contact-3" element={<ContactThree/>} />
                    <Route path="/contact-4" element={<ContactFour/>} />
                    <Route path="/404" element={<Error/>} />
                    <Route path="/admin/createns" element={<CreateEns/>} />
                    <Route path="/admin/createvt" element={<CreateEvt/>} />
                    <Route path="/admin/myevent" element={<Event/>} />
                    <Route path="/event" element={<EventThree/>} />
                    <Route path="/admin/createcours" element={<CreateCours/>} />
                    <Route path="/admin/mycours" element={<CourseThree/>} />
                    <Route path="/course" exact element={<CourseOne/>} />
                    <Route path="/admin/createchapitre/:id" exact element={<CreateChaCours/>} />
                    <Route path="/admin/createactivite/:id" exact element={<CreateActivite/>} />
                    <Route path="/course/course/:id" element={<CourseSingle/>} />
                    <Route path="/admin/createquestionq/:id" element={<CreateQuestionQuiz/>}/>
                    <Route path="/profile" element={<TeamSingle/>} />
                    <Route path="/cours/modifier/:id" element={<ModifierCours/>} />
                    <Route path="/event/modifier/:id" element={<ModifierEvent/>} />
                    
                </Routes>
                </AuthContextProvider>
                </Router>
        </div>
    );
}

export default App;
