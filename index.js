// import { GammaCorrectionShader } from 'https://rawgit.com/mrdoob/three.js/dev/examples/jsm/shaders/GammaCorrectionShader.js';
console.log("THREE.ShaderPass",THREE.ShaderPass)
var camera, light, renderer, composer, mixer, loader, clock,finalComposer,bloomComposer;
var scene, mesh, outlinePass;
var height = window.innerHeight,
  width = window.innerWidth;
var clearColor = '#000000';
const modelUel = "./m.glb"
const bloomLayer = new THREE.Layers();
bloomLayer.set( 1 );
load();

const params = {
  exposure: 4,
  bloomStrength: 2,
  bloomThreshold: 1,
  bloomRadius: 2,
  scene: 'Scene with Glow'
};
function load() {
  loader = new THREE.GLTFLoader();
  clock = new THREE.Clock();
  scene = new THREE.Scene();
//   loader.load("https://cdn.rawgit.com/mrdoob/three.js/45418089bd5633e856384a8c0beefced87143334/examples/models/gltf/Horse.glb", function(obj) {
    loader.load("./m.glb", function(obj) {
    scene.add(obj.scene);
    obj.scene.scale.setX(50)
    obj.scene.scale.setY(50)
    obj.scene.scale.setZ(50)
    mixer = new THREE.AnimationMixer(obj.scene);
    var clip = THREE.AnimationClip.findByName(obj.animations,
      'Armature|mixamo.com|Layer0');
    var a = mixer.clipAction(clip);
    a.reset();
    a.play();

    mesh = obj.scene;
    // mesh.position.set(-7, 2.5, -7);

    init();
    animate();


  });
}
function renderParticles (isleftArm){
  const geometry = new THREE.SphereGeometry( 2, 10, 10);
  // console.log("HI",geometry)
  console.log("HI")
  for ( let i = 0; i < 20; i ++ ) {

    const color = new THREE.Color('#ab981d');
    // color.setHSL( Math.random(), 0.7, Math.random() * 0.2 + 0.05 );

    const material = new THREE.MeshBasicMaterial( { color: color } );
    const sphere = new THREE.Mesh( geometry, material );
    sphere.position.x = isleftArm*(10 +Math.random()*15);
    sphere.position.y =  26+Math.random()*44 ;
    sphere.position.z = -8 + Math.random()*18;
    // sphere.position.normalize().multiplyScalar( Math.random() * 4.0  + 2.0 );
    sphere.scale.setScalar( Math.random() * Math.random()/4 + 0.2 );
    sphere.layers.enable( 1 );
    scene.add( sphere );

    // if ( Math.random() < 0.25 ) sphere.layers.enable( BLOOM_SCENE );

  }

}
function init() {


  initCamera();
  initScene();
  initRenderer();
  var controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.enablePan = false;
  controls.maxPolarAngle = Math.PI/1.8;
  controls.minPolarAngle = Math.PI/2.2;
  controls.target.y = 40;
  controls.update();
  controls.enableZoom=false
  initComposer();
  renderParticles(1)
  renderParticles(-1)
  outlinePass.selectedObjects = [mesh];
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(30, width / height, 0.001, 10000);
  camera.position.set(0, 50, 250);
  camera.lookAt(0, 40, 0);
}

function initScene() {
  light = new THREE.AmbientLight(0xffffff,1.2)
  scene.add(light);

}
 
