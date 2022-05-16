import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
//图层
import { Tile, Vector as LayerVector } from 'ol/layer';
//数据源
import { OSM, Vector as SourceVector } from 'ol/source';
//样式
import { Style, Fill, Stroke, Circle ,Text} from 'ol/style';
//几何
import { Circle as geomCircle,Point ,LineString} from 'ol/geom';

import {transform,fromLonLat} from 'ol/proj';
//要素
import Feature from 'ol/Feature';

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

//线的样式
function createLineString(){
    return new Style({
      stroke: new Stroke({
          color: 'White',
          width: 2
      })
    })
}

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


//画线
function createLineFeature(params) {
    const {longitude, latitude,parent_longitude,parent_latitude} = params;
    const lineFeature = new Feature({
        geometry:new LineString(
            [convertTransform([parent_longitude, parent_latitude]) , 
             convertTransform([longitude,latitude])]
        )
    });
    lineFeature.setStyle(createLineString());
    return lineFeature;
};

//创建文字
function createTitleFeature (params) {
    const {station_name,longitude,latitude} = params
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
                createLineFeature({...sensor ,parent_longitude: longitude, parent_latitude: latitude})];
    })?.reduce((a,b) => a.concat(b));

    return new SourceVector({
        projection: isoCoord,
        features: center.concat(drawing)
    });
};

//创建图层
// function createLayerVector(params) {
//     return 
// }


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

export const drawTreeNew = (data) => {
    const {longitude,latitude} = data;
    const layer = new LayerVector({
        source: createVectorSource(data)
    });
    //重新设置Layers
    map.setLayers(layers);
    //添加
    map.addLayer(layer);
    //中心坐标
    view.setCenter(convertTransform([longitude, latitude]));
    view.setZoom(5);
};

