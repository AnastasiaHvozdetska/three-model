let container, stats;
let object;
let camera, scene, controls;

let mouse = new THREE.Vector2(),
  INTERSECTED;

let activeMaterial, activeMaterialName;

let dirLightShadowMapViewer, spotLightShadowMapViewer;

let dirLight, spotLight;

let canvas, bounds;

let lastIndex;

let defaultColor = 0xe7e7e7;

let canvasWidth, canvasHeight;

let modelName;


// init();
// animate();

document.addEventListener('DOMContentLoaded', function (e) {
  modelName = 'Bed_CityMin';
  init();
  animate();
})

function init() {

  initScene();
  initObject();

  initMisc();



  container = document.querySelector('.model-carousel');
  container.appendChild(renderer.domElement);


  canvas = document.querySelector('canvas');



  // window.addEventListener('resize', onWindowResize, false);


  // Click on single mesh of object.
  renderer.domElement.addEventListener('touchend', onDocumentTouch, false);
  renderer.domElement.addEventListener('click', onDocumentClick, false);

  // Turn off/on auto rotate.
  // document.querySelector('.js-btn-rotate').addEventListener('click', rotateControl, false);
  // document.querySelector('.js-btn-shadow').addEventListener('click', shadowToggle, false);

}


function initMisc() {

  // console.log(slide_container)
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvasWidth, canvasHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.needsUpdate = true;
  renderer.shadowMap.type = 2;
  // document.body.appendChild(renderer.domElement);

  // controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;

  controls.screenSpacePanning = false;
  controls.minDistance = 1.8;
  controls.maxDistance = 10;
  controls.maxPolarAngle = Math.PI / 2;
  controls.center.set(0, 0, 0);
  controls.autoRotate = false;
  controls.autoRotateSpeed = 1.3;
}

function onWindowResize() {
  canvasWidth = document.querySelector('.model-carousel').offsetWidth;
  canvasHeight = document.querySelector('.model-carousel').offsetHeight;
  
  renderer.setSize(canvasWidth, canvasHeight);
  camera.aspect = canvasWidth / canvasHeight;
  camera.updateProjectionMatrix();
}


// Choose specific material of all object.
function chooseMaterial(event, mouse) {
  lastIndex = scene.children.length - 1;


  let targets = scene.children[lastIndex].children;
  let raycaster = new THREE.Raycaster(),
    intersects;


  raycaster.setFromCamera(mouse, camera);
  intersects = raycaster.intersectObjects(targets);

  if (intersects.length > 0) {
    intersects[0].object.material.color.setHex(0x515151);

    activeMaterialName = intersects[0].object.material.name;
    activeMaterial = intersects[0].object.material;

    scene.children[lastIndex].traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        if (child.material.name === activeMaterialName) {
          child.material.color.setHex(0x515151);
        } else {
          child.material.color.setHex(defaultColor);
        }

      }
    })
  } else {
    for (material in scene.children[lastIndex].children) {
      scene.children[lastIndex].children[material].material.color.setHex(defaultColor);
    }
  }
}

document.addEventListener('click', function (e) {

  lastIndex = scene.children.length - 1;
  let object = scene.children[lastIndex];

  if (!(e.target).closest('canvas')) {
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material.color.setHex(defaultColor);
      }
    });
  };
});



function onDocumentClick(event) {
  let mouse = new THREE.Vector2();
  bounds = canvas.getBoundingClientRect();

  mouse.x = ((event.clientX - bounds.left) / canvas.clientWidth) * 2 - 1;
  mouse.y = -((event.clientY - bounds.top) / canvas.clientHeight) * 2 + 1;

  chooseMaterial(event, mouse);
}

function onDocumentTouch(event) {
  let mouse = new THREE.Vector2();
  bounds = canvas.getBoundingClientRect();

  mouse.x = +((event.changedTouches[0].clientX - bounds.left) / canvas.innerWidth) * 2 + -1;
  mouse.y = -((event.changedTouches[0].clientY - bounds.top) / canvas.innerHeight) * 2 + 1;

  chooseMaterial(event, mouse)
}


function rotateControl(event) {
  controls.autoRotate = !controls.autoRotate;
  controls.update();
}

// Change texture.
let texturesArray = document.querySelectorAll('.textures-list .list-item');

