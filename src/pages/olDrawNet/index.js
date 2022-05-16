import React, { useEffect } from 'react'

import { initCesium ,drawTreeNew} from '../../map/olMap'
import { DATA } from './constants'

const OlDrawNet = () => {
    useEffect(() => {
        initCesium('olMap')
    }, [])

    const handleBtn = () => {
        drawTreeNew(DATA)
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

export default OlDrawNet