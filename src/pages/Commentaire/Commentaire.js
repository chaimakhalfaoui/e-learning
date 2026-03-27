import React, { useEffect, useState } from 'react';
import Slider from "react-slick";
import SectionTitle from '../../components/Common/SectionTitle';
import SingleTestimonialThree from '../../components/Testimonial/SingleTestimonialThree';
import { useAuth } from '../../context/authContext'; 
import axios from 'axios';

// Testimonial Avatars
import author1 from '../../assets/img/testimonial/style3/1.png';
import author2 from '../../assets/img/testimonial/style3/2.png';
import author3 from '../../assets/img/testimonial/style3/3.png';
import author4 from '../../assets/img/testimonial/style3/4.png';
import author5 from '../../assets/img/testimonial/style3/5.png';

const Testimonial = () => {
    const { idUser } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const testimonialSettings = {
        dots: true,
        centerMode: false,
        infinite: true,
        arrows: false,
        slidesToShow: 2,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 767,
                settings: {
                    slidesToShow: 1,
                    dots: false,
                }
            }
        ]
    };

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        try {
            const response = await axios.get('http://localhost:8801/api/commentaire/getComments');
            setComments(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des commentaires :', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userid = await idUser();
        // Vérification si le commentaire est vide
        if (!newComment.trim()) {
            setError('Le commentaire ne peut pas être vide.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8801/api/commentaire/createComment', {
                iduser: userid,
                commentaire: newComment
            });

            if (response.status === 200) {
                setSuccess('Le commentaire a été créé avec succès.');
                setNewComment(''); // Effacer le champ de commentaire après la soumission réussie
                fetchComments(); // Rafraîchir la liste des commentaires
            }
        } catch (error) {
            console.error('Erreur lors de la création du commentaire :', error);
            setError('Une erreur s\'est produite lors de la création du commentaire.');
        }
    };

    return (
        <React.Fragment>
            <div className="rs-testimonial style3 orange-color pt-102 md-pt-70 pb-60">
                <div className="container">
                    <SectionTitle
                        sectionClass="sec-title mb-60 text-center md-mb-30"
                        subtitleClass="sub-title orange"
                        subtitle="Student Reviews"
                        titleClass="title mb-0"
                        title="What Our Students Say"
                    />
                    <div className="row">
                        <Slider {...testimonialSettings}>
                            {comments.map((comment, index) => (
                                <SingleTestimonialThree
                                    key={comment.id}
                                    itemClass="testi-item"
                                    authorImage={index % 5 === 0 ? author1 : index % 5 === 1 ? author2 : index % 5 === 2 ? author3 : index % 5 === 3 ? author4 : author5}
                                    Title={comment.username}
                                    Designation={comment.role}
                                    Description={comment.commentaire}
                                />
                            ))}
                        </Slider>
                    </div>
                    <div className="comment-form">
                        <h2>Donner un commentaire</h2>
                        <form onSubmit={handleSubmit}>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Votre commentaire"
                            ></textarea>
                            {error && <p className="error">{error}</p>}
                            {success && <p className="success">{success}</p>}
                            <button type="submit">Envoyer</button>
                        </form>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

export default Testimonial;