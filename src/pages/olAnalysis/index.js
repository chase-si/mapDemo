import React, { useEffect } from 'react'

import { initCesium, drawTreeNew, createPictrueNew } from '../../map/olMap'
import { DATA } from '../drawNet/constants'
import { PIC_DATA } from '../analysis/constants'

const OlAnalysis = () => {
    useEffect(() => {
        initCesium('olMap')
        drawTreeNew(DATA)
    }, [])

    const handleBtn = () => {
        createPictrueNew({
            start: PIC_DATA.start,
            end: PIC_DATA.end,
            image: PIC_DATA.pic
        })
    }

    return (
        <div>
            <button onClick={handleBtn}>
                draw
            </button>            
            <div id="olMap" style={{width: "100%",height: "500px"}}  >11</div>
        </div>
    )
}

export default OlAnalysis