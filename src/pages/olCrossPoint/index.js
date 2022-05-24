import React, { useEffect ,useRef} from 'react'

import { initCesium, crossPointNew } from '../../map/olMap'
import { DATA } from '../crossPoint/constants'

const OlCrossPoint = () => {
    const mapInstance = useRef(null)
    useEffect(() => {
        mapInstance.current =  initCesium('olMap')
    }, [])

    const handleBtn = () => {
        crossPointNew({
            ...DATA,
            crossEntities: []
        },mapInstance.current)
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