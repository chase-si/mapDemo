import React, { useEffect } from 'react'

import { initCesium, drawTreeNew, chooseSensor } from '../../map/map'
import { DATA } from './constants'

const SelectDevices = () => {
    useEffect(() => {
        initCesium('map')
        drawTreeNew(DATA)
    }, [])

    const beginSelect = () => {
        console.log('开始框选')
        chooseSensor(beginSelectCallback, 1)
    }
    const beginSelectCallback = (data) => {
        console.log('开始框选的回调')
        console.log(data)
    }

    const confirmSelect = () => {
        console.log('确认框选')
        chooseSensor(confirmSelectCallback, 3)
    }
    const confirmSelectCallback = (data) => {
        console.log('确认框选的回调')
        console.log(data)
    }

    const cancelSelect = () => {
        console.log('取消框选')
        chooseSensor(cancelSelectCallback, 2)
    }
    const cancelSelectCallback = (data) => {
        console.log('取消框选的回调')
        console.log(data)
    }

    return (
        <div>
            <button onClick={beginSelect}>
                开始框选
            </button>
            <button onClick={confirmSelect}>
                确认框选
            </button>
            <button onClick={cancelSelect}>
                取消框选
            </button>
            <div id="map" />
        </div>
    )
}

export default SelectDevices