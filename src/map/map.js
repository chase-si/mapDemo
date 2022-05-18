/* eslint-disable no-undef */
import * as Cesium from 'cesium'

import { zhanDian } from '../static/img'
// import {
//     handleRepeatPostionSignal,
//     calcPositionByDistance,
//     numberToDotString
// } from './handleData'
window.CESIUM_BASE_URL = '/Cesium'


/**
* 根据两个点位的经纬度, 示向度计算位置
*/
const degreeToRad = (degree) => (Math.PI * degree) / 180
// 根据经纬度， 示向度， 和距离， 计算出一个经纬度， 用于画射线用
const calcPositionByDistance = ({
    longitude = 0,
    latidute = 0,
    angle = 0, // 相对于正北
    distance = 5 // 5经度°的距离, 差不多500km
}) => {
    const degree = degreeToRad(angle)
    return [
        longitude + (distance * Math.sin(degree)),
        latidute + (distance * Math.cos(degree))
    ]
}

export const initCesium = (domId) => {
    // 初始化地球
    const viewer = new Cesium.Viewer(domId, {
        geocoder: false,
        homeButton: false,
        sceneModePicker: true,
        baseLayerPicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: true,
        infoBox: false,
        fullscreenButton: false,
        requestRenderMode: false, // 减少整体CPU使用率,影响流动材质效果
        imageryProvider: new Cesium.UrlTemplateImageryProvider({
            url: '',
            tilingScheme: new Cesium.GeographicTilingScheme(),
            tileWidth: 512,
            tileHeight: 512,
            maximumLevel: 11,
            credit: 'cetc22'
        })
        // terrainProvider: new Cesium.CesiumTerrainProvider({
        //   url: this.GLOBAL.baseMapUrl + '/Wolrd0_11/DemData',
        //   requestVertexNormals: true,
        //   requestMetadata: true
        // })
    })
    // 隐藏版权信息
    viewer.cesiumWidget.creditContainer.style.display = 'none'
    // viewer.scene.fxaa = true;
    // viewer.scene.postProcessStages.fxaa.enabled = true;
    window.viewer = viewer

    viewer.timeline.container.style.display = 'none'
    // // 增加影像地图
    const imagery = new Cesium.UrlTemplateImageryProvider({
        url: '/Cesium/map/yx/{z}/{reverseY}/{reverseY}_{x}.jpg',
        // 30G的google Earth
        // url: 'http://localhost:3333/{z}/{x}/{reverseY}.jpg',
        tilingScheme: new Cesium.GeographicTilingScheme(),
        tileWidth: 512,
        tileHeight: 512,
        maximumLevel: 11,
        credit: 'cetc22'
    })
    viewer.imageryLayers.addImageryProvider(imagery)
    return viewer
}

// new
// 绘制树时需要清空的变量
// 所有绘制的点的实体id集
let stationPoints = []
// 非中心站实体id集
let zhandianPoints = []
// 用于判断是否在多边形内的集合
let zhandians = []
// 用于判断是否在多边形内的集合
let zhandianinfos = []
// 中心站info
let centerStation
// 连线实体id集合
let polylines = []

// 框选时需要清空的变量
// 框选多边形
let kuangxuanPolygon
// 框选时绘制的点集合
let positions = []

// 任务显示 point entity 容器
let taskPointEntities = []
// 任务显示 point entity 容器
let taskPointEntitieInfos = []
// 任务显示  文本框 信息 容器
let taskPointLabelinfos = []
// 交汇任务 实体容器
// let crossEntities = []

