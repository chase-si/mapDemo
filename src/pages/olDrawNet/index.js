import React, { useEffect, useRef,useState } from 'react'

import { initCesium ,drawTreeNew,removeLayerDraw,resetLayerDraw,selectInfoModal,modalClose} from '../../map/olMap'
import { DATA } from '../drawNet/constants'
import './index.css'

const OlDrawNet = () => {
    const mapInstance = useRef(null)
    //modal回调数据
    const [modalData, setModalData] = useState(null); 
    const myRef = React.createRef();

    useEffect(() => {
        // useref 可以理解成var或者let, 但是改变他的值不会引起组件渲染
        // 这样我随便用几个当前组件作为页面, map不会作为全局变量引起意想不到的问题
        mapInstance.current = initCesium('olMap')
        return () => {
            mapInstance.current = null
            mapInstance.layer = null
            setModalData(null)
        }
    }, [])

    const handleBtn = () => {
        // 所有需要map实例的地方把他传到function里
        mapInstance.layer =  drawTreeNew(DATA,mapInstance.current)
         
        mapInstance.overlay = selectInfoModal(mapInstance.current,DATA.children,mapInstance.layer,'popup',modalCallBack);
    }

    const clearBtn = () => {
        // 所有需要map实例的地方把他传到function里
        removeLayerDraw(mapInstance.current,mapInstance.layer)
    }
    const resetBtn = () => {
        // 所有需要map实例的地方把他传到function里
        resetLayerDraw(mapInstance.current)
    }
    //modal内容
    const modalInfo = (data) => {
        const {station_name,sensor_code} = data;
        return (
            <>
                <div>名称：{station_name}</div>
                <div>编码：{sensor_code}</div>
            </>
        )
    }
    const modalCallBack = (data) => {
        console.log('modalCallBack:',data);
        setModalData(data)
        if (myRef.current){
            myRef.current.style.visibility= 'visible';
        }
    }

    const modalCloser = () => {
        //关闭弹框
        console.log("关闭弹框");
        modalClose(mapInstance.overlay)
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
            <div id="popup" className="ol-popup" ref={myRef}>
                <a href="#" className="ol-popup-closer" onClick={modalCloser}></a>
                {modalData && modalInfo(modalData)}
            </div>
        </div>
    )
}

export default OlDrawNet