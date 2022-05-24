import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
//图层
import { Tile, Vector as LayerVector,Image as LayerImage } from 'ol/layer';
//数据源
import { OSM, Vector as SourceVector,ImageStatic } from 'ol/source';
//样式
import { Style, Fill, Stroke ,Text,Icon } from 'ol/style';
//几何
import { Circle as geomCircle,Point ,LineString } from 'ol/geom';

import {transform,fromLonLat} from 'ol/proj';
//要素
import Feature from 'ol/Feature';

import {Draw} from 'ol/interaction';

import Overlay from 'ol/Overlay';

// EPSG:3857 在openlayers 中默认的坐标就是google的摩卡托坐标
const defaultCoord = 'EPSG:3857';
// EPSG:4326  是国际标准，GPS坐标
const isoCoord = 'EPSG:4326';

const innerRadius = 2000;

const outerRadius = 12000;

const dotRadius = 4000;

//将地理坐标转为投影坐标
function convertTransform(vector){
    return transform(vector, isoCoord, defaultCoord)
}
//将投影坐标转为地理坐标
function theConvertTransform(vector){
    return transform(vector, defaultCoord,isoCoord)
}

//圆圈的样式
function drawStyle() {
    return new Style({
        //背景
        fill: new Fill({
          color: "rgba(0, 191, 255, .2)",
        }),
        //边框
        stroke: new Stroke({
          color: "rgba(0, 191, 255, .6)",
          width: 2,
        }),
      });
}

//点的样式
function drawDotStyle() {
    return new Style({
        fill: new Fill({
          color: "rgba(255, 0, 0)",
        }),
        stroke: new Stroke({
          color: "rgba(255, 0, 0)",
          width: 2,
        }),
      });
}

//线的样式
function createLineString(){
    return new Style({
      stroke: new Stroke({
          color: 'White',
          width: 2
      })
    })
}


//箭头的样式
let myStyle = function(feature) {
    let geometry = feature.getGeometry();
    let styles = [
    new Style({
        stroke: new Stroke({  
            width: 3,  
            color: "#f4ea2a" 
        })  
    })
    ];
    geometry.forEachSegment(function(start, end) {
        let dx = end[0]- start[0]; 
        let dy = end[1] - start[1];
        let rotation = Math.atan2(dy, dx);
        styles.push(new Style({
            geometry: new Point(end),
            image: new Icon({
                src: require('./../static/img/arrow.png'),
                anchor: [0.75, 0.5],
                rotateWithView: true,
                rotation: -rotation
            })
        }));
    });
    return styles;
};


//文字的样式
function createLabelStyle(feature){
  return new Style({
      text: new Text({
          textAlign: 'center',            //位置
          textBaseline: 'top',         //基准线
          font: 'normal 17px 微软雅黑',    //文字样式
          text: feature.get('name'),      //文本内容
          fill: new Fill({       //文本填充样式（即文字颜色)
              color: '#FFFFFF'
          })
      })
  });
};

/**
* 画圆圈
* opt_radius: 圆半径
*/
function createCircleFeature(params,opt_radius) {
    const {longitude, latitude} = params;
   const circleFeature =  new Feature({
        geometry: new geomCircle(convertTransform([longitude, latitude]), opt_radius)
    })
    circleFeature.setStyle(drawStyle())
    return circleFeature;
};

/**
* 画点
* opt_radius: 圆半径
*/
function createDotFeature(params,opt_radius) {
    const {longitude, latitude} = params;
   const circleFeature =  new Feature({
        geometry: new geomCircle(convertTransform([longitude, latitude]), opt_radius)
    })
    circleFeature.setStyle(drawDotStyle())
    return circleFeature;
};


//画线
function createLineFeature(params,style) {
    const {longitude, latitude,parent_longitude,parent_latitude} = params;
    const lineFeature = new Feature({
        geometry:new LineString(
            [convertTransform([longitude,latitude]),
             convertTransform([parent_longitude, parent_latitude]) ]
        )
    });
    if (style ?? false){
        lineFeature.setStyle(style);
    }
    return lineFeature;
};

