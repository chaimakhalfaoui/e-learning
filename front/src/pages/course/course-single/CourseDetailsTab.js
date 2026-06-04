import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/authContext'; 
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import FaqPart from './FaqPart';
import ReviewPart from './ReviewPart';
import OverviewPart from './OverviewPart';
import InstructorPart from './InstructorPart';
import CurriculumPart from './CurriculumPart';

const CourseDetailsTab = () => {
    const { id } = useParams();
    const [complete, setComplete] = useState(0);
    const [loading, setLoading] = useState(true);
    const { idUser } = useAuth();

    useEffect(() => {
        fetchDataC();
    }, [id]);

    const fetchDataC = async () => {
        setLoading(true);
        try {
            const userid = await idUser();
            if (!userid || userid === 0) {
                setComplete(0);
                setLoading(false);
                return;
            }
            
            const response = await axios.get(`http://isetso-alb-1947778921.us-east-1.elb.amazonaws.com/api/avc/avc/${id}/${userid}`);
            const progression = response.data?.avc || 0;
            setComplete(progression);
            
            console.log(`Progression du cours ${id}: ${progression}%`);
            
        } catch (error) {
            console.error('Error fetching AVC data:', error);
            setComplete(0);
        } finally {
            setLoading(false);
        }
    };

    // Vérifier si le quiz est débloqué (progression >= 80%)
    const isQuizUnlocked = complete >= 80;
    
    // Messages pour le quiz verrouillé
    const getQuizLockMessage = () => {
        const remaining = 80 - complete;
        if (remaining > 0) {
            return `🔒 Quiz verrouillé (${remaining}% restant pour débloquer)`;
        }
        return "🔒 Quiz verrouillé";
    };

    if (loading) {
        return (
            <div className="intro-info-tabs text-center p-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-2">Chargement des informations...</p>
            </div>
        );
    }

    return (
        <div className="intro-info-tabs">
            <Tabs>
                <TabList className="intro-tabs tabs-box">
                    <Tab>Résumé</Tab>
                    <Tab>Parcours</Tab>
                    <Tab>Enseignant</Tab>
                    <Tab disabled={!isQuizUnlocked}>
                        Quiz
                        {!isQuizUnlocked && (
                            <img 
                                style={{ marginLeft: "10px" }} 
                                width="16" 
                                height="16" 
                                src="https://img.icons8.com/ios-glyphs/30/1A1A1A/lock--v1.png" 
                                alt="lock" 
                            />
                        )}
                    </Tab>
                </TabList>

                {/* Panel Résumé */}
                <TabPanel>
                    <OverviewPart />
                </TabPanel>

                {/* Panel Parcours */}
                <TabPanel>
                    <CurriculumPart />
                </TabPanel>

                {/* Panel Enseignant */}
                <TabPanel>
                    <InstructorPart />
                </TabPanel>

                {/* Panel Quiz - Conditionnel selon progression */}
                {isQuizUnlocked ? (
                    <TabPanel>
                        <FaqPart />
                    </TabPanel>
                ) : (
                    <TabPanel>
                        <div className="text-center p-5 bg-light rounded">
                            <i className="fas fa-lock fa-3x mb-3" style={{ color: '#ff5421' }}></i>
                            <h4>Quiz verrouillé</h4>
                            <p className="text-muted">
                                Vous devez compléter au moins 80% du cours pour accéder au quiz.
                            </p>
                            <div className="progress mb-3" style={{ height: '10px' }}>
                                <div 
                                    className="progress-bar" 
                                    style={{ 
                                        width: `${complete}%`, 
                                        backgroundColor: '#ff5421' 
                                    }}
                                />
                            </div>
                            <p className="small">
                                Progression actuelle : <strong>{complete}%</strong>
                                <br />
                                Encore <strong>{80 - complete}%</strong> à compléter
                            </p>
                            <Link to={`/course/course/${id}`} className="btn btn-primary mt-2">
                                <i className="fas fa-play-circle me-2"></i>
                                Continuer le cours
                            </Link>
                        </div>
                    </TabPanel>
                )}
            </Tabs>
        </div>
    );
};

export default CourseDetailsTab;