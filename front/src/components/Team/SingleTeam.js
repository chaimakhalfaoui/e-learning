import { Link } from 'react-router-dom';

const SingleTeam = (props) => {
    const { 
        teamClass, 
        Image, 
        Title, 
        Designation,
        age,
        email,
        tel,
        genre,
        delet,
        imageStyle 
    } = props;

    return (
        <div className={teamClass ? teamClass : 'team-item'}>
            {delet && (
                <button 
                    onClick={delet} 
                    style={{
                        marginLeft: "90%",
                        width: "38px",
                        border: "none",
                        background: "#ff5421",
                        color: "#ffff",
                        borderRadius: "4px",
                        cursor: "pointer",
                        position: "absolute",
                        zIndex: 10
                    }}
                >
                    X
                </button>
            )}
            <div className="team-img">
                <img 
                    src={Image} 
                    alt={Title}
                    style={imageStyle || { width: '100%', height: '250px', objectFit: 'cover' }}
                />
            </div>
            <div className="content-part">
                <h4 className="name">
                    <Link to='#'>
                        {Title ? Title : 'Enseignant'}
                    </Link>
                </h4>
                <span className="designation">{Designation ? Designation : 'Professeur'}</span>
                {email && (
                    <span className="designation" style={{ display: 'block', fontSize: '13px' }}>
                        <i className="fa fa-envelope me-1" style={{ color: '#ff5421' }}></i>
                        {email}
                    </span>
                )}
                {tel && (
                    <span className="designation" style={{ display: 'block', fontSize: '13px' }}>
                        <i className="fa fa-phone me-1" style={{ color: '#ff5421' }}></i>
                        {tel}
                    </span>
                )}
                {age && (
                    <span className="designation" style={{ display: 'block', fontSize: '13px' }}>
                        <i className="fa fa-calendar me-1" style={{ color: '#ff5421' }}></i>
                        {age} ans
                    </span>
                )}
                {genre && (
                    <span className="designation" style={{ display: 'block', fontSize: '13px' }}>
                        <i className="fa fa-venus-mars me-1" style={{ color: '#ff5421' }}></i>
                        {genre}
                    </span>
                )}
            </div>
        </div>
    );
}

export default SingleTeam;