import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Slider from "react-slick";
import SinglePost from './SinglePost';

const BlogPart = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await axios.get('http://localhost:8801/api/event/getAllEvents');
                setEvents(data || []);
            } catch (error) {
                console.error("Erreur:", error);
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const getSlidesToShow = (defaultCount) => {
        return events.length < defaultCount ? events.length : defaultCount;
    };

    const blogSettings = {
        dots: false,
        centerMode: false,
        infinite: events.length > 3,
        arrows: false,
        slidesToShow: getSlidesToShow(3),
        slidesToScroll: 1,
        responsive: [
            { breakpoint: 1199, settings: { slidesToShow: getSlidesToShow(2) } },
            { breakpoint: 767, settings: { slidesToShow: 1 } }
        ]
    };

    if (loading || events.length === 0) return null;

    return (
        <Slider {...blogSettings}>
            {events.map(event => (
                <SinglePost
                    key={event.id}
                    blogClass='blog-item'
                    blogImage={event.image && `http://localhost:8801/api/image/${event.image}`}
                    blogCategory={event.categorie}
                    blogTitle={event.titre}
                    blogDesc={event.description?.substring(0, 100)}
                    blogPublishedDate={event.datedebut && new Date(event.datedebut).toLocaleDateString()}
                />
            ))}
        </Slider>
    );
}

export default BlogPart;