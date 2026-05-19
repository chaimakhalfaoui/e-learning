// src/pages/Statistiques/StatistiquesSimple.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/authContext';
import { Helmet } from 'react-helmet';

// Composants
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import OffWrap from '../../components/Layout/Header/OffWrap';
import SearchModal from '../../components/Layout/Header/SearchModal';
import Newsletter from '../../components/Common/Newsletter';
import ScrollToTop from '../../components/Common/ScrollTop';
import SiteBreadcrumb from '../../components/Common/Breadcumb';

// Images
import favIcon from '../../assets/img/fav-orange.png';
import Logo from '../../assets/img/logo/dark-logo.png';
import footerLogo from '../../assets/img/logo/lite-logo.png';
import bannerbg from '../../assets/img/breadcrumbs/2.jpg';

const StatistiquesSimple = () => {
    const { role } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    // Vérification accès
    useEffect(() => {
        (async () => {
            try {
                const r = await role();
                if (r !== 'admin' && r !== 'coordinateur') navigate('/404');
            } catch {
                navigate('/404');
            }
        })();
    }, []);

    // Chargement données
    useEffect(() => {
        (async () => {
            try {
                const [sRes, mRes, cRes] = await Promise.all([
                    axios.get('http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/auth/getStatistics')
                        .catch(() => ({ data: null })),
                    axios.get('http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/auth/monthlyInscriptions')
                        .catch(() => ({ data: [] })),
                    axios.get('http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/auth/coursParCategorie')
                        .catch(() => ({ data: [] }))
                ]);

                setStats({
                    users: sRes.data?.users ?? {
                        total: 0, etudiants: 0, enseignants: 0,
                        coordinateurs: 0, admins: 0
                    },
                    courses: sRes.data?.courses ?? {
                        total: 0, published: 0, hidden: 0
                    },
                    categories: sRes.data?.categories ?? { total: 0 },
                    coursParCategorie: Array.isArray(cRes.data) ? cRes.data : [],
                    inscriptionsParMois: Array.isArray(mRes.data) ? mRes.data : []
                });
            } catch (e) {
                setError('Erreur lors du chargement.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const s = {
        page: { minHeight: '100vh', background: '#f4f6fb', fontFamily: 'sans-serif' },
        hero: {
            background: 'linear-gradient(135deg,#2c3e50,#3498db)',
            color: '#fff',
            padding: '36px 24px',
            textAlign: 'center'
        },
        h1: { margin: 0, fontSize: '26px', fontWeight: 700 },
        sub: { margin: '6px 0 0', opacity: .75, fontSize: '14px' },
        wrap: { maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' },
        grid4: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
            gap: '18px',
            marginBottom: '28px'
        },
        grid2: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))',
            gap: '20px',
            marginBottom: '20px'
        },
        card: (bg) => ({
            background: bg,
            borderRadius: '14px',
            padding: '26px 18px',
            color: '#fff',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,.1)',
            transition: 'transform 0.3s ease'
        }),
        num: { fontSize: '38px', fontWeight: 700, margin: '8px 0 4px', lineHeight: 1 },
        lbl: { fontSize: '14px', opacity: .88 },
        panel: {
            background: '#fff',
            borderRadius: '14px',
            padding: '22px',
            boxShadow: '0 2px 12px rgba(0,0,0,.06)',
            border: '1px solid #eee'
        },
        ptitle: {
            fontWeight: 600,
            fontSize: '15px',
            color: '#2c3e50',
            marginBottom: '16px',
            paddingBottom: '10px',
            borderBottom: '2px solid #f0f0f0'
        },
        row: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '9px 0',
            borderBottom: '1px solid #f7f7f7',
            fontSize: '14px'
        },
        badge: (bg) => ({
            background: bg,
            color: '#fff',
            borderRadius: '20px',
            padding: '3px 12px',
            fontSize: '13px',
            fontWeight: 600
        }),
        bar: () => ({
            height: '8px',
            borderRadius: '4px',
            background: '#eee',
            overflow: 'hidden',
            marginTop: '6px'
        }),
        fill: (pct, color) => ({
            width: pct + '%',
            height: '100%',
            background: color,
            borderRadius: '4px',
            transition: 'width .6s ease'
        }),
        footer: {
            background: 'linear-gradient(135deg,#2c3e50,#3498db)',
            borderRadius: '14px',
            padding: '16px 24px',
            textAlign: 'center',
            color: '#fff',
            fontSize: '14px',
            marginTop: '28px'
        },
        center: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '14px',
            background: '#f4f6fb'
        },
        spin: {
            width: '46px',
            height: '46px',
            border: '5px solid #ff5421',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin .8s linear infinite'
        }
    };

    if (loading) {
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
                <div style={s.center}>
                    <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
                    <div style={s.spin} />
                    <p style={{ color: '#888', fontSize: '15px', margin: 0 }}>
                        Chargement des statistiques...
                    </p>
                </div>
                <Newsletter sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-70" />
                <Footer footerClass="rs-footer home9-style main-home" footerLogo={footerLogo} />
                <ScrollToTop scrollClassName="scrollup orange-color" />
                <SearchModal />
            </React.Fragment>
        );
    }

    if (error) {
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
                <div style={s.center}>
                    <p style={{ color: '#dc3545', fontSize: '15px' }}>{error}</p>
                </div>
                <Newsletter sectionClass="rs-newsletter style1 orange-color mb--90 sm-mb-0 sm-pb-70" />
                <Footer footerClass="rs-footer home9-style main-home" footerLogo={footerLogo} />
                <ScrollToTop scrollClassName="scrollup orange-color" />
                <SearchModal />
            </React.Fragment>
        );
    }

    const u = stats.users;
    const co = stats.courses;
    const ca = stats.categories;
    const total = u.total || 1;

    const pct = (n) => Math.round((n / total) * 100);

    const userRows = [
        { label: 'Étudiants', value: u.etudiants, color: '#36A2EB' },
        { label: 'Enseignants', value: u.enseignants, color: '#FFCE56' },
        { label: 'Coordinateurs', value: u.coordinateurs, color: '#FF6384' },
        { label: 'Admins', value: u.admins, color: '#4BC0C0' }
    ];

    const courseRows = [
        { label: '📚 Total', value: co.total, color: '#43e97b' },
        { label: '✅ Publiés', value: co.published, color: '#28a745' },
        { label: '🔒 Cachés', value: co.hidden, color: '#dc3545' }
    ];

    const resumeParts = [
        u.total + ' utilisateurs',
        u.etudiants + ' étudiants',
        u.enseignants + ' enseignants',
        co.total + ' cours',
        ca.total + ' catégories'
    ];

    return (
        <React.Fragment>
            <Helmet>
                <link rel="icon" href={favIcon} />
                <title>Tableau de Bord | ISETSO</title>
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

            <div style={s.page}>
                <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>

                {/* Hero section */}
                <div style={s.hero}>
                    <h1 style={s.h1}>📊 Tableau de Bord</h1>
                    <p style={s.sub}>Statistiques de la plateforme ISETSO</p>
                </div>

                <div style={s.wrap}>
                    {/* Cartes top */}
                    <div style={s.grid4}>
                        <div style={s.card('linear-gradient(135deg,#667eea,#764ba2)')}>
                            <div style={{ fontSize: '40px' }}>👥</div>
                            <div style={s.num}>{u.total}</div>
                            <div style={s.lbl}>Utilisateurs</div>
                        </div>
                        <div style={s.card('linear-gradient(135deg,#f093fb,#f5576c)')}>
                            <div style={{ fontSize: '40px' }}>🎓</div>
                            <div style={s.num}>{u.etudiants}</div>
                            <div style={s.lbl}>Étudiants</div>
                        </div>
                        <div style={s.card('linear-gradient(135deg,#4facfe,#00f2fe)')}>
                            <div style={{ fontSize: '40px' }}>👨‍🏫</div>
                            <div style={s.num}>{u.enseignants}</div>
                            <div style={s.lbl}>Enseignants</div>
                        </div>
                        <div style={s.card('linear-gradient(135deg,#43e97b,#38f9d7)')}>
                            <div style={{ fontSize: '40px' }}>📚</div>
                            <div style={s.num}>{co.total}</div>
                            <div style={s.lbl}>Cours</div>
                        </div>
                    </div>

                    {/* Panels milieu */}
                    <div style={s.grid2}>
                        {/* Répartition utilisateurs */}
                        <div style={s.panel}>
                            <div style={s.ptitle}>👥 Répartition des utilisateurs</div>
                            {userRows.map((r) => (
                                <div key={r.label}>
                                    <div style={s.row}>
                                        <span>{r.label}</span>
                                        <span style={s.badge(r.color)}>{r.value}</span>
                                    </div>
                                    <div style={s.bar()}>
                                        <div style={s.fill(pct(r.value), r.color)} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Cours */}
                        <div style={s.panel}>
                            <div style={s.ptitle}>📚 État des cours</div>
                            {courseRows.map((r) => (
                                <div key={r.label} style={s.row}>
                                    <span>{r.label}</span>
                                    <span style={s.badge(r.color)}>{r.value}</span>
                                </div>
                            ))}
                            <div style={{ marginTop: '20px' }}>
                                <div style={s.ptitle}>🏷️ Catégories</div>
                                <div style={s.row}>
                                    <span>Total catégories</span>
                                    <span style={s.badge('#17a2b8')}>{ca.total}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cours par catégorie */}
                    {stats.coursParCategorie.length > 0 && (
                        <div style={{ ...s.panel, marginBottom: '20px' }}>
                            <div style={s.ptitle}>📊 Cours par catégorie</div>
                            {stats.coursParCategorie.map((cat, i) => {
                                const maxCount = Math.max(...stats.coursParCategorie.map(c => Number(c.count) || 0), 1);
                                const p = Math.round((Number(cat.count) / maxCount) * 100);
                                return (
                                    <div key={i}>
                                        <div style={s.row}>
                                            <span>{String(cat.nom || 'Catégorie')}</span>
                                            <span style={s.badge('#ff5421')}>{Number(cat.count) || 0}</span>
                                        </div>
                                        <div style={s.bar()}>
                                            <div style={s.fill(p, '#ff5421')} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Inscriptions par mois */}
                    {stats.inscriptionsParMois.length > 0 && (
                        <div style={{ ...s.panel, marginBottom: '20px' }}>
                            <div style={s.ptitle}>📈 Inscriptions par mois</div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '120px', padding: '0 4px' }}>
                                {stats.inscriptionsParMois.map((m, i) => {
                                    const maxVal = Math.max(...stats.inscriptionsParMois.map(x => Number(x.count) || 0), 1);
                                    const h = Math.round((Number(m.count) / maxVal) * 100);
                                    return (
                                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                            <div style={{ fontSize: '11px', color: '#ff5421', fontWeight: 600 }}>{Number(m.count) || 0}</div>
                                            <div style={{ width: '100%', height: h + '%', background: 'linear-gradient(to top,#ff5421,#ff8c69)', borderRadius: '4px 4px 0 0', minHeight: '4px' }} />
                                            <div style={{ fontSize: '10px', color: '#999', textAlign: 'center' }}>{String(m.mois || '').slice(0, 3)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Résumé */}
                    <div style={s.footer}>
                        📊 Résumé : {resumeParts.join(' | ')}
                    </div>
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

            <ScrollToTop scrollClassName="scrollup orange-color" />
            <SearchModal />
        </React.Fragment>
    );
};

export default StatistiquesSimple;