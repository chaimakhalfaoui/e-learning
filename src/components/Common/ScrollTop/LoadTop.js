import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

function LoadTop() {
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    return <React.Fragment />;
}

export default LoadTop;
