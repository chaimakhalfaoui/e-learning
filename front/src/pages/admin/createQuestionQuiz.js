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

const API_URL = http://isetso-backend-lb-667158618.us-east-1.elb.amazonaws.com:8801/api;

const CreateQuestionQuiz = () => {
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

    // Styles identiques à CreateChaCours
    const styles = {
        buttonPrimary: {
            backgroundColor: '#ff5421',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
        },
        buttonEdit: {
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '13px',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
        },
        buttonDelete: {
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '13px',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = await idUser();
                const response = await axios.get(`${API_URL}/auth/checkUserRole/${userId}`);
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
                await axios.put(`${API_URL}/question/updateQuestion/${selectedQuestion.id}`, {
                    question: inputs.question,
                    rep1: inputs.rep1,
                    rep2: inputs.rep2,
                    rep3: inputs.rep3,
                    rep4: inputs.rep4,
                    repC: inputs.repC,
                    id_quiz: id,
                });
                toast.success('Question mise à jour avec succès');
            } else {
                await axios.post(`${API_URL}/question/createQuestion`, {
                    question: inputs.question,
                    rep1: inputs.rep1,
                    rep2: inputs.rep2,
                    rep3: inputs.rep3,
                    rep4: inputs.rep4,
                    repC: inputs.repC,
                    id_quiz: id,
                });
                toast.success('Question créée avec succès');
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
                toast.error('Une erreur inattendue s\'est produite');
            }
        }
    };

    const fetchQuiz = async () => {
        try {
            const response = await axios.get(`${API_URL}/quiz/getQuizId/${id}`);
            setQuiz(response.data[0]);
        } catch (error) {
            console.error("Erreur lors de la récupération des événements :", error);
        }
    };

    const fetchQuestion = async () => {
        try {
            const response = await axios.get(`${API_URL}/question/getQuestions/${id}`);
            setQuestions(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des questions :", error);
        }
    };

    const deleteQuestion = async (questionId) => {
        if (window.confirm("Voulez-vous vraiment supprimer cette question ?")) {
            try {
                await axios.delete(`${API_URL}/question/deleteQuestion/${questionId}`);
                fetchQuestion();
                toast.success('Question supprimée avec succès');
            } catch (error) {
                console.error("Erreur lors de la suppression de la question :", error);
                toast.error('Une erreur s\'est produite lors de la suppression');
            }
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
    
    const closmodel = () => {
        setOpenModal(false);
        setSelectedQuestion(null);
        setInputs({
            question: "",
            rep1: "",
            rep2: "",
            rep3: "",
            rep4: "",
            repC: ""
        });
        setIsUpdating(false);
    };

    return (
        <React.Fragment>
            <Helmet>
                <link rel="icon" href={favIcon} />
            </Helmet>
            <OffWrap />
            <Header
                parentMenu='cours'
                secondParentMenu='others'
                headerNormalLogo={Logo}
                headerStickyLogo={Logo}
                CanvasLogo={Logo}
                mobileNormalLogo={Logo}
                CanvasClass="right_menu_togle hidden-md"
                headerClass="full-width-header header-style1 home8-style4"
                TopBar='enable'
                TopBarClass="topbar-area home8-topbar"
                emailAddress='admin@isetso.rnu.tn'
                Location='Cité Erriadh - B.P 135'
            />
    
            <SiteBreadcrumb
                pageTitle="Séquence de Cours"
                pageName="Créer Quiz"
                breadcrumbsImg={bannerbg}
            />
    
            {!quiz ?
                <div className='ext-modal'>
                    <div className="col-3">
                        <div className="snippet" data-title="dot-spin">
                            <div className="stage">
                                <div className="dot-spin"></div>
                            </div>
                        </div>
                    </div>
                </div>
                :
                <div style={{marginBottom:"100px"}} className="register-section pt-100 pb-100 md-pt-80 md-pb-80">
                    <div className="container">
                        <div style={{width: "100%"}} className="col-lg-4 order-last">
                            <div className="notice-bord style1">
                                <div className='chap-f-b'>
                                    {quiz && <>
                                        <div>
                                            <h4 className="title">Quiz : <span style={{color:"black" , fontSize:"16px" , marginLeft:"10px"}}>{quiz.titre}</span></h4>
                                        </div>
                                    </>}
                                    <div className='chap-f-b'>
                                        <div className='ul-chap'>
                                            <ul>
                                                {questions && questions.map((question, index) => (
                                                    <li key={question.id}>
                                                        <div className='li-' style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                                                            <div className="d-flex align-items-center">
                                                                <div className="date me-3">
                                                                    <span>{index + 1}</span>
                                                                </div>
                                                                <div className="desc">{question.question}</div>
                                                            </div>
                                                            <div className='ul-img-chap' style={{display: "flex", gap: "8px"}}>
                                                                {/* Bouton Modifier - IDENTIQUE à CreateChaCours */}
                                                                <button 
                                                                    onClick={() => handleUpdate(question)}
                                                                    style={styles.buttonEdit}
                                                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#0069d9'}
                                                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
                                                                    title="Modifier"
                                                                >
                                                                    <i className="fas fa-edit"></i> 
                                                                </button>
                                                                {/* Bouton Supprimer - IDENTIQUE à CreateChaCours */}
                                                                <button 
                                                                    onClick={() => deleteQuestion(question.id)}
                                                                    style={styles.buttonDelete}
                                                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                                                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
                                                                    title="Supprimer"
                                                                >
                                                                    <i className="fas fa-trash"></i> 
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="form-group mb-0">
                                        <button 
                                            className="re-button" 
                                            onClick={() => {setOpenModal(true)}}
                                            style={styles.buttonPrimary}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#e03a00'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = '#ff5421'}
                                        >
                                            <i className="fas fa-plus"></i> Ajouter Question
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
    
                    <div style={{display : openModal ? "block" : "none"}} className='ext-modal'>
                        <div className='modal-act-add-cat'>
                            <button className='btn-fermer-modal' onClick={closmodel}>
                                <img width="24" height="24" src="https://img.icons8.com/quill/100/ff5421/x.png" alt="x"/>
                            </button>
                            <div className='titre-h2-modal'>
                                <h2>{isUpdating ? 'Modifier Question' : 'Ajouter Question'}</h2>
                            </div>
                            <div className='div-form-question'>
                                <form onSubmit={handleSubmit}>
                                    <div className="input-question">
                                        <input type="text" id="question" name="question" placeholder="question" value={inputs.question} onChange={handleInputChange} required />
                                    </div>
                                    <div className='input-question-quiz'>
                                        <div className="">
                                            <input type="text" id="rep1" name="rep1" placeholder="Réponse 1" value={inputs.rep1} onChange={handleInputChange} required />
                                        </div>
                                        <div className="">
                                            <input type="text" id="rep2" name="rep2" placeholder="Réponse 2" value={inputs.rep2} onChange={handleInputChange} required />
                                        </div>
                                        <div className="">
                                            <input type="text" id="rep3" name="rep3" placeholder="Réponse 3" value={inputs.rep3} onChange={handleInputChange} required />
                                        </div>
                                        <div className="">
                                            <input type="text" id="rep4" name="rep4" placeholder="Réponse 4" value={inputs.rep4} onChange={handleInputChange} required />
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
                                    <br></br>
                                    <button className='btn-question' style={{
                                    ...styles.buttonPrimary,
                                     display: 'block',
                                     margin: '0 auto',
                                     textAlign: 'center'
                                    }}>
                                    {isUpdating ? 'Modifier' : 'Ajouter'}
                                  </button>
                                </form>
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

export default CreateQuestionQuiz;