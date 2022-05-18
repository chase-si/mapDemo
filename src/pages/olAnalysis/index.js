import React, { useEffect ,useRef} from 'react'

import { initCesium, drawTreeNew, createPictrueNew } from '../../map/olMap'
import { DATA } from '../drawNet/constants'
import { PIC_DATA } from '../analysis/constants'

const OlAnalysis = () => {
    const mapInstance = useRef(null)
    useEffect(() => {
        mapInstance.current = initCesium('olMap')
        drawTreeNew(DATA,mapInstance.current)
        return () => {
            mapInstance.current = null
        }
        
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