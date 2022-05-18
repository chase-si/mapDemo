import React, { useEffect } from 'react'

import { initCesium, crossPointNew } from '../../map/olMap'
import { DATA } from '../crossPoint/constants'

const OlCrossPoint = () => {
    useEffect(() => {
        initCesium('olMap')
    }, [])

    const handleBtn = () => {
        crossPointNew({
            ...DATA,
            crossEntities: []
        })
    }
    
    return (
        <div>
            <button onClick={handleBtn}>
                draw
            </button>
            <div id="olMap" style={{width: "100%",height: "500px"}}  />
        </div>
    )
}

export default OlCrossPoint