Array.from(texturesArray).forEach(texture => {
  texture.addEventListener('click', function () {
    if(!activeMaterial) {
      return
      // return alert('Choose the material')
    }

    for (let i = 0; i < texturesArray.length; i++) {
      texturesArray[i].classList.remove('active');
    }

    texture.classList.add('active');

    let textureName = texture.querySelector('img').getAttribute('value');
    let textureCategory = texture.querySelector('img').getAttribute('name');

    let newTexture = new THREE.TextureLoader()
    .setPath(`./texture/${textureCategory}/`)
    .load(textureName);

    newTexture.wrapS = newTexture.wrapT = THREE.RepeatWrapping;
    newTexture.offset.set( 0, 0 );
    newTexture.repeat.set( 2, 2 );
    newTexture.rotation = 90;

    activeMaterial.map = newTexture;
   })
})

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  render();
}

function render() {
  camera.lookAt(scene.position);
  camera.updateMatrixWorld();
  renderer.render(scene, camera);
}



// CREATING SCENE WITH LIGHTS, CAMERA AND SHADOWS
function initScene() {
	canvasWidth = document.querySelector('.model-carousel').offsetWidth;
	canvasHeight = document.querySelector('.model-carousel').offsetHeight;

	camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 2000 );
	// camera = new THREE.OrthographicCamera( window.innerWidth  / - 2, window.innerWidth  / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
	camera.position.set(-2.08, 0.87, 2.39);
	scene = new THREE.Scene();
	let fogColor = new THREE.Color(0xffffff);
	scene.background = fogColor;

	scene.fog = new THREE.Fog(fogColor, 1, 12000);
	scene.add(camera);


	// Lights
	spotLight = new THREE.SpotLight(0xffffff, 0.1);
	spotLight.name = 'Spot Light';
	spotLight.angle = Math.PI / 5;
	spotLight.penumbra = 0.3;

	spotLight.position.set(0, 15, 0);

	spotLight.castShadow = true;

	spotLight.shadow.camera.near = 0.5;
	spotLight.shadow.camera.far = 500;

	spotLight.shadow.mapSize.width = 2048;
	spotLight.shadow.mapSize.height = 2048;
	spotLight.shadow.radius = 1.5;

	scene.add(spotLight);

	// DIRECTIONAL LIGHT
	dirLight = new THREE.DirectionalLight(0xffffff, 1);
	dirLight.name = 'Dir. Light';
	dirLight.position.set(-2.5, 4, 2.8);

	scene.add(dirLight);


	// let helper = new THREE.CameraHelper(spotLight.shadow.camera, 5);
	// scene.add(helper);


	// AMBIENT LIGHT
	let ambientLight = new THREE.AmbientLight(0xfdfdfd, 0.4);

	scene.add(ambientLight);


	// GROUND
	let geometry = new THREE.BoxBufferGeometry(20, 0.001, 20);
	let material1 = new THREE.MeshLambertMaterial({
		color: 0xffffff,
		shininess: 10,
		specular: 0xffffff,
		opacity: 0.55
	});


	let ground = new THREE.Mesh(geometry, material1);
	ground.name = 'Ground';
	ground.castShadow = false;
	ground.receiveShadow = true;
	scene.add(ground);
}

// INITIALISATION OF OBJECT AND MTL FILE
function initObject() {
  // Show download progress.
  let onProgress = function ( xhr ) {
    
    if ( xhr.lengthComputable ) {
      // let percentComplete = xhr.loaded / xhr.total * 100;
      // console.log( Math.round( percentComplete, 2 ) + '% downloaded' );
      document.querySelector('.preloader-line').style.width = `${Math.round(  xhr.loaded / xhr.total * 100, 2 )}%`

      if(xhr.loaded / xhr.total * 100 === 100) {
        document.querySelector('.model-preloader').remove();
        document.querySelector('canvas').style.opacity = 1;
      }
    } 
  };

  let onError = function () { };

THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());

new THREE.MTLLoader()
  .setPath('/model/')
  .load(`${modelName}.mtl`, function (materials) {
    materials.preload();

    new THREE.OBJLoader()
      .setPath('/model/')
      .setMaterials(materials)
      .load(`${modelName}.obj`, function (object) {
        object.position.y = 0;

        object.traverse(function(child){
          if (child instanceof THREE.Mesh) {
            child.shadowMapNeedsUpdate = true;
            child.castShadow = true;
            child.receiveShadow = false;
          }
        })
       
        // ------------ RENDER
        scene.add(object);
      }, onProgress, onError);
  });

}