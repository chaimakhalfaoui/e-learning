import axios from 'axios';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../assets/scss/style.scss'

const SingleEvent = (props) => {
    const { eventClass, eventImg, eventCategory, eventLocation, eventDate, eventSchedule, eventTitle, eventDesc, fetchEvents,eventId } = props;
    const navigate = useNavigate();

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:8801/api/event/deleteEvent/${eventId}`);
            toast.success('event deleted successfully', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            fetchEvents()
        } catch (error) {
            toast.error('An error occurred while deleting the event', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };
    return (
        <div className={eventClass ? eventClass : 'event-item'}>
            <button className='supprimer-event' onClick={handleDelete}>
                <img width="28" height="28" src="https://img.icons8.com/ios-filled/50/FA5252/twitterx--v1.png" alt="delete" />
            </button>
            <div className="event-short">
                <div className="featured-img">
                    <img src={eventImg} alt="Image" />
                </div>
                {eventCategory ?
                    <div className="categorie">
                        <Link href="#">{eventCategory}</Link>
                    </div> : ''
                }

                <div className="content-part">
                    <div className="all-dates-time">
                        <div className="address"><i className="fa fa-map-o"></i> {eventLocation ? eventLocation : 'New Margania'}</div>
                        {eventSchedule ?
                            <div className="time">
                                <i className="fa fa-clock-o" aria-hidden="true"></i>
                                {eventSchedule}
                            </div> : ''
                        }

                    </div>
                    <h4 className="title"><Link to="/event/style-1">{eventTitle ? eventTitle : 'Educational Technology and Mobile Learning'}</Link></h4>
                    {
                        eventDesc ?
                            <p className="text">
                                {eventDesc}
                            </p> : ''
                    }
                    <div className="event-btm">
                        <div className="date-part">
                            <div className="date">
                                <i className="fa fa-calendar-check-o"></i>
                                {eventDate ? eventDate : 'July 24, 2020'}
                            </div>
                        </div>
                        <div className="btn-part">
                            <Link to={`/event/modifier/${eventId}`}>Modifier Event </Link>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    )
}

export default SingleEvent