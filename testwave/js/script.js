/* eslint-disable no-undef */

window.onload = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const canvas = document.getElementById('canvas');

  canvas.setAttribute('width', width);
  canvas.setAttribute('height', height);

  const ball = {
    rotationY: 0.1,
    rotationX: 1.1,
  };

  /* ***********************????***************************** */
  // const camVector = new THREE.Vector3(0, 0, 0); // create once and reuse it!
  // let cam = {
  //   posY: 0,
  //   posX: 0,
  //   posZ: 4000
  // };

  const gui = new dat.GUI();
  gui.add(ball, 'rotationY').min(-0.2).max(10).step(0.001);
  gui.add(ball, 'rotationX').min(-0.2).max(10).step(0.001);

  /* ****************** Camera gui experimental *************** /
  // let cameraGui = new dat.GUI();
  // cameraGui.add(cam, 'posX').min(-500).max(1000).step(10);
  // cameraGui.add(cam, 'posY').min(-500).max(1000).step(10);
  // cameraGui.add(cam, 'posZ').min(-500).max(100000).step(10);

  /* ********************** Renderer setup ******************** */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setClearColor(0x111111);
  renderer.setSize(window.innerWidth, window.innerHeight);
  this.document.body.appendChild(renderer.domElement);

  /* ************************  CAMERA & SCENE SETUP ****************************** */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 45, 50000);
  camera.position.set(0, 0, 1500);
  // camera.rotateOnAxis(vector, 0.7);

  /* *********************** Axes on scene ******************************* */
  // const axes = new THREE.AxisHelper(20);
  // scene.add(axes);

  /* ************************  ORBIT ****************************** */
  const camControls = new THREE.OrbitControls(camera);
  camControls.addEventListener('change', renderer);
  camControls.minDistance = -1000;
  camControls.maxFidtance = 15000;

  /* ************************  MATERIALS SKYBOX  ****************************** */
  const materialArray = [];
  const textureFront = new THREE.TextureLoader().load('/img/penguins/sleepyhollow_ft.jpg');
  const textureBack = new THREE.TextureLoader().load('/img/penguins/sleepyhollow_bk.jpg');
  const textureUp = new THREE.TextureLoader().load('/img/penguins/sleepyhollow_up.jpg');
  const textureDown = new THREE.TextureLoader().load('/img/penguins/sleepyhollow_dn.jpg');
  const textureRight = new THREE.TextureLoader().load('/img/penguins/sleepyhollow_rt.jpg');
  const textureLeft = new THREE.TextureLoader().load('/img/penguins/sleepyhollow_lf.jpg');

  materialArray.push(new THREE.MeshBasicMaterial({ map: textureFront }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: textureBack }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: textureUp }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: textureDown }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: textureRight }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: textureLeft }));

  for (let i = 0; i < 6; i++) {
    materialArray[i].side = THREE.BackSide;
  }

  const skyboxGeo = new THREE.BoxGeometry(30000, 30000, 30000);
  const skybox = new THREE.Mesh(skyboxGeo, materialArray);
  scene.add(skybox);

  /* ********************* COMPOSER ********************************* */
  const composer = new THREE.EffectComposer(renderer);

  /* ************************PASSES ******************************* */
  const renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);

  const pass1 = new THREE.GlitchPass(0);
  composer.addPass(pass1);
  renderPass.renderToScreen = true;

  /** ****************** RENDER LOOP ****************************** */
  function animate() {
    composer.render();
    // renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  /* ************************** LIGHTS ***************************** */
  const light = new THREE.AmbientLight(0xffffff);
  scene.add(light);

  /* ************************** MATERIALS ***************************** */
  const material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    wireframe: true,
    vertexColors: THREE.FaceColors,
  });

  const roadMaterial = new THREE.MeshPhongMaterial({
    // color: 0x555555,
    map: new THREE.TextureLoader().load('/img/grid.jpg'),
    wireframe: false,
    wireframeLinewidth: 50,
    // vertexColors: THREE.FaceColors,
  });

  const sunMaterial = new THREE.MeshPhongMaterial({
    // color: 0x555555,
    map: new THREE.TextureLoader().load('/img/sun1.png'),
    wireframe: false,
    // wireframeLinewidth: 50,
    // vertexColors: THREE.FaceColors,
  });

  /* ************************** GEOMETRY - SPHERE ***************************** */
  const sphere = new THREE.SphereGeometry(200, 15, 15);
  const sphereMesh = new THREE.Mesh(sphere, material);
  sphereMesh.rotation.x = -90 * (Math.PI / 180);
  sphereMesh.position.y = 400;
  sphereMesh.position.x = -1000;
  sphereMesh.position.z = -3000;
  scene.add(sphereMesh);
  // for (let i = 0; i < sphere.faces.length; i++) {
  //   sphere.faces[i].color.setRGB(Math.random(), Math.random(), Math.random());
  // }

  // let sphere = new THREE.SphereGeometry(200, 15, 15);
  const sphereMesh2 = new THREE.Mesh(sphere, material);
  sphereMesh2.rotation.x = -90 * (Math.PI / 180);
  sphereMesh2.position.y = 200;
  sphereMesh2.position.x = -800;
  sphereMesh2.position.z = -2000;
  scene.add(sphereMesh2);

  // let sphere = new THREE.SphereGeometry(200, 15, 15);
  const sphereMesh3 = new THREE.Mesh(sphere, material);
  sphereMesh3.rotation.x = -90 * (Math.PI / 180);
  sphereMesh3.position.y = 300;
  sphereMesh3.position.x = 1200;
  sphereMesh3.position.z = -3000;
  scene.add(sphereMesh3);

  // let sphere = new THREE.SphereGeometry(200, 15, 15);
  const sphereMesh4 = new THREE.Mesh(sphere, material);
  sphereMesh4.rotation.x = -90 * (Math.PI / 180);
  sphereMesh4.position.y = 150;
  sphereMesh4.position.x = -1000;
  sphereMesh4.position.z = -500;
  scene.add(sphereMesh4);

  /* ************************  GEOMETRY - TEXT  ****************************** */
  const loader = new THREE.FontLoader();
  const font = loader.load('/img/helvetiker_bold.typeface.json');
  // let fontGeo = new THREE.TextGeometry('ELBRUS FURY ROAD', {font: font, size:120, height:100, material:0, bevelThickness: 1, extrudeMaterial:1});
  const fontMesh = new THREE.Mesh(font, roadMaterial);
  fontMesh.rotation.x = -90 * (Math.PI / 180);
  fontMesh.position.y = -200;
  scene.add(fontMesh);

  /* ************************  GEOMETRY - ROAD  ****************************** */
  const road = new THREE.PlaneGeometry(13000, 13000, 50, 50);
  const roadMesh = new THREE.Mesh(road, roadMaterial);
  roadMesh.rotation.x = -90 * (Math.PI / 180);
  roadMesh.position.y = -200;
  scene.add(roadMesh);

  /* ************************  GEOMETRY - SUN  ****************************** */
  const sun = new THREE.CircleGeometry(2000, 2000, 50, 50);
  const sunMesh = new THREE.Mesh(sun, sunMaterial);
  sunMesh.rotation.x = Math.PI / 180;
  sunMesh.rotation.z = Math.PI / 180;
  sunMesh.position.y = 500;
  sunMesh.position.x = -2500;
  sunMesh.position.z = -13000;
  scene.add(sunMesh);

  /* ************************  MOTION ****************************** */
  function loop() {
    // roadMesh.rotation.y = ball.rotationY;
    // roadMesh.rotation.x = ball.rotationX;
    // roadMesh.rotation.x = ball.rotationX;
    // console.log(camera.getWorldDirection());
    // camera.position.set(cam.posX, cam.posY, cam.posZ);
    // renderer.render(scene, camera);
    camera.position.z -= 5;
    requestAnimationFrame(() => { loop(); });
  }
  loop();
};
