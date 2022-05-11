import React, { useEffect } from 'react'

import { initCesium } from '../../map/map'


const DrawNet = () => {
    useEffect(() => {
        initCesium('map')
    }, [])

    return (
        <div>
            <div id="map" />
        </div>
    )
}

export default DrawNet