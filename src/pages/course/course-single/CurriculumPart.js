import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link,useParams } from 'react-router-dom';
import ModalVideo from 'react-modal-video';
import '../../../assets/scss/modal.scss';
import { useAuth } from '../../../context/authContext'; 

import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemPanel,
    AccordionItemButton,
} from 'react-accessible-accordion';


const CurriculumPart = () => {
    const { idUser } = useAuth();
    const { id } = useParams();
    const [course, setCourse] = useState([]);
    const [chapitre, setChapitre] = useState([]);
    const [quiz,setQuiz]=useState([]);
    

    

    const [openIndex, setOpenIndex] = useState(null); // État pour suivre l'index de l'activité ouverte
    const [openIndexc, setOpenIndexc] = useState(null);

    const toggleActivite = (index) => {
        setOpenIndex(openIndex === index ? null : index); // Ouvre ou ferme l'activité en fonction de son index
    };

    useEffect(() => {
        fetchQuiz();
        fetchCourse();
        getChapitreAndActivite();
        
    }, [id]);

    
    

    const fetchCourse = async () => {
        try {
            const response = await axios.get(`http://localhost:8801/api/cours/getCourse/${id}`);
            setCourse(response.data[0]);
            
        } catch (error) {
            console.error("Erreur lors de la récupération des événements :", error);
        }
    };
    const getChapitreAndActivite= async ()=>{
        try {
            const response = await axios.get(`http://localhost:8801/api/chapitre/getChapitreAndActivite/${id}`);
            setChapitre(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des événements :", error);
        }
    }
    const fetchQuiz = async () => {
       
        try {
            const response = await axios.get(`http://localhost:8801/api/quiz/getQuiz/${id}`);
            setQuiz(response.data);
            
        } catch (error) {
            console.error("Erreur lors de la récupération des quiz :", error);
        }
    };

    const toggleChapitre = (index) => {
        
        setOpenIndexc(openIndexc === index ? null : index); 
        
    };

    
    const submitavc = async (nChapN)=>{
        
        console.log(nChapN)
        const userid = await idUser();
        let nch =nChapN;
        if(nChapN===0){
            nch =nChapN.toString();
        }
        console.log(nch)
        try {
            await axios.post("http://localhost:8801/api/avc/createOrUpdateAvc", {
                idCours : id,
                iduser:userid,
                chapN: nch
            });
            
                }
                
                catch (err) {
                
                    console.error('Une erreur inattendue s\'est produite lors de la création de l\'événement.');
            
            }
    }
    const ac =(index)=>{
        toggleChapitre(index);
        submitavc(index);
    }
    return (
        <div className="content">
            {chapitre && chapitre.map((chapitre, index) => (
            <Accordion key={chapitre.id_chapitre}
            preExpanded={openIndexc === index ? [chapitre.id_chapitre.toString()] : []}  className="accordion-box" >
                <AccordionItem className="accordion-item" uuid={chapitre.id_chapitre}>
                    <AccordionItemHeading >
                        <AccordionItemButton onClick={() => {ac(index)}}>
                            <button onClick={() => {ac(index)}}>{chapitre.nom_chapitre}</button>
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel className="card-body acc-content current">
                    {chapitre.activites && chapitre.activites.map((activite, index) => (
                        <div className="content">
                            <div className="clearfix">
        
                                <div className="pull-left">
                                    <button className="popup-videos play-icon" onClick={() => toggleActivite(index)}><i className="fa fa-play"></i>{activite.titre}</button>
                                </div>
                                <div className="pull-right">
                                    <div className="minutes">{activite.duration} Minutes</div>
                                </div>

                                {openIndex === index && (
                                            <div className='sous-activite'>
                                                {activite.categorie && activite.categorie === "text" ?
                                                    <div className='modal-activite-text-aff'>
                                                        <p>{activite.contenu}</p>
                                                    </div>
                                                    : activite.categorie === "image" ?
                                                        <div className='ext-modal'>
                                                            <button className='btn-fermer-modal' onClick={()=>toggleActivite(null)} >
                                                                <img width="24" height="24" src="https://img.icons8.com/quill/100/ff5421/x.png" alt="x"/> 
                                                            </button>
                                                            <div className='img-modal-ext'>
                                                                <img src={`http://localhost:8801/api/image/${activite.contenu}`} alt="image" />
                                                            </div>
                                                        </div>
                                                        : activite.categorie === "video" ?
                                                            <div className='ext-modal'>
                                                                <button className='btn-fermer-modal' onClick={()=>toggleActivite(null)} >
                                                                    <img width="24" height="24" src="https://img.icons8.com/quill/100/ff5421/x.png" alt="x"/> 
                                                                </button>
                                                                <div className='img-modal-ext'>
                                                                <video controls>
                                                                    <source src={`http://localhost:8801/api/video/${activite.contenu}`} type="video/mp4" />
                                                                    Your browser does not support the video tag.
                                                                </video>
                                                                </div>
                                                            </div>
                                                            : ""
                                                }
                                            </div>
                                        )}
                                    
                            </div>
                        </div>
                         ))}    
                    </AccordionItemPanel>
                </AccordionItem>
                
            </Accordion>   
             ))}           
                   
                 
        </div>
    );
}

export default CurriculumPart;