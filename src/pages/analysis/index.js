import React, { useEffect } from 'react'

import { initCesium, drawTreeNew, createPictrueNew } from '../../map/map'
import { DATA } from '../drawNet/constants'
import { PIC_DATA } from './constants'

const Analysis = () => {
    useEffect(() => {
        initCesium('map')
        // drawTreeNew(DATA)
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
            <div id="map" />
        </div>
    )
}

export default Analysis