const drawPointNew = (obj) => {
    if (obj.node_id && obj.longitude && obj.latitude) {
        const pointEntity = new Cesium.Entity({
            id: obj.node_id,
            position: Cesium.Cartesian3.fromDegrees(obj.longitude, obj.latitude),
            billboard: {
                image: zhanDian,
                width: 30,
                height: 30
            },
            label: {
                text: obj.station_name,
                font: '12pt Lucida Console',
                verticalOrigin: Cesium.VerticalOrigin.TOP,
                pixelOffset: new Cesium.Cartesian2(34, 0.0)
            }
        })
        //  if 处理非中心站 else 处理中心站
        if (!(obj.node_type === 'center')) {
            // 将当前  点实体 存入指定数组
            zhandianPoints.push(pointEntity)
            // 以下三行 提前为判断是否在多边形内做准备
            const pointTemp = {}
            pointTemp[obj.node_id] = Cesium.Cartesian3.fromDegrees(obj.longitude, obj.latitude, 0)
            zhandians.push(pointTemp)
            // 将当前站点信息存入指定数组
            zhandianinfos.push(obj)
            // 非中心站与中心站连线
            ligature([centerStation, obj])
        } else {
            if (centerStation) {
                ligature([centerStation, obj, Cesium.Color.ORANGE])
            }
            centerStation = obj
        }
        //  存入 站点 数组
        stationPoints.push(obj.node_id)
        // 绘制 实体
        viewer.entities.add(pointEntity)
        // 遍历children子集 画点
        if (obj.children) {
            for (let i = 0; i < obj.children.length; i += 1) {
                let objTemp = {}
                objTemp = obj.children[i]
                drawPointNew(objTemp)
            }
        }
    }
}

// 连线
const ligature = (props) => {
    const [obj1, obj2, color] = props
    const polyline = new Cesium.Entity(
        {
            id: Math.random(),
            polyline: {
                positions: Cesium.Cartesian3.fromDegreesArray(
                    [obj1.longitude, obj1.latitude, obj2.longitude, obj2.latitude]
                ),
                width: 2,
                material: color || Cesium.Color.WHITE,
                CLAMP_TO_GROUND: true
            }

        }
    )
    // 存入 连线实体 集
    polylines.push(polyline.id)
    // 绘制实体
    viewer.entities.add(polyline)
}

// 地图上绘制网系
export const drawTreeNew = (tree) => {
    // 注销 鼠标双击事件
    viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    // 清除所有实体
    viewer.entities.removeAll()
    // 每次绘树 都初始化 变量
    stationPoints = []
    zhandianPoints = []
    centerStation = null
    polylines = []
    zhandians = []
    zhandianinfos = []
    taskPointEntities = []
    taskPointLabelinfos = []
    taskPointEntitieInfos = []
    // 绘制点
    drawPointNew(tree)
    // 将相机视角 移动至 中心站 上方10000000米高度
    movingCamera(tree.longitude, tree.latitude, 1e7)
}

export const showLabelNew = (showItemInfo) => {
    const {
        name, longitude, latitude, id, type
    } = showItemInfo

    const x = new PopLableNew(
        {
            content: `
            名称: ${name} ;</br>
            经度: ${longitude} ;</br>
            纬度: ${latitude};
        `,
            position: [longitude, latitude, 0],
            id,
            bgColor: '#FFFFFF',
            fontColor: '#FFFFFF'

        }
    )
    // 返回element 让外部选择时机进行remove
    return document.getElementById(id)
    //  下方注释是用 实体 实现的方式，但是样式控制不如上面这种精准

    // const labelEntity = new Cesium.Entity({
    //     id: Math.random(),
    //     position: Cesium.Cartesian3
    //         .fromDegrees(longitude, latitude),
    //     // billboard: {
    //     //     position: Cesium.Cartesian3
    //     //         .fromDegrees(longitude, latitude),
    //     //     image: qiPao,
    //     //     verticalOrigin: Cesium.VerticalOrigin.TOP,
    //     //     width: 200,
    //     //     height: 200
    //     // },
    //     label: {
    //         text: `名称: ${name}\n经度: ${longitude}\n纬度: ${latitude}`,
    //         font: '12pt Lucida Console',
    //         verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    //         pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.5E2, 0.0, 8.0E6, 10.0),
    //         backgroundColor: Cesium.Color.BLUE.withAlpha(0.45),
    //         outlineColor: Cesium.Color.WHITE,
    //         showBackground: true,
    //         pixelOffset: new Cesium.Cartesian2(0, -5)
    //     }
    // })
    // // 在外部对气泡实体进行删除
    // viewer.entities.add(labelEntity)
    // return labelEntity
}