function addLights() {
  const amplight = new THREE.AmbientLight("#ffffff", 1);
  let lightFront = new THREE.DirectionalLight(0xffffff, 3, 100);
  let lightBack = new THREE.SpotLight(0xffffff, 1);
  let PointLight = new THREE.PointLight(0xffffff, 0.5);
  // let rect = new THREE.RectAreaLight(0xffffff,0.4,2,2)
  // rect.position.set(0, -1, 6);

  // scene.add(rect)
  lightBack.position.set(0, 0.4, -0.7);
  lightFront.position.set(0, 0.7, 0.9);
  // PointLight.position.set(10, 0, 20);

  lightFront.castShadow = true;
  // lightFront.shadowMapWidth = lightFront.shadowMapHeight = 1024 * 2;
  //Set up shadow properties for the light
  lightFront.shadow.mapSize.width = 512 * 4; // default
  lightFront.shadow.mapSize.height = 512 * 4; // default
  lightFront.shadow.camera.near = 0.5; // default
  lightFront.shadow.camera.far = 500; // default
  // lightFront.shadow.focus = 1; // default

  // const light1 = new THREE.SpotLightHelper(lightBack);
  // const light2 = new THREE.SpotLightHelper(lightFront);
  // const light3 = new THREE.PointLightHelper(PointLight);

  // scene.add(light1);
  // scene.add(light2);
  // scene.add(light3);

  scene.add(amplight);
  scene.add(lightBack);
  scene.add(lightFront);
  scene.add(PointLight)
}
function initRenderer() {
  // THREE.WebGLRenderer.gammaFactor=  3.2
  renderer = new THREE.WebGLRenderer({
    width: width,
    height: height,
    antialias: true,
    logarithmicDepthBuffer:true,
    
  });
  renderer.gammaFactor = 2.2;

  renderer.pixelRatio=0.1
  // renderer.toneMapping = THREE.NoToneMapping;
  renderer.setSize(width, height);

  renderer.physicallyCorrectLights = true
  document.body.appendChild(renderer.domElement);
}
addLights()
function initComposer() {
  var renderPass, copyPass;

  composer = new THREE.EffectComposer(renderer);

  renderPass = new THREE.RenderPass(scene, camera);
  
  composer.addPass(renderPass);
  
  outlinePass = new THREE.OutlinePass(new THREE.Vector2(width, height),
  scene, camera);
  composer.addPass(outlinePass);
  
  const gammaCorrectionPass = new THREE.ShaderPass( THREE.GammaCorrectionShader );
  composer.addPass( gammaCorrectionPass );
  outlinePass.edgeStrength = 2.5;
  outlinePass.edgeThickness = 3;
  outlinePass.visibleEdgeColor.set('#ffddaa');
  outlinePass.BlurDirectionX = new THREE.Vector2(0.0, 0.0);
  outlinePass.BlurDirectionY = new THREE.Vector2(0.0, 0.0);

  const bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 0, 0, 0.5 );
	console.log("bloomPass",bloomPass)		
  // bloomPass.threshold = params.bloomThreshold;
			// bloomPass.strength = params.bloomStrength;
			// bloomPass.radius = params.bloomRadius;

   bloomComposer = new THREE.EffectComposer( renderer );
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass( renderPass );
  bloomComposer.addPass( bloomPass );

  const finalPass = new THREE.ShaderPass(
    new THREE.ShaderMaterial( {
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture }
      },
      vertexShader: document.getElementById( 'vertexshader' ).textContent,
      fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
      defines: {}
    } ), 'baseTexture'
  );
  finalPass.needsSwap = true;

   finalComposer = new THREE.EffectComposer( renderer );
  finalComposer.addPass( renderPass );
  finalComposer.addPass( finalPass );


}

	window.onresize = function () {

				const width = window.innerWidth;
				const height = window.innerHeight;

				camera.aspect = width / height;
				camera.updateProjectionMatrix();

				renderer.setSize( width, height );

				composer.setSize( width, height );
				// composer.setSize( width, height );

				render();

			};

function animate() {
  var delta = clock.getDelta();
  requestAnimationFrame(animate);
  update(delta);
  render(delta);
}

function update(delta) {
  if (mixer) mixer.update(delta);
}

function render(delta) {
  composer.render();
  // scene.traverse( darkenNonBloomed );
  // bloomComposer.render();
  // scene.traverse( restoreMaterial );
  // finalComposer.render();

}
