import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CourseSidebar = ({ handleSearch, handleFilterDuration, handleFilterLevel, handleFilterCategory }) => {
    const [selectedSkill, setSelectedSkill] = useState('');
    const [selectedDuration, setSelectedDuration] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const handleSkillChange = (e) => {
        const value = e.target.value;
        setSelectedSkill(selectedSkill === value ? '' : value);
        handleFilterLevel(selectedSkill === value ? '' : value);
    };

    const handleDurationChange = (e) => {
        const value = e.target.value;
        setSelectedDuration(selectedDuration === value ? '' : value);
        handleFilterDuration(selectedDuration === value ? '' : value);
    };

    const handleCategoryChange = (e) => {
        const category = e.target.value;
        setSelectedCategory(category);
        handleFilterCategory(category);
    };

    return (
        <React.Fragment>
            <div className="widget-area">
                <div className="search-widget mb-50">
                    <h3 className="widget-title">Recherche de cours</h3>
                    <div className="search-wrap">
                        <input
                            type="search"
                            placeholder="Recherche..."
                            name="s"
                            className="search-input"
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        <button type="submit" value="Search"><i className=" flaticon-search"></i></button>
                    </div>
                </div>
                {/*<div className="widget-archives mb-50">
                    <h3 className="widget-title">Filtrer par</h3>
                    <div className="filter-widget">
                        <div className="filter-form">
                            <form>
                                <div className="single-filter mb-30">
                                    <h5>Niveau d'études</h5>
                                    <div className="radio-box form-group">
                                        <input type="radio" name="skill" id="type1" value="master" checked={selectedSkill === 'master'} onChange={handleSkillChange} />
                                        <label htmlFor="type1">Master</label>
                                    </div>
                                     <div className="radio-box form-group">
                                        <input type="radio" name="skill" id="type2" value="licence" checked={selectedSkill === 'licence'} onChange={handleSkillChange} />
                                        <label htmlFor="type2">Licence</label>
                                    </div>
                                </div>
                                
                                <div className="single-filter mb-30">
                                    <h5>Filière</h5>
                                    <div className="radio-box form-group">
                                        <input type="radio" name="category" id="cat1" value="CCDAD" checked={selectedCategory === 'CCDAD'} onChange={handleCategoryChange} />
                                        <label htmlFor="cat1">CCDAD</label>
                                    </div>
                                    <div className="radio-box form-group">
                                        <input type="radio" name="category" id="cat2" value="CIM" checked={selectedCategory === 'CIM'} onChange={handleCategoryChange} />
                                        <label htmlFor="cat2">CIM</label>
                                    </div>
                                    <div className="radio-box form-group">
                                        <input type="radio" name="category" id="cat3" value="PMC" checked={selectedCategory === 'PMC'} onChange={handleCategoryChange} />
                                        <label htmlFor="cat3">PMC</label>
                                    </div>
                                    <div className="radio-box form-group">
                                        <input type="radio" name="category" id="cat4" value="MICQ" checked={selectedCategory === 'MICQ'} onChange={handleCategoryChange} />
                                        <label htmlFor="cat4">MICQ</label>
                                    </div>
                                    <div className="radio-box form-group">
                                        <input type="radio" name="category" id="cat5" value="electrique" checked={selectedCategory === 'electrique'} onChange={handleCategoryChange} />
                                        <label htmlFor="cat5">Licence Électrique</label>
                                    </div>
                                    <div className="radio-box form-group">
                                        <input type="radio" name="category" id="cat6" value="electronique" checked={selectedCategory === 'electronique'} onChange={handleCategoryChange} />
                                        <label htmlFor="cat5">Licence Gestion Économique</label>
                                    </div>
                                     <div className="radio-box form-group">
                                        <input type="radio" name="category" id="cat7" value="mecanique" checked={selectedCategory === 'mecanique'} onChange={handleCategoryChange} />
                                        <label htmlFor="cat5">Licence Mécanique</label>
                                    </div>
                                     <div className="radio-box form-group">
                                        <input type="radio" name="category" id="cat8" value="informatique" checked={selectedCategory === 'informatique'} onChange={handleCategoryChange} />
                                        <label htmlFor="cat5">Licence Informatique</label>
                                    </div>
                                <div className="single-filter mb-30">
                                    <h5>Durée Temps</h5>
                                    <div className="radio-box form-group">
                                        <input type="radio" name="duration" id="type6" value="5" checked={selectedDuration === '5'} onChange={handleDurationChange} />
                                        <label htmlFor="type6">5+ heures</label>
                                    </div>

                                    <div className="radio-box form-group">
                                        <input type="radio" name="duration" id="type7" value="10" checked={selectedDuration === '10'} onChange={handleDurationChange} />
                                        <label htmlFor="type7">10+ heures</label>
                                    </div>

                                    <div className="radio-box form-group">
                                        <input type="radio" name="duration" id="type8" value="15" checked={selectedDuration === '15'} onChange={handleDurationChange} />
                                        <label htmlFor="type8">15+ heures</label>
                                    </div>
                                </div>
                                </div>

                                <div className="form-group mb-0">
                                    <input className="readon2 orange" type="submit"  />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                {/* <div className="widget-archives md-mb-50">
                    <h3 className="widget-title">Course Categories</h3>
                    <ul className="categories">
                        <li><Link to="/course-categories">College</Link></li>
                        <li><Link to="/course-categories">High School</Link></li>
                        <li><Link to="/course-categories">Primary</Link></li>
                        <li><Link to="/course-categories">School</Link></li>
                        <li><Link to="/course-categories">University</Link></li>
                    </ul>
                </div> */}
            </div>
        </React.Fragment>
    );
}

export default CourseSidebar;