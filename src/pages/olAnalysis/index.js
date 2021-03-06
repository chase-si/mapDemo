import React, { useEffect ,useRef} from 'react'

import { initCesium, drawTreeNew, createPictrueNew,removeLayerDraw} from '../../map/olMap'
import { DATA } from '../drawNet/constants'
import { PIC_DATA } from '../analysis/constants'

const OlAnalysis = () => {
    const mapInstance = useRef(null)
    useEffect(() => {
        mapInstance.current = initCesium('olMap')
         drawTreeNew(DATA,mapInstance.current)
        return () => {
            mapInstance.current = null
            mapInstance.layer = null
        }
        
    }, [])

    const handleBtn = () => {
        mapInstance.layer = createPictrueNew({
            start: PIC_DATA.start,
            end: PIC_DATA.end,
            image: PIC_DATA.pic,
        },mapInstance.current)
    }
    const clearBtn = () => {
        // 所有需要map实例的地方把他传到function里
        removeLayerDraw(mapInstance.current,mapInstance.layer)
    }
    return (
        <div>
            <button onClick={handleBtn}>
                draw
            </button>    
            <button onClick={clearBtn}>
                清除图层
            </button>
            <div id="olMap" style={{width: "100%",height: "500px"}} ></div>
        </div>
    )
}

export default OlAnalysis