//创建文字
function createTitleFeature (params) {
    const {station_name,longitude,latitude,sensor_code} = params
    const titleFeature = new Feature({
        geometry: new Point(fromLonLat([longitude, latitude])),
        name: station_name,
        code: sensor_code
    })
    titleFeature.setStyle(createLabelStyle(titleFeature));
    return titleFeature;
};

//创建数据源
function createVectorSource(params) {
    const {children,longitude,latitude} = params;
    //父
    const center = [
        createCircleFeature(params,innerRadius),
        createCircleFeature(params,outerRadius),
        createTitleFeature(params)
    ];
    //儿子
    const drawing = children?.map(sensor => {
        return [createCircleFeature(sensor,innerRadius),
                createCircleFeature(sensor,outerRadius),
                createTitleFeature(sensor),
                createLineFeature({...sensor ,parent_longitude: longitude, parent_latitude: latitude},createLineString())];
    })?.reduce((a,b) => a.concat(b));

    return new SourceVector({
        projection: isoCoord,
        features: center.concat(drawing)
    });
};

//图层
let layers = [
    new Tile({
        source: new OSM()
    })
]

//视图
let view = new View({
    center: [0, 0],
    zoom: 2
})

//创建map
export const initCesium = (domId) => {
    //先清除在创建
    const obj = document.getElementById(domId);
    obj.innerHTML='';
     const map = new Map({
        layers: layers,
        target: domId,
        view: view
    });
      return map;
};

export const drawTreeNew = (data, mapInstance) => {
    const {longitude,latitude} = data;
    const layer = new LayerVector({
        source: createVectorSource(data)
    });
    //添加
    mapInstance.addLayer(layer);
    //中心坐标
    view.setCenter(convertTransform([longitude, latitude]));
    view.setZoom(5);
    return layer;
};

//创建静态图片
function createImageStaticSource({
    start,
    end,
    image // base 64
}){
    return  new ImageStatic({
        projection: isoCoord,
        url:image,
        imageExtent:[start[0], start[1], end[0], end[1]],
    })
}

//创建静态图层
export const createPictrueNew = (data,mapInstance) => {
    const {start} = data
    const layerImage = new LayerImage({
        source: createImageStaticSource(data)
    })
    mapInstance.addLayer(layerImage);
    view.setCenter(convertTransform([start[0], start[1]]));
    return layerImage;

}

/**
* 根据两个点位的经纬度, 示向度计算位置
*/
const degreeToRad = (degree) => (Math.PI * degree) / 180
// 根据经纬度， 示向度， 和距离， 计算出一个经纬度， 用于画射线用
const calcPositionByDistance = ({
    longitude = 0,
    latitude = 0,
    angle = 0, // 相对于正北
    distance = 5 // 5经度°的距离, 差不多500km
}) => { 
    const degree = degreeToRad(angle)
    return {longitude:longitude + (distance * Math.sin(degree)),
            latitude:latitude + (distance * Math.cos(degree))}
}

function createVectorSourcePoint(params) {
    const {
        channels,
        interaction = params['intersection-point'],
        station_name ="信号交汇点",
        longitude = params['intersection-point'][0],
        latitude = params['intersection-point'][1]
    } = params
    const center = [
        createTitleFeature({station_name,longitude,latitude}),
        createDotFeature({longitude,latitude},dotRadius),
    ]
    const drawing = channels?.map(channel => {
       const distance =  calcPositionByDistance({
        longitude: channel[0],
        latitude: channel[1],
        angle: channel[3]});
        const coord = {longitude: channel[0],latitude: channel[1]}
        return [createCircleFeature(coord,innerRadius),
                createCircleFeature(coord,outerRadius),
                createTitleFeature({...coord, station_name: channel[9]}),
                createLineFeature({...coord ,parent_longitude: distance.longitude, parent_latitude: distance.latitude})
            ];
    })?.reduce((a,b) => a.concat(b));
    return new SourceVector({
        projection: isoCoord,
        features: center.concat(drawing)
    }); 
}


export const crossPointNew = (data,mapInstance) => {
    const layerVector = new LayerVector({
        source: createVectorSourcePoint(data),
        style: myStyle
    });
    mapInstance.addLayer(layerVector);
    view.setCenter(convertTransform(data["intersection-point"]));
    view.setZoom(6);
}