/**
 * 判断是否在多边形内
 * @param point
 * @param pts
 * @returns {boolean}
 */
 function isPointInPolygon(point, pts) {

    var change_point1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(point);
    point = {lat: change_point1.latitude, lng: change_point1.longitude};
    var temp_pts = [];
    // var change_point2 = {};
    for (var i = 0; i < pts.length; i++) {
        let change_point2 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(pts[i])
        temp_pts.push({lat: change_point2.latitude, lng: change_point2.longitude})
    }
    pts = temp_pts;
    var N = pts.length;  //pts [{lat:xxx,lng:xxx},{lat:xxx,lng:xxx}]
    var boundOrVertex = true; //如果点位于多边形的顶点或边上，也算做点在多边形内，直接返回true
    var intersectCount = 0;//cross points count of x
    var precision = 2e-10; //浮点类型计算时候与0比较时候的容差
    var p1, p2;//neighbour bound vertices
    var p = point; //point {lat:xxx,lng:xxx}

    p1 = pts[0];//left vertex
    for (var i = 1; i <= N; ++i) {//check all rays
        if ((p.lat == p1.lat) && (p.lng == p1.lng)) {
            return boundOrVertex;//p is an vertex
        }
        p2 = pts[i % N];//right vertex
        if (p.lat < Math.min(p1.lat, p2.lat) || p.lat > Math.max(p1.lat, p2.lat)) {//ray is outside of our interests
            p1 = p2;
            continue;//next ray left point
        }
        if (p.lat > Math.min(p1.lat, p2.lat) && p.lat < Math.max(p1.lat, p2.lat)) {//ray is crossing over by the algorithm (common part of)
            if (p.lng <= Math.max(p1.lng, p2.lng)) {//x is before of ray
                if (p1.lat == p2.lat && p.lng >= Math.min(p1.lng, p2.lng)) {//overlies on a horizontal ray
                    return boundOrVertex;
                }
                if (p1.lng == p2.lng) {//ray is vertical
                    if (p1.lng == p.lng) {//overlies on a vertical ray
                        return boundOrVertex;
                    } else {//before ray
                        ++intersectCount;
                    }
                } else {//cross point on the left side
                    var xinters = (p.lat - p1.lat) * (p2.lng - p1.lng) / (p2.lat - p1.lat) + p1.lng;//cross point of lng
                    if (Math.abs(p.lng - xinters) < precision) {//overlies on a ray
                        return boundOrVertex;
                    }
                    if (p.lng < xinters) {//before ray
                        ++intersectCount;
                    }
                }
            }
        } else {//special case when ray is crossing through the vertex
            if (p.lat == p2.lat && p.lng <= p2.lng) {//p crossing over p2
                var p3 = pts[(i + 1) % N]; //next vertex
                if (p.lat >= Math.min(p1.lat, p3.lat) && p.lat <= Math.max(p1.lat, p3.lat)) {//p.lat lies between p1.lat & p3.lat
                    ++intersectCount;
                } else {
                    intersectCount += 2;
                }
            }
        }
        p1 = p2;//next ray left point
    }
    if (intersectCount % 2 == 0) {//偶数在多边形外
        return false;
    } else { //奇数在多边形内
        return true;
    }
};


