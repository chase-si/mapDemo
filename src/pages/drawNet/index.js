import React, { useEffect } from 'react'

import { initCesium, drawTreeNew } from '../../map/map'
import { DATA } from './constants'

const DrawNet = () => {
    useEffect(() => {
        initCesium('map')
    }, [])

    const handleBtn = () => {
        drawTreeNew(DATA)
    }

    return (
        <div>
            <button onClick={handleBtn}>
                draw
            </button>
            <div id="map" />
        </div>
    )
}

export default DrawNet