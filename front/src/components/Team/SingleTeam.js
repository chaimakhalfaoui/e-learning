import { Link } from 'react-router-dom';

const SingleTeam = (props) => {
    const { teamClass, Image, Title, Designation,age,email,tel,genre,delet } = props;
	return(
        <div className={teamClass ? teamClass : 'team-item'}>
            {delet &&<button onClick={delet} style={{marginLeft:"90%",width:"38px",border:"none",background:"#ff5421",color:"#ffff",borderRadius:"4px"}}>X</button>}
            <img 
                src={Image} 
                alt={Title}
            />
            <div className="content-part">
                <h4 className="name">
                    <Link to='#'>
                        {Title ? Title : 'Jhon Pedrocas'}
                    </Link>
                </h4>
                <span className="designation">{Designation ? Designation : 'Professor'}</span>
                <span className="designation">{email ? email : '@gmail.com'}</span>
                <span className="designation">{age ? age : ''}</span>
                <span className="designation">{tel ? tel : ''}</span>
                <span className="designation">{genre ? genre : ''}</span>
                
            </div>
        </div>
	)
}

export default SingleTeam