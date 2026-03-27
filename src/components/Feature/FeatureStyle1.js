import FeatureSingle from '../Feature/FeatureSingle';

// Feature Image
import image1 from '../../assets/img/features/icon/3.png';
import image2 from '../../assets/img/features/icon/2.png';
import image3 from '../../assets/img/features/icon/1.png';

const FeatureStyle1 = (props) => {
    return (
        <div className="rs-features main-home" >
            <div className="container">
                <div className="row">
                    <div className="col-lg-4 col-md-12 md-mb-30">
                        <FeatureSingle
                            itemClass="features-wrap"
                            itemImg={image1}
                            itemTitle=" XX course en Ligne "
                            itemDesc="Profitez d’une variété de sujets récents.
"
                        />
                    </div>
                    <div className="col-lg-4 col-md-12 md-mb-30">
                        <FeatureSingle
                            itemClass="features-wrap"
                            itemImg={image2}
                            itemTitle="Instruction d’expert."
                            itemDesc="Trouvez le bon formateur."
                        />
                    </div>
                    <div className="col-lg-4 col-md-12">
                        <FeatureSingle
                            itemClass="features-wrap"
                            itemImg={image3}
                            itemTitle="Création "
                            itemDesc="septembre 1995"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FeatureStyle1