// 检测点是否在多边形内
function pointCheck(_points, pts) {
    const ids = []
    _points.forEach(val => {
        Object.keys(val).forEach(key => {
            if (isPointInPolygon(val[key], pts)) {
                ids.push(key)
            }
        })
        // for (const key in val) {
        //     if (GVSUTILS.isPointInPolygon(val[key], pts)) {
        //         ids.push(key)
        //     }
        // }
    })
    return ids
}
// 删除鼠标绘制的点坐标
function removePoint(_positions) {
    positions.forEach(val => {
        const id = val.x + val.y + val.z
        viewer.entities.removeById(id)
    })
}
// 删除鼠标绘制的线坐标
function removeLine(_positions) {
    positions.forEach(val => {
        const id = `${val.x + val.y + val.z}Line`
        viewer.entities.removeById(id)
    })
}
// 增加鼠标点击绘制的点坐标
function addPoint(position) {
    const id = position?.x + position?.y + position?.z
    viewer.entities.add({
        id,
        position,
        point: {
            color: Cesium.Color.BLUE,
            pixelSize: 10,
            heightReference: Cesium.HeightReference.NONE
        }
    })
}
// 增加鼠标点击绘制的连线
function addLine(_positions, id) {
    const dynamicPositions = new Cesium.CallbackProperty(() => {
        return positions
    }, false)
    viewer.entities.add(new Cesium.Entity({
        id,
        polyline: {
            positions: dynamicPositions,
            width: 2,
            arcType: Cesium.ArcType.RHUMB,
            clampToGround: false,
            material: Cesium.Color.RED,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
    }))
}

// 根据点坐标集合绘制多边形
function drawPolygonNew(_positions) {
    kuangxuanPolygon = new Cesium.Entity({
        id: Math.random(),
        polygon: {
            hierarchy: _positions,
            material: Cesium.Color.RED.withAlpha(0.5)
        }
    })
    viewer.entities.add(kuangxuanPolygon)
}

// 框选设备 type : ===1 框选对象  ===2 取消框选  ===3 点击按钮确认框选 ===other 切换tab
export const chooseSensor = (dispatch, type) => {
    let ids
    let result
    let selectedPoint
    // 清除之前存在的多边形实体
    if (kuangxuanPolygon) { viewer.entities.remove(kuangxuanPolygon) }
    // 判断是框选还是取消框选
    if (type === 1) {
        positions = []
        viewer.screenSpaceEventHandler.setInputAction((clickEvent) => {
            const cartesian = viewer
                .scene.globe.pick(viewer.camera.getPickRay(clickEvent.position), viewer.scene)
            // 判断鼠标左键单击是否在地球上
            if (cartesian) {
                const newPositions = positions
                    .filter(position => (cartesian.x === position.x && cartesian.y === position.y && cartesian.z === position.z))
                if (newPositions.length === 0) {
                    positions.push(cartesian)
                    // 绘制点
                    addPoint(cartesian)
                    // 绘制线
                    addLine(positions, `${cartesian.x + cartesian.y + cartesian.z}Line`)
                }
                // 原鼠标右击 框选事件  因后续代码更新没有更新此部分，现在使用会报错，故注释

                // viewer.screenSpaceEventHandler.setInputAction((_clickEvent) => {
                //     viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
                //     viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
                //     viewer.screenSpaceEventHandler
                //         .removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK)
                //     // 删除绘制的点和线
                //     removePoint(positions)
                //     removeLine(positions)
                //     // 绘制多边形
                //     polygon = drawPolygonNew(positions)
                //     // 验证是否在范围内
                //     ids = pointCheck(points, positions)
                //     if (ids.length > 0) {
                //         selectedPoint = zhandianinfos.filter(zhandianinfo => ids.filter(id => id === zhandianinfo.node_id).length > 0)
                //         if (selectedPoint) {
                //             dispatch({
                //                 type: UPDATE_SELECTED_DEVICES_LIST,
                //                 param: selectedPoint
                //             })
                //         }
                //     }
                // }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
        result = selectedPoint
    } if (type === 2) {
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
        viewer.screenSpaceEventHandler
            .removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK)
        // 删除绘制的点和线
        removePoint(positions)
        removeLine(positions)
        dispatch({
            type: UPDATE_SELECTED_DEVICES_LIST,
            param: []
        })
        result = []
    } if (type === 3) {
        // 注销 鼠标相关事件
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
        viewer.screenSpaceEventHandler
            .removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK)
        // 删除绘制的点和线
        removePoint(positions)
        removeLine(positions)
        // 绘制多边形
        const polygon = drawPolygonNew(positions)
        // 验证是否在范围内
        ids = pointCheck(zhandians, positions)
        if (ids.length > 0) {
            selectedPoint = zhandianinfos.filter(zhandianinfo => ids.filter(id => id === zhandianinfo.node_id).length > 0)
            if (selectedPoint) {
                dispatch({
                    type: UPDATE_SELECTED_DEVICES_LIST,
                    param: selectedPoint
                })
            }
        }
        result = selectedPoint
    }
    return result
}

// 覆盖范围分析
export const createPictrueNew = ({
    start,
    end,
    image // base 64
}) => {
    const rectangleEntity = new Cesium.Entity({
        id: Math.random(),
        visible: true,
        rectangle: new Cesium.RectangleGraphics(
            {
                coordinates: Cesium.Rectangle.fromDegrees(
                    start[0], start[1], end[0], end[1]
                ),
                material: new Cesium.ImageMaterialProperty({
                    image,
                    transparent: true
                }),
                show: true
            }
        )
    })

    viewer.entities.add(rectangleEntity)
    // 将相机视角 移动 第一个站点上方  2500000 米高度 更好的显示覆盖范围
    movingCamera(
        zhandianinfos[0].longitude,
        zhandianinfos[0].latitude,
        2500000
    )
    return rectangleEntity
}

// 移动相机视角方法 x 经度 y 纬度 z相机高度
const movingCamera = (x, y, z) => {
    viewer.camera.flyTo(
        {
            destination: Cesium.Cartesian3.fromDegrees(
                x,
                y,
                z
            ),
            orientation: {
                heading: Cesium.Math.toRadians(30.70999),
                pitch: Cesium.Math.toRadians(-89.6581012),
                roll: 0.0
            }
        }
    )
}

// 复位相机
export const cameraRecovery = () => {
    if (centerStation) {
        movingCamera(centerStation.longitude, centerStation.latitude, 1e7)
    }
}

//  遍历容器 从viewer里remove所有实体
export const destoryContainer = (entityContainer) => {
    if (entityContainer.length > 0) {
        entityContainer.forEach(entity => {
            viewer.entities.remove(entity.entity)
        })
    }
}

let taskPointElement
// 任务显示 点击绘点 显示文本框
export const taskPointShowLabel = (data) => {
    const isRepeat = taskPointLabelinfos.filter(entity => data.id.id === entity.id)
    if (isRepeat.length > 0) {
        const {
            id, x, y, freq
        } = isRepeat[0]
        const label = new PopLableNew(
            {
                content: `
                    <div style="width: 100%; font-size: 12px;">
                       <div style="display:flex; justify-content: space-between;">
                           <div>经度(°):</div>
                           <div>${x.toFixed(6)}</div>
                       </div>
                       <div style="display:flex;  justify-content: space-between;">
                           <div>纬度(°)：</div>
                           <div>${y.toFixed(6)}</div>
                        </div>
                        <div style="display:flex;  justify-content: space-between;">
                           <div>信号频率(MHz):</div>
                           <div>${freq}</div>
                        </div>
                    </div>
                        `,
                position: [x, y, 0],
                id: x + y,
                bgColor: '#FFFFFF',
                fontColor: '#FFFFFF'
            }
        )
        taskPointElement = document.getElementById(x + y)
    }
    return taskPointElement
}

// 任务显示 每条数据 = 一个div element + 一个 point entity
// 1.24 修改： 将文本框从此方法中抽离，实现为 点击之后再显示
//            传入的数据 会经过去重(handleRepeatPostionSignal)，然后遍历去重结果 每个结果生成一个 点的实体（eneity）
//            所有点的实体会被放进 新容器 （tempTaskPointEntitieInfos） 中，
//            方法会对 新、旧容器 （taskPointEntitieInfos）进行两次遍历，分别：
//              1.找出旧容器中需要从视图上移除的点，移除。继续保存的点（新、旧容器中坐标相同的点） 存入 临时容器
//                 1.1 将临时容器中的值 赋值给 旧容器,此时旧容器中只有坐标相同的点
//              2.找出新容器中需要绘制的点，在视图上绘制 并存入（push） 旧容器
//   容器数组中的map 由两个字段组成  id (经纬度相加之和)  entity（Cesium点的实体对象）
export const taskPointNew = (fusionDatas) => {
    // 如果收到['reset taskPointEntitieInfos'] 即清空上一波数据容器 taskPointEntitieInfos
    if (fusionDatas[0] === 'reset taskPointEntitieInfos') { taskPointEntitieInfos = [] }
    const tempTaskPointEntities = []
    const tempTaskPointEntitieInfos = []
    // // 初始化 容器
    // if (elements.length > 0) {
    //     elements.forEach(element => {
    //         element.remove()
    //     })
    // }
    // elements = []

    //  加入一个不动点 用于测试，无需测试后可清除
    const data111 = {
        SIGNAL_WD: 40099711.29152168,
        SIGNAL_JD: 102107065.28264971,
        TZYS: 1,
        XHPL: 1613800000
    }
    const data11 = [...fusionDatas, data111]
    // 去重
    const newDatas = handleRepeatPostionSignal(data11)
    newDatas.forEach(fusionData => {
        const {
            SIGNAL_JD, SIGNAL_WD, DATAS
        } = fusionData
        const id = Math.random()
        if (SIGNAL_JD && SIGNAL_WD) {
            const freq = DATAS.map(data => data.freq / (10 ** 6)).toString()
            const style = DATAS.map(data => data.style).toString()
            const x = SIGNAL_JD / (10 ** 6)
            const y = SIGNAL_WD / (10 ** 6)
            // 第一次进入方法时移动相机视角，不然一直动影响点击信号 导致点不到
            // if (taskPointEntities.length === 0) { movingCamera(x, y, 1e7) }

            // 注释内容为 文本框

            // const elementTemp = new PopLableNew(
            //     {
            //         content: `
            //         <div style="width: 100%; font-size: 12px;">
            //            <div style="display:flex; justify-content: space-between;">
            //                <div>经度(°):</div>
            //                <div>${x.toFixed(6)}</div>
            //            </div>
            //            <div style="display:flex;  justify-content: space-between;">
            //                <div>纬度(°)：</div>
            //                <div>${y.toFixed(6)}</div>
            //             </div>
            //             <div style="display:flex;  justify-content: space-between;">
            //                <div>信号频率(MHz):</div>
            //                <div>${freq}</div>
            //             </div>
            //         </div>
            //             `,
            //         position: [x, y, 0],
            //         id,
            //         bgColor: '#FFFFFF',
            //         fontColor: '#FFFFFF'
            //     }
            // )
            // elements.push(document.getElementById(id))
            const pointTempEntity = new Cesium.Entity({
                id: Math.random(),
                position: Cesium.Cartesian3.fromDegrees(x, y),
                point: {
                    color: Cesium.Color.RED,
                    pixelSize: 10,
                    HeightReference: Cesium.HeightReference.NONE
                }
            })
            tempTaskPointEntities.push(pointTempEntity)
            tempTaskPointEntitieInfos.push({
                id: x + y,
                entity: pointTempEntity
            })
            taskPointLabelinfos.push({
                id: pointTempEntity.id,
                x,
                y,
                freq
            })
        }
    })
    // 临时容器 存放旧容器中可以继续保存的实体
    const tempEntityArray = []
    const tempEntityInfoArray = []
    // taskPointEntities 上一波数据所绘制的点的实体集合（旧容器） tempTaskPointEntities 这一波的 (新容器)
    // 遍历上一波实体 如果存在点 与这一波实体集合中没有坐标相同的点  移除该点
    taskPointEntitieInfos.forEach(oldEntity => {
        // 条件 两个实体的position 是否相等
        const isRepeat = oldEntity.entity ? tempTaskPointEntitieInfos.filter(entity => entity.id === oldEntity.id) : []
        // 如果没有符合条件的结果 filter 返回一个空数组，即 旧容器中正在遍历的这个点 在 新容器中已经不存在了， 故删除
        if (isRepeat.length === 0) {
            // 从视图上清除掉这个不应该再存在 的点
            viewer.entities.remove(oldEntity.entity)
        } else {
            // 继续存在的点 暂时存入 临时容器
            tempEntityInfoArray.push(oldEntity)
        }
    })
    // 把临时容器 替换并存入taskPointEntities 旧容器中
    taskPointEntitieInfos = [...tempEntityInfoArray]
    // 遍历新的实体集合  如果 存在点 与上一波实体集合中的实体 坐标都不相同  绘制该点
    tempTaskPointEntitieInfos.forEach(entity => {
        const isRepeat = taskPointEntitieInfos.filter(oldEntity => entity.id === oldEntity.id)
        if (isRepeat.length === 0) {
            // 在视图上添加 这个点的实体
            viewer.entities.add(entity.entity)
            taskPointEntitieInfos.push(entity)
        }
    })
    const isElementRemove = taskPointEntitieInfos.filter(entity => entity.id.toString() === taskPointElement?.id.toString())
    // 如果最终容器中所有绘制点的id 和 文本框的id 都不一致， 清除文本框
    if (taskPointElement && isElementRemove.length === 0) {
        taskPointElement.remove()
    }
    // setElements(elements)
    // 将entity容器 抛出，允许外部对element进行清空操作
    return taskPointEntitieInfos
}

// 获取一个站点图标的实体
const getOnePointEntity = (props) => {
    const {
        x, y, text, verticalOrigin
    } = props
    return new Cesium.Entity({
        id: Math.random(),
        position: Cesium.Cartesian3.fromDegrees(x, y),
        billboard: {
            image: zhanDian,
            width: 30,
            height: 30
        },
        label: {
            text,
            font: '12pt Lucida Console',
            verticalOrigin,
            PixelOffset: new Cesium.Cartesian2(1.0, 0.0)
        }
        
    })
}
//  交汇信号 画 N个点  N-1条线
export const crossPointNew = (params) => {
    try {
        const {
            channels,
            interaction = params['intersection-point']
        } = params
        let { crossEntities } = params

        // 清理上次残余
        if (crossEntities.length > 0) {
            crossEntities.forEach(entity => {
                viewer.entities.remove(entity)
            })
            crossEntities = []
        }

        channels.forEach((channel, _) => {
            const pointEntity = getOnePointEntity(
                {
                    x: channel[0],
                    y: channel[1],
                    text: channel[9],
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM
                }
            )
            crossEntities = [
                pointEntity,
                ...crossEntities
            ]

            const lineEntity = new Cesium.Entity({
                id: Math.random(),
                polyline: {
                    positions: Cesium.Cartesian3.fromDegreesArrayHeights(
                        [
                            channel[0],
                            channel[1],
                            channel[2],
                            ...calcPositionByDistance({
                                longitude: channel[0],
                                latidute: channel[1],
                                angle: channel[3]
                            }),
                            0
                        ]
                    ),
                    width: 10,
                    arcType: Cesium.ArcType.NONE,
                    material: new Cesium.PolylineArrowMaterialProperty(
                        Cesium.Color.ORANGE
                    )
                }
            })

            crossEntities = [
                lineEntity,
                ...crossEntities
            ]
        })

        if (interaction?.length && interaction[0]) {
            const interactionX = parseFloat(interaction[0])
            const interactionY = parseFloat(interaction[1])

            const crossEntity = new Cesium.Entity({
                id: Math.random(),
                position: Cesium.Cartesian3.fromDegrees(
                    interactionX,
                    interactionY
                ),
                point: {
                    color: Cesium.Color.RED,
                    pixelSize: 10
                },
                label: {
                    text: '信号交汇点',
                    font: '12pt Lucida Console',
                    verticalOrigin: Cesium.VerticalOrigin.TOP,
                    PixelOffset: new Cesium.Cartesian2(-5.0, 0.0)
                }
            })
            crossEntities = [
                crossEntity,
                ...crossEntities
            ]
        }

        // 将相机视角 移动至 信号1 上方10000000米高度
        // movingCamera(
        //     pos1[0] / (10 ** 6),
        //     pos1[1] / (10 ** 6),
        //     10000000
        // )
        crossEntities.forEach(entity => viewer.entities.add(entity))
        return crossEntities
    } catch (err) {
        console.log(err)
        return []
    }
}

// 时差定位 画 N个设备 1个交汇点
export const drawTimeCrossPoints = (params) => {
    try {
        const { pointsArr } = params
        let { pointEntities } = params
        console.log(pointsArr)

        // 清理上次残余
        if (pointEntities.length > 0) {
            pointEntities.forEach(entity => {
                viewer.entities.remove(entity)
            })
            pointEntities = []
        }

        pointsArr.forEach((point, idx) => {
            const pointEntity = getOnePointEntity(
                {
                    x: parseFloat(point.stationLng),
                    y: parseFloat(point.stationLat),
                    text: point.stationName,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM
                }
            )
            pointEntities = [
                pointEntity,
                ...pointEntities
            ]

            if (idx === 0 && point?.lng) {
                const interactionX = parseFloat(point?.lng / 10 ** 6)
                const interactionY = parseFloat(point?.lat / 10 ** 6)

                const crossEntity = new Cesium.Entity({
                    id: Math.random(),
                    position: Cesium.Cartesian3.fromDegrees(
                        interactionX,
                        interactionY
                    ),
                    point: {
                        color: Cesium.Color.RED,
                        pixelSize: 10
                    },
                    label: {
                        text: '信号交汇点',
                        font: '12pt Lucida Console',
                        verticalOrigin: Cesium.VerticalOrigin.TOP,
                        PixelOffset: new Cesium.Cartesian2(-5.0, 0.0)
                    }
                })
                pointEntities = [
                    crossEntity,
                    ...pointEntities
                ]
            }
        })

        pointEntities.forEach(entity => viewer.entities.add(entity))
        return pointEntities
    } catch (error) {
        console.log(error)
        return []
    }
}
class PopLableNew {
    constructor(opt) {
        this.id = opt.id
        // 定义：显示的内容html
        this.content = opt.content
        this.position = opt.position
        this.bgColor = opt.bgColor
        this.fontColor = opt.fontColor
        const html = `<div id="${this.id}" style="position: absolute;text-align: center;top:5px;left:0;">`
            + '<div className="leaflet-popup-content-wrapper" style="text-align: center;max-height: 200px;overflow-y: auto;border: 3px solid rgba(12, 168, 210, 0.88);background: linear-gradient(180deg, #0A2945 0%, #096FB2 100%);padding: 1px;text-align: left;border-radius: 1px;position: absolute;width: 220px;">'
            + `<div id="trackPopUpLink" className="leaflet-popup-content" style="margin: 12px;line-height: 1.4;max-width: 300px; color: white">${this.content}</div>`
            + '</div>'
            + '</div>'

        const div = document.createElement('div')
        this.div = div
        div.innerHTML = html
        // console.log(div)
        // 获得：该entity当前在 屏幕画布中的 x、y 屏幕坐标
        const pos_Cartesian2_screenXY = viewer.scene.cartesianToCanvasCoordinates(Cesium.Cartesian3.fromDegrees(this.position[0], this.position[1]))
        // const that = this
        document.body.appendChild(div)
        const element = document.getElementById(this.id)
        const width = element.clientWidth
        const height = element.clientHeight

        // 如果实体的坐标，在屏幕内
        if (typeof (pos_Cartesian2_screenXY) !== 'undefined' && pos_Cartesian2_screenXY.x >= 0 && pos_Cartesian2_screenXY.y >= 0) {
            const x = pos_Cartesian2_screenXY.x - width / 2
            const y = pos_Cartesian2_screenXY.y - height - 10
            document.getElementById(this.id).style.transform = `translate3d(${x}px, ${y}px, 0)`
        }
        //  else {
        //     // 如果实体坐标不在品名范围内，x/y先初始化成0,0
        //     document.getElementById(this.id).style.display = 'none'
        //     pos_Cartesian2_screenXY = { x: 0, y: 0 }
        // }

        // 显示出 信息提示框后，添加监听事件，一直更新卫星信息框 div的位置
        this.listener = viewer.scene.postRender.addEventListener(() => {
            /// ////////////////////////////////// 判断两组位置，更新卫星信息div框的位置////////////////////////////////////////
            // 获得(最新)：该entity当前在 屏幕画布中的 x、y 屏幕坐标(最新)
            const picked_entity_current_xy_positon = viewer.scene.cartesianToCanvasCoordinates(Cesium.Cartesian3.fromDegrees(this.position[0], this.position[1]))
            // 如果当前位置存在，说明目标在屏幕内，才更新位置
            if (typeof (picked_entity_current_xy_positon) !== 'undefined' && picked_entity_current_xy_positon.x >= 0 && picked_entity_current_xy_positon.y >= 0) {
                // 如果两组坐标不相等，说明实体在屏幕中移动了，信息框要跟着移动
                if ((pos_Cartesian2_screenXY.x !== picked_entity_current_xy_positon.x) || (pos_Cartesian2_screenXY.y !== picked_entity_current_xy_positon.y)) {
                    // 新气泡窗口的位置更新
                    const x = picked_entity_current_xy_positon.x - width / 2
                    const y = picked_entity_current_xy_positon.y - height - 10
                    element.style.transform = `translate3d(${x}px, ${y}px, 0)`
                    element.style.display = 'block'
                }
            } else {
            // 如果当前位置不存在，说明超出了屏幕，不更新位置
                element.style.display = 'none'
            }
        })
    }
}
