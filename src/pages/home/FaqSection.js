import React, { useState } from 'react';
import ModalVideo from 'react-modal-video';
import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemPanel,
    AccordionItemButton,
} from 'react-accessible-accordion';

const FaqSection = () => {

    const [isOpen, setIsOpen] = useState(false);
    const openModal = () => setIsOpen(!isOpen);

    return (
        <div className="rs-faq-part style1 orange-style pt-100 pb-100 md-pt-70 md-pb-70">
            <ModalVideo channel='youtube' isOpen={isOpen} videoId='YLN1Argi7ik' onClose={() => { openModal(); }} />
            <div className="container">
                <div className="row">
                    <div className="col-lg-6 padding-0">
                        <div className="main-part">
                            <div className="title mb-40 md-mb-14">
                                <h2 className="text-part">Questions Fréquemment Posées</h2>
                            </div>
                            <div className="faq-content">
                                <Accordion className="accordion-style1" preExpanded={'a'}>
                                    <AccordionItem className="accordion-item" uuid="a">
                                        <AccordionItemHeading className="card-header">
                                            <AccordionItemButton className="card-link">
                                               Quelles sont les prérequis ?
                                            </AccordionItemButton>
                                        </AccordionItemHeading>
                                        <AccordionItemPanel className="card-body">
                                            Il suffit d’avoir un ordinateur ou un smartphone et une connexion Internet. Aucun prérequis compliqué n’est nécessaire.
                                        </AccordionItemPanel>
                                    </AccordionItem>
                                    <AccordionItem className="accordion-item" uuid="b">
                                        <AccordionItemHeading className="card-header">
                                            <AccordionItemButton className="card-link">
                                                La plateforme propose-t-elle des cours gratuits ?
                                            </AccordionItemButton>
                                        </AccordionItemHeading>
                                        <AccordionItemPanel className="card-body">
                                            Oui, certains cours sont gratuits et accessibles à tous.
                                        </AccordionItemPanel>
                                    </AccordionItem>
                                    <AccordionItem className="accordion-item" uuid="c">
                                        <AccordionItemHeading className="card-header">
                                            <AccordionItemButton className="card-link">
                                                Comment s'inscrire à une formation ?
                                            </AccordionItemButton>
                                        </AccordionItemHeading>
                                        <AccordionItemPanel className="card-body">
                                            Pour vous inscrire à une formation, il vous suffit de créer un compte sur notre plateforme et de sélectionner le cours de votre choix.
                                        </AccordionItemPanel>
                                    </AccordionItem>
                                    <AccordionItem className="accordion-item" uuid="d">
                                        <AccordionItemHeading className="card-header">
                                            <AccordionItemButton className="card-link">
                                                Qu'est-ce que la formation à distance ?
                                            </AccordionItemButton>
                                        </AccordionItemHeading>
                                        <AccordionItemPanel className="card-body">
                                            Apprenez à votre propre rythme, C’est apprendre en ligne depuis chez soi, sans se déplacer physiquement dans une école.
                                        </AccordionItemPanel>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 padding-0">
                        <div className="img-part media-icon orange-color">
                            <a href="#" className="popup-videos" onClick={() => { openModal(); }}><i className="fa fa-play"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FaqSection;