function IsPtInPoly(coordinate, points) {
    const longitude = coordinate[0]
    const latitude = coordinate[1]
	let iSum = 0,
		iCount;
	let dLon1, dLon2, dLat1, dLat2;
	iCount = points.length;
	for (let i = 0; i < iCount; i++) {
		if (i == iCount - 1) {
			dLon1 = points[i][0];
			dLat1 = points[i][1];
			dLon2 = points[0][0];
			dLat2 = points[0][1];
		} else {
			dLon1 = points[i][0];
			dLat1 = points[i][1];
			dLon2 = points[i + 1][0];
			dLat2 = points[i + 1][1];
		}
		//以下语句判断A点是否在边的两端点的水平平行线之间，在则可能有交点，开始判断交点是否在左射线上
		if (((latitude >= dLat1) && (latitude < dLat2)) || ((latitude >= dLat2) && (latitude < dLat1))) {
			if (Math.abs(dLat1 - dLat2) > 0) {
				//得到 A点向左射线与边的交点的x坐标：
			  const dLon = dLon1 - ((dLon1 - dLon2) * (dLat1 - latitude)) / (dLat1 - dLat2);
				if (dLon < longitude)
					iSum++;
			}
		}
	}
	if (iSum % 2 != 0)
		return true;
	return false;
}

export const modalClose = (overlay) => {
    overlay.setPosition(undefined);
    return false;
}

export const selectInfoModal= (mapInstance,data,layer,containerId,dispatch) => {
    const features = layer.getSource().getFeatures();
    const container = document.getElementById(containerId);
    const overlay = new Overlay({
        element: container,
        autoPan: {
          animation: {
            duration: 250,
          },
        },
      });

    mapInstance.addOverlay(overlay)
        mapInstance.on('singleclick', function (evt) {
        const coordinate = evt.coordinate;
        const pixelFeature = mapInstance.forEachFeatureAtPixel(evt.pixel,(feature) => feature)
        // 文字
        if (pixelFeature) {
            if (pixelFeature.getGeometry() instanceof Point) {
                 dispatch(data.find(item => item.sensor_code === pixelFeature.get('code')))
                 overlay.setPosition(coordinate);
            }
        }

        //几何
        features.forEach(feature => {
            const geometry = feature.getGeometry();
            if (geometry instanceof geomCircle && geometry.getRadius() === outerRadius){
                data.forEach(station => {
                    if (geometry.intersectsCoordinate(convertTransform([station.longitude, station.latitude])) && 
                        geometry.intersectsCoordinate(coordinate)){
                            dispatch(station)
                            overlay.setPosition(coordinate);
                 }
              })
            }
          })
        });
        return overlay;
}

export const chooseSensor = (mapInstance,data,dispatch) => {
    const source = new SourceVector({projection: isoCoord});
    const layerVector = new LayerVector({
        source: source
    });
    let selectedPoint = []

    mapInstance.addLayer(layerVector)
   let draw =  new Draw({
        source: source,
        type: 'Polygon',
      })
    mapInstance.addInteraction(draw);
    draw.on('drawstart',(e) => {
        selectedPoint = []
        source.clear()
    })
    
    draw.on('drawend',(e) => {
        const  polygon = e.feature.getGeometry();
        for (let i = 0; i < data.length; i++) {
            const coordinate = convertTransform([data[i].longitude,data[i].latitude])
            if (IsPtInPoly(coordinate,polygon.getCoordinates()[0])){
                selectedPoint.push(data[i])
            }
        }
        dispatch(selectedPoint);
    })
      return {layerVector,draw};
}

//结束选框
export const finishLayerDraw = (mapInstance,draw) => {
    mapInstance.removeInteraction(draw);
}

//删除图层
export const removeLayerDraw = (mapInstance,layerVector) => {
    console.log("删除图层");
    mapInstance.removeLayer(layerVector)
}

//重置图层
export const resetLayerDraw = (mapInstance) => {
    console.log("重置图层");
    mapInstance.setLayers(layers);
}