import React, { useEffect } from 'react'

import { initCesium, crossPointNew } from '../../map/map'
import { DATA } from './constants'

const DrawNet = () => {
    useEffect(() => {
        initCesium('map')
    }, [])

    const handleBtn = () => {
        crossPointNew({
            ...DATA,
            crossEntities: []
        })
        console.log(DATA)
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