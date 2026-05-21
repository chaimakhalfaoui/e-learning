import axios from 'axios';
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../context/authContext';
import { toast } from 'react-toastify';

const API_URL = 'http://isetso-backend-lb-667158618.us-east-1.elb.amazonaws.com:8801/api';

// ✅ CORRECTION PRINCIPALE : MessageItem sorti du composant parent
// Avant, il était défini à l'intérieur de Q() → re-créé à chaque frappe → lag
const MessageItem = memo(({
    message,
    level,
    currentUser,
    replyTo,
    replyContents,
    loading,
    replyInputRefs,
    onOpenReply,
    onReplyChange,
    onSendReply,
    onCancelReply,
    onToggleExpand,
    expandedMessages,
    formatDate,
}) => {
    const isCurrentUser = currentUser?.id === message.idUser;
    const isEnseignant = message.sentBy === 'enseignant';
    const showReplyForm = replyTo === message.id;
    const isExpanded = expandedMessages[message.id] !== false;
    const hasReplies = message.replies && message.replies.length > 0;
    const replyCount = message.replies?.length || 0;
    const currentReplyContent = replyContents[message.id] || '';

    return (
        <div style={{ marginLeft: `${level * 25}px`, marginBottom: '12px' }}>
            <div style={{
                padding: '15px',
                backgroundColor: isEnseignant ? '#fff8f0' : (isCurrentUser ? '#f0f7ff' : '#ffffff'),
                borderRadius: '12px',
                border: `1px solid ${isEnseignant ? '#ffdec2' : (isCurrentUser ? '#d6e4ff' : '#e8e8e8')}`,
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: isEnseignant ? '#ff5421' : (isCurrentUser ? '#2196f3' : '#9e9e9e'),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '16px', flexShrink: 0
                        }}>
                            {isEnseignant ? '👨‍🏫' : (isCurrentUser ? '👤' : '👨‍🎓')}
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <strong style={{ color: '#2c3e50', fontSize: '14px' }}>
                                    {isEnseignant ? 'Enseignant' : (message.userName || `Étudiant ${message.idUser}`)}
                                </strong>
                                {isCurrentUser && !isEnseignant && (
                                    <span style={{ fontSize: '10px', background: '#2196f3', color: 'white', padding: '2px 8px', borderRadius: '20px' }}>Vous</span>
                                )}
                                {isEnseignant && (
                                    <span style={{ fontSize: '10px', background: '#ff5421', color: 'white', padding: '2px 8px', borderRadius: '20px' }}>Enseignant</span>
                                )}
                            </div>
                            <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                                <i className="far fa-clock me-1"></i> {formatDate(message.createdAt)}
                            </div>
                        </div>
                    </div>

                    {hasReplies && (
                        <button
                            onClick={() => onToggleExpand(message.id)}
                            style={{
                                background: 'none', border: 'none', color: '#ff5421',
                                cursor: 'pointer', fontSize: '12px',
                                display: 'flex', alignItems: 'center', gap: '4px'
                            }}
                        >
                            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                            {replyCount} réponse{replyCount > 1 ? 's' : ''}
                        </button>
                    )}
                </div>

                {/* Contenu */}
                <p style={{
                    margin: '12px 0 8px 46px', color: '#444',
                    lineHeight: '1.5', fontSize: '14px',
                    wordBreak: 'break-word', whiteSpace: 'pre-wrap'
                }}>
                    {message.message}
                </p>

                {/* Bouton répondre */}
                <div style={{ marginLeft: '46px', marginTop: '8px' }}>
                    <button
                        onClick={() => onOpenReply(message.id, showReplyForm)}
                        style={{
                            background: 'none', border: 'none', color: '#ff5421',
                            cursor: 'pointer', fontSize: '12px', padding: '4px 0',
                            display: 'flex', alignItems: 'center', gap: '5px'
                        }}
                    >
                        <i className="fas fa-reply"></i>
                        {showReplyForm ? 'Annuler' : 'Répondre'}
                    </button>
                </div>

                {/* Formulaire de réponse */}
                {showReplyForm && (
                    <div style={{ marginTop: '15px', marginLeft: '46px', paddingTop: '12px', borderTop: '1px dashed #eee' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: '#ff5421', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', color: 'white', fontSize: '12px', flexShrink: 0
                            }}>
                                <i className="fas fa-reply"></i>
                            </div>
                            <div style={{ flex: 1 }}>
                                <textarea
                                    ref={el => replyInputRefs.current[message.id] = el}
                                    value={currentReplyContent}
                                    onChange={(e) => onReplyChange(message.id, e.target.value)}
                                    placeholder="Écrire votre réponse..."
                                    rows="3"
                                    style={{
                                        width: '100%', padding: '12px',
                                        border: '1px solid #e0e0e0', borderRadius: '10px',
                                        fontSize: '14px', resize: 'vertical',
                                        fontFamily: 'inherit', boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#ff5421';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(255,84,33,0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e0e0e0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    disabled={loading}
                                />
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button
                                        onClick={() => onSendReply(message.id)}
                                        disabled={loading}
                                        style={{
                                            background: '#ff5421', color: 'white', border: 'none',
                                            padding: '8px 20px', borderRadius: '25px',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            fontSize: '13px', fontWeight: '500'
                                        }}
                                    >
                                        {loading
                                            ? <><i className="fas fa-spinner fa-spin me-1"></i> Envoi...</>
                                            : <><i className="fas fa-paper-plane me-1"></i> Envoyer</>
                                        }
                                    </button>
                                    <button
                                        onClick={() => onCancelReply(message.id)}
                                        style={{
                                            background: '#f5f5f5', color: '#666',
                                            border: '1px solid #e0e0e0', padding: '8px 20px',
                                            borderRadius: '25px', cursor: 'pointer', fontSize: '13px'
                                        }}
                                    >
                                        <i className="fas fa-times me-1"></i> Annuler
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Réponses imbriquées */}
            {isExpanded && hasReplies && (
                <div style={{ marginTop: '8px' }}>
                    {message.replies.map(reply => (
                        <MessageItem
                            key={reply.id}
                            message={reply}
                            level={level + 1}
                            currentUser={currentUser}
                            replyTo={replyTo}
                            replyContents={replyContents}
                            loading={loading}
                            replyInputRefs={replyInputRefs}
                            onOpenReply={onOpenReply}
                            onReplyChange={onReplyChange}
                            onSendReply={onSendReply}
                            onCancelReply={onCancelReply}
                            onToggleExpand={onToggleExpand}
                            expandedMessages={expandedMessages}
                            formatDate={formatDate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});

MessageItem.displayName = 'MessageItem';

// ─────────────────────────────────────────────
const Q = () => {
    const { id } = useParams();
    const { idUser } = useAuth();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [replyContents, setReplyContents] = useState({});
    const [loading, setLoading] = useState(false);
    const [enseignantId, setEnseignantId] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [expandedMessages, setExpandedMessages] = useState({});
    const [showScrollButton, setShowScrollButton] = useState(false);

    const messageInputRef = useRef(null);
    const replyInputRefs = useRef({});
    const messagesContainerRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchEnseignantId();
        fetchCurrentUser();
        fetchMessages();
        const interval = setInterval(fetchMessages, 15000);
        return () => clearInterval(interval);
    }, [id]);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;
        const handleScroll = () => setShowScrollButton(container.scrollTop > 200);
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchEnseignantId = async () => {
    try {
        const res = await axios.get(`${API_URL}/cours/getUserIdByCourseId/${id}`);
        setEnseignantId(res.data.id_user); // ← was: res.data
    } catch (e) { console.error(e); }
};

    const fetchCurrentUser = async () => {
        try {
            const userId = await idUser();
            const res = await axios.get(`${API_URL}/users/${userId}`);
            setCurrentUser(res.data);
        } catch (e) { console.error(e); }
    };

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`${API_URL}/qr/getMessagesByCours/${id}`);
            setMessages(res.data);
        } catch (e) { console.error(e); }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) {
            toast.warning("Veuillez saisir un message.");
            messageInputRef.current?.focus();
            return;
        }
        setLoading(true);
        try {
            const userid = await idUser();
            await axios.post(`${API_URL}/qr/createMessage`, {
                idCours: id, idUser: userid, idEns: enseignantId,
                message: newMessage, sentBy: 'etudiant', parentId: null
            });
            toast.success("Message envoyé avec succès !");
            setNewMessage('');
            await fetchMessages();
            messageInputRef.current?.focus();
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
        } catch {
            toast.error("Erreur lors de l'envoi.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendReply = useCallback(async (parentMessageId) => {
        const content = replyContents[parentMessageId] || '';
        if (!content.trim()) {
            toast.warning("Veuillez saisir une réponse.");
            replyInputRefs.current[parentMessageId]?.focus();
            return;
        }
        setLoading(true);
        try {
            const userid = await idUser();
            await axios.post(`${API_URL}/qr/createMessage`, {
                idCours: id, idUser: userid, idEns: enseignantId,
                message: content, sentBy: 'etudiant', parentId: parentMessageId
            });
            toast.success("Réponse envoyée !");
            setReplyContents(prev => { const u = { ...prev }; delete u[parentMessageId]; return u; });
            setReplyTo(null);

            const container = messagesContainerRef.current;
            const savedScroll = container?.scrollTop;
            await fetchMessages();
            setTimeout(() => {
                setExpandedMessages(prev => ({ ...prev, [parentMessageId]: true }));
                if (container && savedScroll !== undefined) container.scrollTop = savedScroll;
            }, 100);
        } catch {
            toast.error("Erreur lors de l'envoi de la réponse.");
        } finally {
            setLoading(false);
        }
    }, [replyContents, id, enseignantId, idUser]);

    const handleOpenReply = useCallback((messageId, isCurrentlyOpen) => {
        const container = messagesContainerRef.current;
        const savedScroll = container?.scrollTop;
        setReplyTo(isCurrentlyOpen ? null : messageId);
        setTimeout(() => {
            if (container && savedScroll !== undefined) container.scrollTop = savedScroll;
            if (!isCurrentlyOpen) replyInputRefs.current[messageId]?.focus();
        }, 50);
    }, []);

    const handleReplyChange = useCallback((messageId, value) => {
        setReplyContents(prev => ({ ...prev, [messageId]: value }));
    }, []);

    const handleCancelReply = useCallback((messageId) => {
        setReplyTo(null);
        setReplyContents(prev => { const u = { ...prev }; delete u[messageId]; return u; });
    }, []);

    const handleToggleExpand = useCallback((messageId) => {
        setExpandedMessages(prev => ({ ...prev, [messageId]: !prev[messageId] }));
    }, []);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const diffMs = Date.now() - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1) return "à l'instant";
        if (diffMins < 60) return `il y a ${diffMins} min`;
        if (diffHours < 24) return `il y a ${diffHours} h`;
        if (diffDays === 1) return 'hier';
        if (diffDays < 7) return `il y a ${diffDays} jours`;
        return date.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }, []);

    const getMessagesTree = () => {
        const map = {};
        const roots = [];
        messages.forEach(m => { map[m.id] = { ...m, replies: [] }; });
        messages.forEach(m => {
            if (m.parentId && map[m.parentId]) map[m.parentId].replies.push(map[m.id]);
            else roots.push(map[m.id]);
        });
        roots.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        return roots;
    };

    const getFilteredMessages = () => {
        const all = getMessagesTree();
        if (activeTab === 'my' && currentUser) {
            const userId = currentUser.id;
            const filter = (list) => list.reduce((acc, msg) => {
                const filtered = filter(msg.replies || []);
                if (msg.idUser === userId || filtered.length > 0)
                    acc.push({ ...msg, replies: filtered });
                return acc;
            }, []);
            return filter(all);
        }
        return all;
    };

    const filteredMessages = getFilteredMessages();
    const rootCount = messages.filter(m => !m.parentId || m.parentId === 0 || m.parentId === null).length;

    const sharedProps = {
        currentUser, replyTo, replyContents, loading,
        replyInputRefs, expandedMessages, formatDate,
        onOpenReply: handleOpenReply,
        onReplyChange: handleReplyChange,
        onSendReply: handleSendReply,
        onCancelReply: handleCancelReply,
        onToggleExpand: handleToggleExpand,
    };

    return (
        <div className="content pt-30 pb-30 white-bg">
            <div style={{ maxWidth: '850px', margin: '0 auto', padding: '20px' }}>
                <h3 style={{ marginBottom: '20px', textAlign: 'center', color: '#2c3e50' }}>
                    💬 Forum de discussion
                </h3>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
                    {[
                        { key: 'all', label: `Tous les messages (${rootCount})`, icon: 'fa-comments' },
                    ].map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                            padding: '8px 20px', border: 'none', background: 'none', cursor: 'pointer',
                            color: activeTab === tab.key ? '#ff5421' : '#888',
                            borderBottom: activeTab === tab.key ? '2px solid #ff5421' : 'none',
                            fontWeight: activeTab === tab.key ? '600' : '400',
                        }}>
                            <i className={`fas ${tab.icon} me-2`}></i>{tab.label}
                        </button>
                    ))}
                </div>

                      {/* Liste des messages */}
                <div ref={messagesContainerRef} style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px', paddingBottom: '20px' }}>
                    <h4 style={{ marginBottom: '15px', fontSize: '15px', color: '#666' }}>
                        <i className="fas fa-history me-2" style={{ color: '#ff5421' }}></i>
                        Discussions
                    </h4>

                    {filteredMessages.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '50px', background: '#fafafa', borderRadius: '16px', color: '#999' }}>
                            <i className="fas fa-comments fa-3x" style={{ color: '#ddd', display: 'block', marginBottom: '12px' }}></i>
                            <p>Aucun message pour le moment.</p>
                            <p style={{ fontSize: '13px' }}>Soyez le premier à démarrer une discussion !</p>
                        </div>
                    ) : (
                        filteredMessages.map(message => (
                            <MessageItem key={message.id} message={message} level={0} {...sharedProps} />
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

                {/* Formulaire nouveau message */}
                <div style={{
                    padding: '20px', borderRadius: '16px', marginBottom: '20px',
                    border: '1px solid #e8e8e8', position: 'sticky', top: '0',
                    zIndex: 100, backgroundColor: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                    <h4 style={{ marginBottom: '15px', fontSize: '16px', color: '#2c3e50' }}>
                        <i className="fas fa-plus-circle me-2" style={{ color: '#ff5421' }}></i>
                        Nouvelle discussion
                    </h4>
                    <form onSubmit={handleSendMessage}>
                        <textarea
                            ref={messageInputRef}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Posez votre question ou partagez votre idée..."
                            rows="3"
                            style={{
                                width: '100%', padding: '12px 15px',
                                border: '1px solid #e0e0e0', borderRadius: '12px',
                                marginBottom: '15px', fontSize: '14px',
                                resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box'
                            }}
                            onFocus={(e) => { e.target.style.borderColor = '#ff5421'; e.target.style.boxShadow = '0 0 0 3px rgba(255,84,33,0.1)'; }}
                            onBlur={(e) => { e.target.style.borderColor = '#e0e0e0'; e.target.style.boxShadow = 'none'; }}
                            disabled={loading}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" disabled={loading} style={{
                                background: '#ff5421', color: 'white', border: 'none',
                                padding: '10px 24px', borderRadius: '30px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '14px', fontWeight: '500'
                            }}>
                                {loading ? <><i className="fas fa-spinner fa-spin me-2"></i>Envoi...</> : <><i className="fas fa-paper-plane me-2"></i>Publier le message</>}
                            </button>
                        </div>
                    </form>
                </div>

          

            {/* Bouton scroll to top */}
            {showScrollButton && (
                <button
                    onClick={() => messagesContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                    style={{
                        position: 'fixed', bottom: '100px', right: '30px',
                        width: '45px', height: '45px', borderRadius: '50%',
                        backgroundColor: '#ff5421', color: 'white', border: 'none',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        zIndex: 1000
                    }}
                    title="Remonter en haut"
                >
                    <i className="fas fa-arrow-up"></i>
                </button>
            )}
        </div>
    );
};

export default Q;
