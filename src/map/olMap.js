import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
//图层
import { Tile, Vector as LayerVector,Image as LayerImage } from 'ol/layer';
//数据源
import { OSM, Vector as SourceVector,ImageStatic } from 'ol/source';
//样式
import { Style, Fill, Stroke, Circle ,Text,Icon } from 'ol/style';
//几何
import { Circle as geomCircle,Point ,LineString,MultiLineString} from 'ol/geom';

import {transform,fromLonLat,get} from 'ol/proj';
//要素
import Feature from 'ol/Feature';

import Draw from 'ol/interaction/Draw';

//核心组件
let map = null;

// EPSG:3857 在openlayers 中默认的坐标就是google的摩卡托坐标
const defaultCoord = 'EPSG:3857';
// EPSG:4326  是国际标准，GPS坐标
const isoCoord = 'EPSG:4326';

//转换真实坐标
function convertTransform(vector){
    return transform(vector, isoCoord, defaultCoord)
}

//圆圈的样式
function drawStyle() {
    return new Style({
        fill: new Fill({
          color: "rgba(0, 191, 255, .2)",
        }),
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
                src: require('./../static/img/arrow.png') ,
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
    const {station_name,longitude,latitude} = params
    console.log(params);
    const titleFeature = new Feature({
        geometry: new Point(fromLonLat([longitude, latitude])),
        name: station_name
    })
    titleFeature.setStyle(createLabelStyle(titleFeature));
    return titleFeature;
};

//创建数据源
function createVectorSource(params) {
    const {children,longitude,latitude} = params;
    //父
    const center = [
        createCircleFeature(params,2000),
        createCircleFeature(params,12000),
        createTitleFeature(params)
    ];
    //儿子
    const drawing = children?.map(sensor => {
        return [createCircleFeature(sensor,2000),
                createCircleFeature(sensor,12000),
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
     map = new Map({
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
export const createPictrueNew = (data) => {
    const {start} = data
    const layerImage = new LayerImage({
        source: createImageStaticSource(data)
    })
    map.addLayer(layerImage);
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
        createDotFeature({longitude,latitude},4000),
    ]
    const drawing = channels?.map(channel => {
       const distance =  calcPositionByDistance({
        longitude: channel[0],
        latitude: channel[1],
        angle: channel[3]});
        const coord = {longitude: channel[0],latitude: channel[1]}
        return [createCircleFeature(coord,2000),
                createCircleFeature(coord,12000),
                createTitleFeature({...coord, station_name: channel[9]}),
                createLineFeature({...coord ,parent_longitude: distance.longitude, parent_latitude: distance.latitude})
            ];
    })?.reduce((a,b) => a.concat(b));
    return new SourceVector({
        projection: isoCoord,
        features: center.concat(drawing)
    }); 
}


export const crossPointNew = (data) => {
    const layerVector = new LayerVector({
        source: createVectorSourcePoint(data),
        style: myStyle
    });
    map.addLayer(layerVector);
    view.setCenter(convertTransform(data["intersection-point"]));
    view.setZoom(6);
}

function createVectorSourceChooseSensor(data){

}

export const chooseSensor = (mapInstance) => {
    const source = new SourceVector();
    let selectCoord = [] 
    const layerVector = new LayerVector({
        source: source
    });
    mapInstance.addLayer(layerVector)
    console.log(mapInstance.getLayers());
   let draw =  new Draw({
        source: source,
        type: 'Polygon',
      })
    mapInstance.addInteraction(draw);
    draw.on('drawstart',(e) => {
        source.clear()
    })
    draw.on('drawend',(e) => {
        console.log();
        selectCoord = e.feature.getGeometry().getExtent()
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