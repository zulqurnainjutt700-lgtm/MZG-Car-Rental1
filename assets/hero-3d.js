import * as THREE from 'three';
import { GLTFLoader } from './three/GLTFLoader.js';
import { DRACOLoader } from './three/DRACOLoader.js';
import { RoomEnvironment } from './three/RoomEnvironment.js';

const host=document.querySelector('#sports-scene');
const hero=document.querySelector('.sports-hero');
const button=document.querySelector('#hero-motion');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let userPaused=reduced.matches,visible=false,ready=false,frame=0,last=0,time=0,distance=0,scrollProgress=0;
let renderer,scene,camera,car,body,wheels=[],markings=[],buildings=[];
const radius=.358;
const status=host.querySelector('.scene-status');
const updateButton=()=>{button.disabled=reduced.matches;if(reduced.matches){button.setAttribute('aria-pressed','true');button.setAttribute('aria-label','Animation disabled by reduced motion preference');button.innerHTML='◼ <span>Motion reduced</span>';return;}button.setAttribute('aria-pressed',String(userPaused));button.setAttribute('aria-label',userPaused?'Play hero animation':'Pause hero animation');button.innerHTML=userPaused?'▶ <span>Play animation</span>':'Ⅱ <span>Pause animation</span>';};
function shouldRun(){return ready&&visible&&!document.hidden&&!userPaused&&!reduced.matches;}
function stop(){cancelAnimationFrame(frame);frame=0;last=0;host.dataset.rendering='paused';}
function sync(){stop();if(shouldRun()){host.dataset.rendering='running';frame=requestAnimationFrame(tick);}else if(ready)render();}
button.addEventListener('click',()=>{userPaused=!userPaused;updateButton();sync();});
reduced.addEventListener('change',()=>{userPaused=reduced.matches;updateButton();sync();});
document.addEventListener('visibilitychange',sync);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0}).observe(hero);
window.addEventListener('scroll',()=>{scrollProgress=Math.min(1,Math.max(0,-hero.getBoundingClientRect().top/hero.offsetHeight));},{passive:true});
function resize(){if(!renderer)return;const {width,height}=host.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();render();}
function render(){if(!ready)return;const portrait=camera.aspect<1.3;const framing=1+scrollProgress*.025;camera.position.set(6.5*framing,1.75+scrollProgress*.1,-3.7*framing);if(portrait)camera.position.multiplyScalar(1.17);camera.lookAt(0,.48,0);renderer.render(scene,camera);}
function tick(now){frame=0;if(!shouldRun()){stop();return;}const dt=last?Math.min((now-last)/1000,.05):0;last=now;const speed=2.6*(1+scrollProgress*.3);const travel=dt*speed;distance+=travel;time+=dt;
 // Car faces world -Z. Road travels +Z; camera sees +Z as screen-left.
 for(const wheel of wheels)wheel.rotation.x-=travel/radius;
 for(const mark of markings)mark.position.z=((mark.userData.start+distance+30)%60)-30;
 for(const building of buildings)building.position.z=((building.userData.start+distance*.28+60)%120)-60;
 // Tyres stay planted: only the sprung body moves by less than 2 mm.
 body.position.y=body.userData.baseY+Math.sin(time*5.2)*.0015;
 scene.environmentRotation.y=Math.sin(time*.19)*.035;
 host.dataset.travel=distance.toFixed(4);host.dataset.wheelAngle=wheels[0].rotation.x.toFixed(4);host.dataset.speed=speed.toFixed(3);
 render();frame=requestAnimationFrame(tick);
}
async function init(){try{
 renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.setClearColor(0x14282d,0);host.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
 scene=new THREE.Scene();scene.fog=new THREE.Fog(0x20363b,7,32);camera=new THREE.PerspectiveCamera(33,1,.1,100);
 const pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();const env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xe0f0ff,0x354147,1.5));const key=new THREE.DirectionalLight(0xfff6e8,2);key.position.set(-3,6,-4);scene.add(key);const rim=new THREE.DirectionalLight(0xbed9e1,1.5);rim.position.set(5,3,2);scene.add(rim);
 const road=new THREE.Mesh(new THREE.PlaneGeometry(35,130),new THREE.MeshStandardMaterial({color:0x101c20,roughness:.9,metalness:.08}));road.rotation.x=-Math.PI/2;road.position.y=-.01;scene.add(road);
 const stripeMaterial=new THREE.MeshStandardMaterial({color:0xc7d0cc,roughness:.8});
 for(const x of [-2.25,2.25])for(let z=-30;z<30;z+=6){const mark=new THREE.Mesh(new THREE.PlaneGeometry(.09,2.5),stripeMaterial);mark.rotation.x=-Math.PI/2;mark.position.set(x,.002,z);mark.userData.start=z;scene.add(mark);markings.push(mark);}
 for(let i=0;i<32;i++){const height=1.2+((i*7)%11)*.22;const building=new THREE.Mesh(new THREE.BoxGeometry(1.5+(i%3),height,2),new THREE.MeshStandardMaterial({color:i%2?0x172c31:0x1c3036,roughness:1}));building.position.set(-12-(i%4)*1.6,height/2,-60+i*3.75);building.userData.start=building.position.z;scene.add(building);buildings.push(building);}
 const draco=new DRACOLoader();draco.setDecoderPath('/assets/three/');draco.setWorkerLimit(1);const loader=new GLTFLoader();loader.setDRACOLoader(draco);const gltf=await loader.loadAsync('/assets/three/ferrari.glb');car=gltf.scene.children[0];
 body=car.getObjectByName('main');body.userData.baseY=body.position.y;
 car.getObjectByName('body').material=new THREE.MeshPhysicalMaterial({color:0xc5ced3,metalness:.95,roughness:.23,clearcoat:1,clearcoatRoughness:.1});
 // A curved, physically modelled hardtop closes the original open cabin.
 const roofGeometry=new THREE.BufferGeometry();const roofVertices=[],roofIndices=[];const rows=16,cols=16;
 for(let j=0;j<=rows;j++){const z=-.72+j/rows*1.55;for(let i=0;i<=cols;i++){const u=i/cols*2-1;const taper=1-.14*Math.pow((j/rows-.4)*2,2);roofVertices.push(u*.74*taper,1.22+.045*(1-u*u)-.055*Math.pow((j/rows-.45)*2,2),z);}}
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+cols+1;roofIndices.push(a,b,a+1,b,b+1,a+1);}roofGeometry.setAttribute('position',new THREE.Float32BufferAttribute(roofVertices,3));roofGeometry.setIndex(roofIndices);roofGeometry.computeVertexNormals();const roof=new THREE.Mesh(roofGeometry,car.getObjectByName('body').material.clone());roof.material.side=THREE.DoubleSide;car.add(roof);
 const rearWindow=new THREE.Mesh(new THREE.PlaneGeometry(1.12,.47),new THREE.MeshPhysicalMaterial({color:0x172d35,metalness:.2,roughness:.15,side:THREE.DoubleSide}));rearWindow.position.set(0,1.035,.97);rearWindow.rotation.x=-.8;car.add(rearWindow);
 const windowMaterial=new THREE.MeshPhysicalMaterial({color:0x20333c,metalness:.35,roughness:.12,transparent:true,opacity:.9,side:THREE.DoubleSide});
 for(const side of [-1,1]){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute([side*.8,.84,-1.01,side*.68,1.21,-.68,side*.71,1.21,.75,side*.81,.84,1.08],3));geometry.setIndex([0,1,2,0,2,3]);geometry.computeVertexNormals();car.add(new THREE.Mesh(geometry,windowMaterial));
 for(const points of [[[side*.8,.84,-1.01],[side*.68,1.21,-.68]],[[side*.71,1.21,.75],[side*.81,.84,1.08]]]){const from=new THREE.Vector3(...points[0]),to=new THREE.Vector3(...points[1]),direction=to.clone().sub(from);const pillar=new THREE.Mesh(new THREE.CylinderGeometry(.027,.035,direction.length(),8),car.getObjectByName('body').material);pillar.position.copy(from).add(to).multiplyScalar(.5);pillar.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());car.add(pillar);}}
 const alloy=new THREE.MeshStandardMaterial({color:0xc5cbd0,metalness:1,roughness:.27});for(const name of ['rim_fl','rim_fr','rim_rl','rim_rr','trim'])car.getObjectByName(name).material=alloy;
 car.getObjectByName('glass').material=new THREE.MeshPhysicalMaterial({color:0x263b44,metalness:.25,roughness:.08,transparent:true,opacity:.82});
 wheels=['wheel_fl','wheel_fr','wheel_rl','wheel_rr'].map(name=>car.getObjectByName(name));
 const shadowTexture=await new THREE.TextureLoader().loadAsync('/assets/three/ferrari_ao.png');const shadow=new THREE.Mesh(new THREE.PlaneGeometry(.655*4,1.3*4),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,blending:THREE.MultiplyBlending,toneMapped:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.006;car.add(shadow);scene.add(car);draco.dispose();
 ready=true;status.remove();host.dataset.ready='true';host.dataset.orientation='right';host.dataset.wheels=String(wheels.length);new ResizeObserver(resize).observe(host);resize();sync();
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();stop();ready=false;const note=document.createElement('p');note.className='scene-status';note.textContent='The 3D scene is temporarily unavailable. You can still explore our fleet.';host.append(note);});
 }catch(error){stop();status.textContent='The driving scene could not load. Explore our fleet below.';host.dataset.error='true';console.error('Hero scene failed:',error);}}
updateButton();init();
