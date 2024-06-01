import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import Newsletter from '../../components/Common/Newsletter';
import ScrollToTop from '../../components/Common/ScrollTop';
import OffWrap from '../../components/Layout/Header/OffWrap';
import SiteBreadcrumb from '../../components/Common/Breadcumb';
import SearchModal from '../../components/Layout/Header/SearchModal';
import { useAuth } from '../../context/authContext';
import favIcon from '../../assets/img/fav-orange.png';
import Logo from '../../assets/img/logo/dark-logo.png';
import footerLogo from '../../assets/img/logo/lite-logo.png';
import bannerbg from '../../assets/img/breadcrumbs/inner7.jpg';

const CreateChaCours = () => {
    const [openModal, setOpenModal] = useState(false);
    const [questions, setQuestions] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const { id } = useParams();
    const { idUser } = useAuth();
    const [inputs, setInputs] = useState({
        question: "",
        rep1: "",
        rep2: "",
        rep3: "",
        rep4: "",
        repC: "",
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = await idUser();
                const response = await axios.get(`http://localhost:8801/api/auth/checkUserRole/${userId}`);
                const userRole = response.data.role;

                if (userRole !== 'enseignant') {
                    navigate('/404');
                }
            } catch (error) {
                console.error("Erreur lors de la récupération du rôle de l'utilisateur :", error);
            }
        };

        fetchUserData();
    }, [idUser, navigate]);

    const handleInputChange = (e) => {
        setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isUpdating) {
                await axios.put(`http://localhost:8801/api/question/updateQuestion/${selectedQuestion.id}`, {
                    question: inputs.question,
                    rep1: inputs.rep1,
                    rep2: inputs.rep2,
                    rep3: inputs.rep3,
                    rep4: inputs.rep4,
                    repC: inputs.repC,
                    id_quiz: id,
                });
                toast.success('Question mise à jour avec succès', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            } else {
                await axios.post("http://localhost:8801/api/question/createQuestion", {
                    question: inputs.question,
                    rep1: inputs.rep1,
                    rep2: inputs.rep2,
                    rep3: inputs.rep3,
                    rep4: inputs.rep4,
                    repC: inputs.repC,
                    id_quiz: id,
                });
                toast.success('Question créée avec succès', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
            fetchQuestion();
            setInputs({
                question: "",
                rep1: "",
                rep2: "",
                rep3: "",
                rep4: "",
                repC: ""
            });
            setOpenModal(false);
        } catch (err) {
            if (err.response && err.response.data) {
                toast.error(err.response.data);
            } else {
                toast.error('Une erreur inattendue s\'est produite lors de la création de la question');
            }
        }
    };

    const fetchQuiz = async () => {
        try {
            const response = await axios.get(`http://localhost:8801/api/quiz/getQuizId/${id}`);
            setQuiz(response.data[0]);
        } catch (error) {
            console.error("Erreur lors de la récupération des événements :", error);
        }
    };

    const fetchQuestion = async () => {
        try {
            const response = await axios.get(`http://localhost:8801/api/question/getQuestions/${id}`);
            setQuestions(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des questions :", error);
        }
    };

    const deleteQuestion = async (questionId) => {
        try {
            await axios.delete(`http://localhost:8801/api/question/deleteQuestion/${questionId}`);
            fetchQuestion();
            toast.success('Question supprimée avec succès', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } catch (error) {
            console.error("Erreur lors de la suppression de la question :", error);
            toast.error('Une erreur s\'est produite lors de la suppression de la question');
        }
        };
        const handleUpdate = (question) => {
            setSelectedQuestion(question);
            setInputs({
                question: question.question,
                rep1: question.reponse1,
                rep2: question.reponse2,
                rep3: question.reponse3,
                rep4: question.reponse4,
                repC: question.reponse_correcte
            });
            setIsUpdating(true);
            setOpenModal(true);
        };
        
        useEffect(() => {
            fetchQuiz();
            fetchQuestion();
        }, [id]);
        const closmodel=()=>{
            setOpenModal(false)
            setSelectedQuestion(null);
            setInputs({
                question: "",
                rep1:"",
                rep2: "",
                rep3:"",
                rep4:"",
                repC:""
            });
            setIsUpdating(false);
        }
        return (
            <React.Fragment>
                <Helmet>
                    <link rel="icon" href={favIcon} />
                </Helmet>
                <OffWrap />
                <Header
                    parentMenu='course'
                    secondParentMenu='others'
                    headerNormalLogo={Logo}
                    headerStickyLogo={Logo}
                    CanvasLogo={Logo}
                    mobileNormalLogo={Logo}
                    CanvasClass="right_menu_togle hidden-md"
                    headerClass="full-width-header header-style1 home8-style4"
                    TopBar='enable'
                    TopBarClass="topbar-area home8-topbar"
                    emailAddress='support@website.com'
                    Location='374 William S Canning Blvd, MA 2721, USA '
                />
        
                <SiteBreadcrumb
                    pageTitle=" Chapitre"
                    pageName="Create Chapitre"
                    breadcrumbsImg={bannerbg}
                />
        
                { !quiz  ?
                    <div  className='ext-modal'>
                        <div class="col-3">
                            <div class="snippet" data-title="dot-spin">
                                <div class="stage">
                                    <div class="dot-spin"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    :
                    <div style={{marginBottom:"100px"}} className="register-section pt-100 pb-100 md-pt-80 md-pb-80">
                        <div className="container">
                            <div style={{width: "100%"}} class="col-lg-4 order-last">
                                <div class="notice-bord style1">
                                    <div className='chap-f-b'>
                                    {quiz && <>
                                        <div>
                                            <h4 class="title">Quiz  : <span style={{color:"black" , fontSize:"16px" , marginLeft:"10px"}}>{quiz.titre}</span></h4>
                                        </div>
                                    </>}
                                    <div className='chap-f-b'>
        
                                    <div className='ul-chap'>
                                        <ul>
                                        {questions && questions.map((question, index) => (
                                            <li key={question.id}>
                                                <div className='li-' style={{display:"flex"}}>
                                                    <div class="date">
                                                        <span>{index +1}</span>
                                                    </div>
                                                    <div class="desc">{question.question}</div>
                                                    <div className='ul-img-chap'>
                                                        <button onClick={() => handleUpdate(question)}>
                                                            <img width="20" height="20" src="https://img.icons8.com/pastel-glyph/64/1A1A1A/create-new--v2.png" alt="create-new--v2"/>
                                                        </button>
                                                        <button onClick={() => deleteQuestion(question.id)}>
                                                            <img width="20" height="20" src="https://img.icons8.com/wired/64/f00000/filled-trash.png" alt="filled-trash"/>
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                            ))}
                                        </ul>
                                    </div>
                                    </div>
                                    <div class="form-group mb-0">
                                        <button class="re-button" onClick={()=>{setOpenModal(true)}} >Ajouter Question</button>
                                    </div>
                                </div>
                            </div>
                        </div>
        
                        <div style={{display : openModal ? "block" : "none"}} className='ext-modal'>
                            <div className='modal-act-add-cat'>
                                <button className='btn-fermer-modal' onClick={closmodel} >
                                    <img width="24" height="24" src="https://img.icons8.com/quill/100/ff5421/x.png" alt="x"/>
                                </button>
                                <div className='titre-h2-modal'>
                                    <h2>{isUpdating ? 'Modifier Question' : 'Ajouter Question'}</h2>
                                </div>
                                <div className='div-form-question'>
                                    <form onSubmit={handleSubmit} id="" >
                                        <div className="input-question">
                                            <input type="text" id="question" name="question"  placeholder="question" value={inputs.question} onChange={handleInputChange}  required />
                                        </div>
                                        <div className='input-question-quiz'>
                                            <div className="">
                                                <input type="text" id="rep1" name="rep1"  placeholder="Réponse 1" value={inputs.rep1} onChange={handleInputChange}  required />
                                            </div>
                                            <div className="">
                                                <input type="text" id="rep2" name="rep2"  placeholder="Réponse 2" value={inputs.rep2} onChange={handleInputChange}  required />
                                            </div>
                                            <div className="">
                                                <input type="text" id="rep3" name="rep3" placeholder="Réponse 3" value={inputs.rep3} onChange={handleInputChange} required />
                                            </div>
                                            <div className="">
                                                <input type="text" id="rep4" name="rep4"  placeholder="Réponse 4" value={inputs.rep4} onChange={handleInputChange}  required />
                                            </div>
                                            <div className="">
                                                <select value={inputs.repC} onChange={handleInputChange} name="repC" required>
                                                    <option value="">Sélectionner la réponse correcte</option>
                                                    <option value={inputs.rep1}>{inputs.rep1}</option>
                                                    <option value={inputs.rep2}>{inputs.rep2}</option>
                                                    <option value={inputs.rep3}>{inputs.rep3}</option>
                                                    <option value={inputs.rep4}>{inputs.rep4}</option>
                                                </select>
                                            </div>
                                            </div>
                                            <button className='btn-question'>{isUpdating ? 'Modifier' : 'Ajouter'}</button>
                                            
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
        }

        <Newsletter
            sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-80"
            titleClass="title mb-0 white-color"
        />

        <Footer
            footerClass="rs-footer home9-style main-home"
            footerLogo={footerLogo}
        />

        <ScrollToTop
            scrollClassName="scrollup orange-color"
        />

        <SearchModal />
        <ToastContainer />
    </React.Fragment>
);
}

export default CreateChaCours;