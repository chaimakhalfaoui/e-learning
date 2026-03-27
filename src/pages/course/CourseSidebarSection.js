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
                    <h3 className="widget-title">Course Search</h3>
                    <div className="search-wrap">
                        <input
                            type="search"
                            placeholder="Searching..."
                            name="s"
                            className="search-input"
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        <button type="submit" value="Search"><i className=" flaticon-search"></i></button>
                    </div>
                </div>
                <div className="widget-archives mb-50">
                    <h3 className="widget-title">Filter By</h3>
                    <div className="filter-widget">
                        <div className="filter-form">
                            <form>
                                <div className="single-filter mb-30">
                                    <h5>Skill Level</h5>
                                    <div className="radio-box form-group">
                                        <input type="radio" name="skill" id="type1" value="beginner" checked={selectedSkill === 'beginner'} onChange={handleSkillChange} />
                                        <label htmlFor="type1">Beginner</label>
                                    </div>

                                    <div className="radio-box form-group">
                                        <input type="radio" name="skill" id="type2" value="intermediate" checked={selectedSkill === 'intermediate'} onChange={handleSkillChange} />
                                        <label htmlFor="type2">Intermediate</label>
                                    </div>

                                    <div className="radio-box form-group">
                                        <input type="radio" name="skill" id="type3" value="expert" checked={selectedSkill === 'expert'} onChange={handleSkillChange} />
                                        <label htmlFor="type3">Expert</label>
                                    </div>
                                </div>

                                <div className="single-filter mb-30">
                                    <h5>Duration Time</h5>
                                    <div className="radio-box form-group">
                                        <input type="radio" name="duration" id="type6" value="5" checked={selectedDuration === '5'} onChange={handleDurationChange} />
                                        <label htmlFor="type6">5+ hours</label>
                                    </div>

                                    <div className="radio-box form-group">
                                        <input type="radio" name="duration" id="type7" value="10" checked={selectedDuration === '10'} onChange={handleDurationChange} />
                                        <label htmlFor="type7">10+ hours</label>
                                    </div>

                                    <div className="radio-box form-group">
                                        <input type="radio" name="duration" id="type8" value="15" checked={selectedDuration === '15'} onChange={handleDurationChange} />
                                        <label htmlFor="type8">15+ hours</label>
                                    </div>
                                </div>

                                <div className="single-filter mb-30">
                                    <h5>Type</h5>
                                    <div className="radio-box form-group">
                                        <input type="radio" name="category" id="cat1" value="College" checked={selectedCategory === 'College'} onChange={handleCategoryChange} />
                                        <label htmlFor="cat1">College</label>
                                    </div>
                                    <div className="radio-box form-group">
                                        <input type="radio" name="category" id="cat2" value="High School" checked={selectedCategory === 'High School'} onChange={handleCategoryChange} />
                                        <label htmlFor="cat2">High School</label>
                                    </div>
                                    <div className="radio-box form-group">
                                        <input type="radio" name="category" id="cat3" value="Primary" checked={selectedCategory === 'Primary'} onChange={handleCategoryChange} />
                                        <label htmlFor="cat3">Primary</label>
                                    </div>
                                    <div className="radio-box form-group">
                                        <input type="radio" name="category" id="cat4" value="School" checked={selectedCategory === 'School'} onChange={handleCategoryChange} />
                                        <label htmlFor="cat4">School</label>
                                    </div>
                                    <div className="radio-box form-group">
                                        <input type="radio" name="category" id="cat5" value="University" checked={selectedCategory === 'University'} onChange={handleCategoryChange} />
                                        <label htmlFor="cat5">University</label>
                                    </div>

                                    {/* Ajoutez d'autres boutons radio pour les autres catégories ici */}
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