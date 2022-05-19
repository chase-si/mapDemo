import React, { useEffect ,useRef} from 'react'

import { initCesium, drawTreeNew, chooseSensor ,removeLayerDraw ,finishLayerDraw} from '../../map/olMap'
import { DATA } from './constants'

const OlSelectDevices = () => {
    const mapInstance = useRef(null)
    useEffect(() => {
        mapInstance.current =  initCesium('olMap')
        drawTreeNew(DATA,mapInstance.current)
        return () => {
            mapInstance.current = null
            mapInstance.layer = null
            mapInstance.draw = null
        }
    }, [])

    const beginSelect = () => {
        console.log('开始框选')
       const {layerVector,draw} =  chooseSensor(mapInstance.current)
        mapInstance.layer = layerVector
        mapInstance.draw = draw
    }

    const beginSelectCallback = (data) => {
        console.log('开始框选的回调')
        console.log(data)
    }

    const cancelSelect = () => {
        console.log('取消框选')
        removeLayerDraw(mapInstance.current,mapInstance.layer)
        finishLayerDraw(mapInstance.current,mapInstance.draw)
    }

    const cancelSelectCallback = (data) => {
        console.log('取消框选的回调')
        console.log(data)
    }

    const finishSelect = () => {
        console.log('结束框选')
        finishLayerDraw(mapInstance.current,mapInstance.draw)
    }

    return (
        <div>
            <button onClick={beginSelect}>
                开始框选
            </button>
            <button onClick={cancelSelect}>
                取消框选
            </button>
            <button onClick={finishSelect}>
                结束框选
            </button>
            <div id="olMap" style={{width: "100%",height: "500px"}}  />
        </div>
    )
}

export default OlSelectDevices