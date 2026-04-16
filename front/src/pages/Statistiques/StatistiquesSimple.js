// src/pages/Statistiques/StatistiquesSimple.js
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { useAuth } from '../../context/authContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// Composants
import OffWrap from '../../components/Layout/Header/OffWrap';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import SearchModal from '../../components/Layout/Header/SearchModal';
import Newsletter from '../../components/Common/Newsletter';
import SiteBreadcrumb from '../../components/Common/Breadcumb';

// Images
const favIcon = require('../../assets/img/fav-orange.png');
const Logo = require('../../assets/img/logo/dark-logo.png');
const footerLogo = require('../../assets/img/logo/lite-logo.png');
const bannerbg = require('../../assets/img/breadcrumbs/2.jpg');

ChartJS.register(
    ArcElement, Tooltip, Legend, CategoryScale,
    LinearScale, BarElement, Title, PointElement, LineElement, Filler
);

const StatistiquesSimple = () => {
    const { role } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [eventsByDate, setEventsByDate] = useState([]);
    const [stats, setStats] = useState({
        users: { total: 0, etudiants: 0, enseignants: 0, coordinateurs: 0, admins: 0 },
        courses: { total: 0, published: 0, hidden: 0 },
        categories: { total: 0 },
        coursParCategorie: [],
        inscriptionsParMois: []
    });

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const userRole = await role();
                if (userRole !== 'admin' && userRole !== 'coordinateur') {
                    navigate('/404');
                }
            } catch (error) {
                navigate('/404');
            }
        };
        checkAccess();
    }, [role, navigate]);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const [statsRes, monthlyRes, categoriesRes, eventsRes] = await Promise.all([
                    axios.get("http://localhost:8801/api/auth/getStatistics").catch(() => ({ data: null })),
                    axios.get("http://localhost:8801/api/auth/monthlyInscriptions").catch(() => ({ data: [] })),
                    axios.get("http://localhost:8801/api/auth/coursParCategorie").catch(() => ({ data: [] })),
                    axios.get("http://localhost:8801/api/event/getAllEvents").catch(() => ({ data: [] }))
                ]);
                
                const usersData = statsRes.data?.users || { 
                    total: 0, etudiants: 0, enseignants: 0, coordinateurs: 0, admins: 0 
                };
                
                const coursesData = statsRes.data?.courses || { 
                    total: 0, published: 0, hidden: 0 
                };
                
                const categoriesData = statsRes.data?.categories || { total: 0 };
                const coursParCategorie = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
                const inscriptionsParMois = Array.isArray(monthlyRes.data) ? monthlyRes.data : [];
                const eventsData = Array.isArray(eventsRes.data) ? eventsRes.data : [];
                
                setStats({
                    users: usersData,
                    courses: coursesData,
                    categories: categoriesData,
                    coursParCategorie: coursParCategorie,
                    inscriptionsParMois: inscriptionsParMois
                });
                
                setEvents(eventsData);
                
            } catch (error) {
                console.error("Erreur stats:", error);
                toast.error("Erreur lors du chargement des statistiques");
            } finally {
                setLoading(false);
            }
        };
        
        fetchStats();
    }, []);

    // Filtrer les événements par date sélectionnée
    useEffect(() => {
        if (events.length > 0 && selectedDate) {
            const filtered = events.filter(event => {
                const eventDate = new Date(event.datedebut);
                return eventDate.toDateString() === selectedDate.toDateString();
            });
            setEventsByDate(filtered);
        }
    }, [selectedDate, events]);

    // Marquer les dates avec événements sur le calendrier
    const getEventDates = () => {
        return events.map(event => new Date(event.datedebut));
    };

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const eventDates = getEventDates();
            if (eventDates.some(eventDate => eventDate.toDateString() === date.toDateString())) {
                return 'event-date';
            }
        }
        return null;
    };

    const pieChartData = {
        labels: ['Étudiants', 'Enseignants', 'Coordinateurs', 'Administrateurs'],
        datasets: [{
            data: [
                stats.users.etudiants || 0, 
                stats.users.enseignants || 0, 
                stats.users.coordinateurs || 0, 
                stats.users.admins || 0
            ],
            backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384', '#4BC0C0'],
            borderWidth: 0
        }]
    };

    const barChartData = {
        labels: stats.coursParCategorie.length > 0 
            ? stats.coursParCategorie.map(c => c.nom || 'Catégorie')
            : ['Aucune donnée'],
        datasets: [{
            label: 'Nombre de cours',
            data: stats.coursParCategorie.length > 0 
                ? stats.coursParCategorie.map(c => c.count || 0)
                : [0],
            backgroundColor: '#ff5421',
            borderRadius: 5
        }]
    };

    const lineChartData = {
        labels: stats.inscriptionsParMois.length > 0 
            ? stats.inscriptionsParMois.map(m => m.mois || '')
            : ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        datasets: [{
            label: 'Inscriptions mensuelles',
            data: stats.inscriptionsParMois.length > 0 
                ? stats.inscriptionsParMois.map(m => m.count || 0)
                : [0, 0, 0, 0, 0, 0],
            borderColor: '#ff5421',
            backgroundColor: 'rgba(255, 84, 33, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#ff5421',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { position: 'bottom' },
            tooltip: { enabled: true }
        }
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { position: 'top' },
            tooltip: { enabled: true }
        },
        scales: {
            y: { 
                beginAtZero: true, 
                ticks: { stepSize: 1 },
                title: { display: true, text: 'Nombre de cours' }
            }
        }
    };

    // Styles pour le calendrier
    const calendarStyle = {
        width: '100%',
        border: 'none',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        padding: '10px'
    };

    const eventCardStyle = {
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '10px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease'
    };

    if (loading) {
        return (
            <React.Fragment>
                <OffWrap />
                <Header
                    parentMenu='Statistiques'
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
                <div className="container pt-100 pb-100 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="mt-3">Chargement des statistiques...</p>
                </div>
                <Footer footerClass="rs-footer home9-style main-home" footerLogo={footerLogo} />
                <SearchModal />
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            <Helmet>
                <link rel="icon" href={favIcon} />
                <title>Statistiques | ISETSO</title>
            </Helmet>
            <OffWrap />
            <Header
                parentMenu='Statistiques'
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
                pageTitle="Tableau de Bord"
                pageName="Statistiques"
                breadcrumbsImg={bannerbg}
            />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                
                {/* Cartes */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '20px', 
                    marginBottom: '30px' 
                }}>
                    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', borderRadius: '10px', color: 'white', textAlign: 'center' }}>
                        <div style={{ fontSize: '40px' }}>👥</div>
                          <br></br>
                        <h2>{stats.users.total}</h2>
                        <p>Utilisateurs Totaux</p>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '20px', borderRadius: '10px', color: 'white', textAlign: 'center' }}>
                        <div style={{ fontSize: '40px' }}>🎓</div>
                          <br></br>
                        <h2>{stats.users.etudiants}</h2>
                        <p>Étudiants</p>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', padding: '20px', borderRadius: '10px', color: 'white', textAlign: 'center' }}>
                        <div style={{ fontSize: '40px' }}>👨‍🏫</div>
                        <br></br>
                        <h2>{stats.users.enseignants}</h2>
                        <p>Enseignants</p>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', padding: '20px', borderRadius: '10px', color: 'white', textAlign: 'center' }}>
                        <div style={{ fontSize: '40px' }}>📚</div>
                          <br></br>
                        <h2>{stats.courses.total}</h2>
                        <p>Cours Totaux</p>
                    </div>
                </div>

    

                {/* Calendrier et Événements */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                    gap: '30px', 
                    marginBottom: '30px' 
                }}>
                    {/* Calendrier */}
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
                            📅 Calendrier des Événements
                        </h3>
                        <style>
                            {`
                                .event-date {
                                    background-color: #ff5421 !important;
                                    color: white !important;
                                    border-radius: 50% !important;
                                }
                                .react-calendar__tile {
                                    padding: 10px !important;
                                }
                                .react-calendar__tile--active {
                                    background-color: #ff5421 !important;
                                }
                            `}
                        </style>
                        <Calendar
                            onChange={setSelectedDate}
                            value={selectedDate}
                            tileClassName={tileClassName}
                            style={calendarStyle}
                        />
                        <p style={{ textAlign: 'center', marginTop: '15px', color: '#666' }}>
                            📌 Les dates en <span style={{ color: '#ff5421' }}>orange</span> indiquent des événements
                        </p>
                    </div>

                    {/* Liste des événements du jour sélectionné */}
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
                            📋 Événements du {selectedDate.toLocaleDateString('fr-FR')}
                        </h3>
                        {eventsByDate.length > 0 ? (
                            eventsByDate.map(event => (
                                <div 
                                    key={event.id} 
                                    style={eventCardStyle}
                                    onClick={() => navigate(`/event/${event.id}`)}
                                >
                                    <h4 style={{ margin: '0 0 10px 0', color: '#ff5421' }}>{event.titre}</h4>
                                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                                        <strong>📍 Lieu:</strong> {event.ville}
                                    </p>
                                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                                        <strong>🏷️ Catégorie:</strong> {event.categorie}
                                    </p>
                                    {event.description && (
                                        <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#999' }}>
                                            {event.description.substring(0, 100)}...
                                        </p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                <i className="fas fa-calendar-times" style={{ fontSize: '48px', marginBottom: '15px', display: 'block' }}></i>
                                <p>Aucun événement prévu à cette date</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Statistiques des événements */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '20px', 
                    marginBottom: '30px' 
                }}>
                    <div style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', padding: '20px', borderRadius: '10px', color: 'white', textAlign: 'center' }}>
                        <div style={{ fontSize: '40px' }}>📅</div>
                          <br></br>
                        <h2>{events.length}</h2>
                        <p>Total Événements</p>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)', padding: '20px', borderRadius: '10px', color: 'white', textAlign: 'center' }}>
                        <div style={{ fontSize: '40px' }}>📊</div>
                          <br></br>
                        <h2>{stats.courses.total}</h2>
                        <p>Formations Disponibles</p>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)', padding: '20px', borderRadius: '10px', color: 'white', textAlign: 'center' }}>
                        <div style={{ fontSize: '40px' }}>👨‍🎓</div>
                          <br></br>
                        <h2>{stats.users.etudiants}</h2>
                        <p>Apprenants Actifs</p>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #fdcb6e 0%, #f39c12 100%)', padding: '20px', borderRadius: '10px', color: 'white', textAlign: 'center' }}>
                        <div style={{ fontSize: '40px' }}>🏆</div>
                          <br></br>
                        <h2>{stats.courses.published}</h2>
                        <p>Cours Certifiants</p>
                    </div>
                </div>

                {/* Résumé */}
                <div style={{ 
                    backgroundColor: '#e8f4f8', 
                    border: '1px solid #b8e0f0', 
                    borderRadius: '10px', 
                    padding: '15px', 
                    textAlign: 'center' 
                }}>
                    <strong>📊 Résumé :</strong> {stats.users?.total || 0} utilisateurs, {stats.courses?.total || 0} cours, {stats.categories?.total || 0} catégories, {events.length} événements
                </div>
            </div>

            <Newsletter
                sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-70"
                titleClass="title mb-0 white-color"
            />

            <Footer
                footerClass="rs-footer home9-style main-home"
                footerLogo={footerLogo}
            />

            <SearchModal />
            <ToastContainer position="top-right" />
        </React.Fragment>
    );
};

export default StatistiquesSimple;