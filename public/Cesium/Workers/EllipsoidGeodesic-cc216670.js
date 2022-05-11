define(["exports","./Cartesian2-8646c5a1","./Check-24483042","./when-54335d57","./Math-d6182036"],function(t,S,a,_,U){"use strict";function w(t,a,i,n,e,s,r){var h,i=(h=t)*(i=i)*(4+h*(4-3*i))/16;return(1-i)*t*a*(n+i*e*(r+i*s*(2*r*r-1)))}var q=new S.Cartesian3,A=new S.Cartesian3;function n(t,a,i,n){var e,s,r,h,o,d,u,c,M,l,g,_,p,f,m,v,C,H,O;S.Cartesian3.normalize(n.cartographicToCartesian(a,A),q),S.Cartesian3.normalize(n.cartographicToCartesian(i,A),A),function(t,a,i,n,e,s,r){var h=(a-i)/a,o=s-n,n=Math.atan((1-h)*Math.tan(e)),e=Math.atan((1-h)*Math.tan(r)),r=Math.cos(n),n=Math.sin(n),d=Math.cos(e),e=Math.sin(e),u=r*d,c=r*e,M=n*e,l=n*d,g=o,_=U.CesiumMath.TWO_PI,p=Math.cos(g),f=Math.sin(g);do{var m,v,C,H,O,p=Math.cos(g),f=Math.sin(g),S=c-l*p,_=g,q=(C=M+u*p)-2*M/(O=0===(v=Math.sqrt(d*d*f*f+S*S))?(m=0,1):1-(m=u*f/v)*m),g=o+w(h,m,O,H=Math.atan2(v,C),v,C,q=!isFinite(q)?0:q)}while(Math.abs(g-_)>U.CesiumMath.EPSILON12);n=i*(1+(e=O*(a*a-i*i)/(i*i))*(4096+e*(e*(320-175*e)-768))/16384)*(H-(n=e*(256+e*(e*(74-47*e)-128))/1024)*v*(q+n*(C*(2*(a=q*q)-1)-n*q*(4*v*v-3)*(4*a-3)/6)/4)),a=Math.atan2(d*f,c-l*p),r=Math.atan2(r*f,c*p-l),t._distance=n,t._startHeading=a,t._endHeading=r,t._uSquared=e}(t,n.maximumRadius,n.minimumRadius,a.longitude,a.latitude,i.longitude,i.latitude),t._start=S.Cartographic.clone(a,t._start),t._end=S.Cartographic.clone(i,t._end),t._start.height=0,t._end.height=0,s=(e=t)._uSquared,r=e._ellipsoid.maximumRadius,h=e._ellipsoid.minimumRadius,o=(r-h)/r,d=Math.cos(e._startHeading),u=Math.sin(e._startHeading),c=(1-o)*Math.tan(e._start.latitude),M=1/Math.sqrt(1+c*c),l=M*c,g=Math.atan2(c,d),f=1-(p=(_=M*u)*_),m=Math.sqrt(f),H=1-3*(v=s/4)+35*(C=v*v)/4,O=1-5*v,s=(i=1+v-3*C/4+5*(n=C*v)/4-175*(a=C*C)/64)*g-(t=1-v+15*C/8-35*n/8)*Math.sin(2*g)*v/2-H*Math.sin(4*g)*C/16-O*Math.sin(6*g)*n/48-5*Math.sin(8*g)*a/512,(e=e._constants).a=r,e.b=h,e.f=o,e.cosineHeading=d,e.sineHeading=u,e.tanU=c,e.cosineU=M,e.sineU=l,e.sigma=g,e.sineAlpha=_,e.sineSquaredAlpha=p,e.cosineSquaredAlpha=f,e.cosineAlpha=m,e.u2Over4=v,e.u4Over16=C,e.u6Over64=n,e.u8Over256=a,e.a0=i,e.a1=t,e.a2=H,e.a3=O,e.distanceRatio=s}function i(t,a,i){i=_.defaultValue(i,S.Ellipsoid.WGS84);this._ellipsoid=i,this._start=new S.Cartographic,this._end=new S.Cartographic,this._constants={},this._startHeading=void 0,this._endHeading=void 0,this._distance=void 0,this._uSquared=void 0,_.defined(t)&&_.defined(a)&&n(this,t,a,i)}Object.defineProperties(i.prototype,{ellipsoid:{get:function(){return this._ellipsoid}},surfaceDistance:{get:function(){return this._distance}},start:{get:function(){return this._start}},end:{get:function(){return this._end}},startHeading:{get:function(){return this._startHeading}},endHeading:{get:function(){return this._endHeading}}}),i.prototype.setEndPoints=function(t,a){n(this,t,a,this._ellipsoid)},i.prototype.interpolateUsingFraction=function(t,a){return this.interpolateUsingSurfaceDistance(this._distance*t,a)},i.prototype.interpolateUsingSurfaceDistance=function(t,a){var i=this._constants,n=i.distanceRatio+t/i.b,e=Math.cos(2*n),s=Math.cos(4*n),r=Math.cos(6*n),h=Math.sin(2*n),o=Math.sin(4*n),d=Math.sin(6*n),u=Math.sin(8*n),c=n*n,M=i.u8Over256,l=i.u2Over4,g=i.u6Over64,t=i.u4Over16,c=2*(n*c)*M*e/3+n*(1-l+7*t/4-15*g/4+579*M/64-(t-15*g/4+187*M/16)*e-(5*g/4-115*M/16)*s-29*M*r/16)+(l/2-t+71*g/32-85*M/16)*h+(5*t/16-5*g/4+383*M/96)*o-c*((g-11*M/2)*h+5*M*o/2)+(29*g/96-29*M/16)*d+539*M*u/1536,h=Math.asin(Math.sin(c)*i.cosineAlpha),o=Math.atan(i.a/i.b*Math.tan(h));c-=i.sigma;g=Math.cos(2*i.sigma+c),d=Math.sin(c),M=Math.cos(c),u=i.cosineU*M,h=i.sineU*d,g=Math.atan2(d*i.sineHeading,u-h*i.cosineHeading)-w(i.f,i.sineAlpha,i.cosineSquaredAlpha,c,d,M,g);return _.defined(a)?(a.longitude=this._start.longitude+g,a.latitude=o,a.height=0,a):new S.Cartographic(this._start.longitude+g,o,0)},t.EllipsoidGeodesic=i});
