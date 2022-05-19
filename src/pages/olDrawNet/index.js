import React, { useEffect, useRef } from 'react'

import { initCesium ,drawTreeNew,removeLayerDraw,resetLayerDraw} from '../../map/olMap'
import { DATA } from '../drawNet/constants'

const OlDrawNet = () => {
    const mapInstance = useRef(null)

    useEffect(() => {
        // useref 可以理解成var或者let, 但是改变他的值不会引起组件渲染
        // 这样我随便用几个当前组件作为页面, map不会作为全局变量引起意想不到的问题
        mapInstance.current = initCesium('olMap')
        return () => {
            mapInstance.current = null
            mapInstance.layer = null
        }
    }, [])

    const handleBtn = () => {
        // 所有需要map实例的地方把他传到function里
        mapInstance.layer =  drawTreeNew(DATA, mapInstance.current)
    }
    const clearBtn = () => {
        // 所有需要map实例的地方把他传到function里
        removeLayerDraw(mapInstance.current,mapInstance.layer)
    }
    const resetBtn = () => {
        // 所有需要map实例的地方把他传到function里
        resetLayerDraw(mapInstance.current)
    }

    return (
        <div>
            <button onClick={handleBtn}>
                draw
            </button>
            <button onClick={clearBtn}>
                清除图层
            </button>
            <button onClick={resetBtn}>
                重置图层
            </button>
            <div id="olMap" style={{width: "100%",height: "500px"}}  />
        </div>
    )
}

export default OlDrawNet