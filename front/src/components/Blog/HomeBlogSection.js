import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Slider from "react-slick";
import SinglePost from './SinglePost';

const BlogPart = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            
            try {
                const response = await axios.get('http://localhost:8801/api/event/getLatestEvents');
                setEvents(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des événements :", error);
            }
        };

        fetchEvents();
    }, []);

    const blogSettings = {
        dots: false,
        centerMode: false,
        infinite: true,
        arrows: false,
        slidesToShow: 3,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1199,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 767,
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
    };

    return (
        <React.Fragment>
            <Slider {...blogSettings}>
                {events.map(event => (
                    <SinglePost
                        key={event.id}
                        blogClass='blog-item'
                        blogImage={`http://localhost:8801/api/image/${event.image}`} // Utiliser une image par défaut si aucune image n'est disponible
                        blogCategory={event.categorie}
                        blogTitle={event.titre}
                        blogDesc={event.description.substring(0, 100) + '...'} // Limiter la description à 100 caractères
                        blogPublishedDate={new Date(event.datedebut).toLocaleDateString()}
                        blogAuthor={event.role}
                    />
                ))}
            </Slider>
        </React.Fragment>
    );
}

export default BlogPart;