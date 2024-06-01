import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../context/authContext';
import jsPDF from 'jspdf';
import '../../../assets/scss/modal.scss';

const FaqPart = () => {
    const { idUser } = useAuth();
    const { id } = useParams();
    const [quiz, setQuiz] = useState([]);
    const [numberQ, setNumberQ] = useState(1);
    const [question, setQuestion] = useState({});
    const [countdown, setCountdown] = useState(null);
    const [coun, setCoun] = useState(null);
    const [timerExpired, setTimerExpired] = useState(false);
    const [selectedResponse, setSelectedResponse] = useState("?");
    const [score, setScore] = useState(null);
    const [idQuiz, setIdQuiz] = useState(null);
    const [certificateAvailable, setCertificateAvailable] = useState(false); 

    const fetchQuiz = async () => {
        const userid = await idUser();
        try {
            const response = await axios.get(`http://localhost:8801/api/quiz/getQuiz/${id}`);
            setQuiz(response.data);
            if(!countdown ){
                setCountdown(response.data[0].duree)
                setCoun(response.data[0].duree)
                
            }
            setIdQuiz(response.data[0].id);
            const idq = response.data[0].id;
            try {
                const response = await axios.get(`http://localhost:8801/api/repense/fetchFirstFalseResponseQuestion/${idq}/${userid}`);
                if (response.data !== 0) {
                    setQuestion(response.data);
                    console.log(response.data)
                } else {
                    try {
                        const response = await axios.get(`http://localhost:8801/api/repense/getQuizScore/${idq}/${userid}`);
                        setScore(response.data);
                        setCountdown(null)
                        if (response.data) {
                            setCertificateAvailable(true);
                        }
                    } catch (error) {
                        console.error("Erreur lors de la récupération du score du quiz :", error);
                    }
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des questions du quiz :", error);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du quiz :", error);
        }
    };

    const deleteResponses = async () => {
        const userid = await idUser();
        try {
            await axios.delete(`http://localhost:8801/api/repense/deleteResponsesByQuizAndUser/${idQuiz}/${userid}`);
            setScore(null);
            setCertificateAvailable(false); 
            setNumberQ(1);
            fetchQuiz();
            setCountdown(coun)
        } catch (error) {
            console.error("Erreur lors de la suppression des réponses :", error);
        }
    };

    useEffect(() => {
        fetchQuiz();
        if(countdown===0){
            
            return
        }
        const interval = setInterval(() => {
            setCountdown((prevCountdown) => prevCountdown - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const markAllResponsesAsFalse = async () => {
        try {
            const userid = await idUser(); // Utilisez await pour récupérer l'ID de l'utilisateur
            console.log("User ID:", userid);
            
            // Récupérer toutes les questions du quiz
            const quizResponse = await axios.get(`http://localhost:8801/api/quiz/getQuiz/${id}`);
            const idq = quizResponse.data[0].id;
            console.log("Quiz ID:", idq);
            
            // Récupérer la première question sans réponse de l'utilisateur
            const firstFalseResponse = await axios.post(`http://localhost:8801/api/repense/create-false/${idq}/${userid}`);
            
            
            console.log("All responses updated as false");
    
            fetchQuiz();
        } catch (error) {
            console.error("Erreur lors de la mise à jour des réponses :", error);
        }
    };
    
    useEffect(() => {
        if (countdown === 0) {
            markAllResponsesAsFalse();
        }
    }, [countdown]);

    const handleResponseClick = (response) => {
        setSelectedResponse(response);
    };

    const saveResponse = async (e) => {
        e.preventDefault();
        const userid = await idUser();
        
        try {
            await axios.post('http://localhost:8801/api/repense/createRepense', {
                resultat: selectedResponse,
                idquestion: question.id,
                idUser: userid
            });
            fetchQuiz();
            setNumberQ(numberQ + 1);
            setSelectedResponse("?");
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de la réponse :", error);
        }
    };

    const createCertificate = async () => {
        const userid = await idUser();
        const formattedScore = parseFloat(score.scorePercentage.toFixed(2));
        try {
            await axios.post('http://localhost:8801/api/certaficat/createCertificate', {
                idCours: id, 
                idUser: userid,
                note: formattedScore 
            });
            exportCertificate();
            setCertificateAvailable(true); 
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data === "Un certificat existe déjà pour cette combinaison d'ID de cours et d'ID d'utilisateur.") {
                // Gérer le cas où le statut de la réponse est 400
                console.error("Un certificat existe déjà pour cette combinaison d'ID de cours et d'ID d'utilisateur.");
                setCertificateAvailable(true); 
                // Traitez cette erreur de manière appropriée, par exemple en affichant un message à l'utilisateur
            } else {
                // Gérer les autres erreurs
                console.error("Erreur lors de la création du certificat :", error);
            }
        }
    };

    const exportCertificate = async () => {
        const userid = await idUser();
        try {
            const response = await axios.get(`http://localhost:8801/api/certaficat/getCertificateByIds/${id}/${userid}`);
            const certificateData = response.data;
    
            const doc = new jsPDF();
            const marginLeft = 15;
            const marginTop = 15;
            const lineHeight = 10;
    
            doc.setFontSize(12);
            doc.text(`ID du certificat: ${certificateData.id}`, marginLeft, marginTop);
            doc.text(`Titre du cours: ${certificateData.titreCours}`, marginLeft, marginTop + lineHeight);
            doc.text(`Type du cours: ${certificateData.typeCours}`, marginLeft, marginTop + 2 * lineHeight);
            doc.text(`Nom de l'utilisateur: ${certificateData.username}`, marginLeft, marginTop + 4 * lineHeight);
            doc.text(`Note: ${certificateData.note}%`, marginLeft, marginTop + 5 * lineHeight);
    
            // Styling the text
    
            // Adding a border
            doc.rect(10, 10, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 20, 'S');
    
            // Saving the document
            doc.save('certificat.pdf');
        } catch (error) {
            console.error("Erreur lors de l'export du certificat :", error);
        }
    };

    return (
        <div className="content">
            {timerExpired && question && Object.keys(question).length !== 0 && !score ? (
                <div>
                    <p>Temps écoulé!</p>
                </div>
            ) : score ? (
                <div className='fl'>
                    {score.scorePercentage > 70 ? (
                        <div className='btn-cer'>
                            <div className='Felicitations'>
                                <h5>Score final : {score.scorePercentage}%</h5>
                                <h4>Correct Responses : {score.correctResponses}</h4>
                                <p>Félicitations! Vous avez réussi le quiz avec un score supérieur à 70%.</p>
                            </div>
                            <div style={{display:"flex"}} >
                                <button onClick={deleteResponses}>Répéter le quiz</button>
                                
                                    <button onClick={createCertificate}>Créer le certificat</button>
                              
                            </div>
                            
                        </div>
                    ) : (
                        <div className='btn-rq'>
                            <div className='Desole'>
                                <h5>Score final : <span>{score.scorePercentage}% </span></h5>
                                <h4>Correct Responses : <span>{score.correctResponses}</span></h4>
                                <p>Désolé, vous n'avez pas réussi le quiz. Essayez à nouveau!</p>
                            </div>
                            <button onClick={deleteResponses}>Répéter le quiz</button>
                        </div>
                    )}
                </div>
            ) : question && Object.keys(question).length !== 0 ? (
                <div>
                    <div className='n-t-question-quiz'>
                        <div className='number-question-quiz'>
                            <p>Question : {numberQ}</p>
                        </div>
                        <div className='time-question-quiz'>
                            <div className='chrono-quiz'>{Math.floor(countdown / 60)}:{countdown % 60 < 10 ? '0' : ''}{countdown % 60}</div>
                        </div>
                    </div>

                    <div className='div-form-question'>
                        <form>
                            <div className='question-'>
                                <p>{question.question}</p>
                            </div>
                            <div className='repense-'>
                                <div className={selectedResponse === question.reponse1 ? 'active' : ''} onClick={() => handleResponseClick(question.reponse1)}>{question.reponse1}</div>
                                <div className={selectedResponse === question.reponse2 ? 'active' : ''} onClick={() => handleResponseClick(question.reponse2)}>{question.reponse2}</div>
                                <div className={selectedResponse === question.reponse3 ? 'active' : ''} onClick={() => handleResponseClick(question.reponse3)}>{question.reponse3}</div>
                                <div className={selectedResponse === question.reponse4 ? 'active' : ''} onClick={() => handleResponseClick(question.reponse4)}>{question.reponse4}</div>
                            </div>
                            <div className='btn-next-question'>
                                <button onClick={saveResponse}>Prochaine question</button>
                            </div>
                        </form>
                    </div>
                </div>
            ):(
                <div>
                    <h5 style={{textAlign:"center",marginTop:"25%"}}>pas de quiz</h5>
                </div>
            )
            }
        </div>
    );
};

export default FaqPart;