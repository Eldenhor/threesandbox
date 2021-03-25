import React, { Suspense, useEffect, useState, useMemo, useRef } from 'react';
import styled from "styled-components";
import { Canvas, extend, useFrame, useLoader, useThree } from "react-three-fiber";
import { Box, OrbitControls, Plane, Reflector, Text, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { useReflector } from "../../hooks/useReflector";
import usePostprocessing from "../../hooks/usePostprocessing";
import { HDRCubeTextureLoader } from "three/examples/jsm/loaders/HDRCubeTextureLoader";
import Roboto from "../../fonts/Roboto_Medium_Regular.json";

// convert THREE components to react-three-fiber
extend({EffectComposer, ShaderPass, RenderPass, UnrealBloomPass, SSAOPass,});

const AparmentSceneWrapper = styled.div`
  width: 100%;
  height: 800px;
  background-color: rgb(52, 52, 52);

  position: relative;
`;

const Apartments = (props) => {
  const group = useRef();

  // load gltf files (include meshes, materials and textures)
  const {nodes, materials} = useGLTF('/apartments_base.gltf');

  // load additional textures
  const lightMapTexture = new THREE.TextureLoader().load("lightmap_baked.jpg");

  // change material settings
  useMemo(() => {
    // wall
    materials.wallMaterial.color.set(props.buttonPressed ? "#3fa9c4" : "#525c62");
    materials.wallMaterial.metalness = 0.4;
    materials.wallMaterial.roughness = 0.9;
    // materials.wallMaterial.aoMap = null;

    // roof
    materials.roofMaterial.color.set("#949494");
    materials.roofMaterial.metalness = 0.4;
    materials.roofMaterial.roughness = 0.9;
    materials.roofMaterial.aoMapIntensity = 0.6;

    // floor
    materials.floorMaterial.normalScale = new THREE.Vector2(0.1, 0.1);
    materials.floorMaterial.normalMap = null;
    materials.floorMaterial.aoMapIntensity = 0.6;
    // materials.floorMaterial.aoMap = null;

    // backdrop
    materials.backDropMaterial.color.set("#1f1f1f");
    materials.backDropMaterial.emissiveIntensity = 2.5;

    // baseboard
    materials.baseboardMaterial.color.set("#a58f7f");

    // window frame
    materials.windowFrameMaterial.color.set("#b7acac");

    // lightMap settings
    // lightMap uv flipped by default, need to fix it
    lightMapTexture.flipY = false;

    materials.wallMaterial.lightMap = lightMapTexture;
    materials.wallMaterial.lightMapIntensity = 1.0;

    materials.floorMaterial.lightMap = lightMapTexture;
    materials.floorMaterial.lightMapIntensity = 1.0;

    materials.roofMaterial.lightMap = lightMapTexture;
    materials.roofMaterial.lightMapIntensity = 1.0;

    // materials.wallMaterial.map = texture;
    // materials.wallMaterial.aoMap = null;

  }, [materials, lightMapTexture, props.buttonPressed]);

  // file structure can be generated from "npx gltfjsx filename.gltf", it creates jsx file with
  // extracted meshes and materials
  return (
      <group ref={group} {...props} dispose={null}>
        <group position={[-1.44, 1.42, -5.08]}>
          <mesh
              castShadow={true} receiveShadow={true}
              material={materials.windowFrameMaterial}
              geometry={nodes.windowFrame.geometry}
              position={[0, 0, 0]}/>
        </group>
        <group position={[2.07, 1.42, -5.08]}>
          <mesh
              castShadow={true}
              receiveShadow={true}
              material={materials.windowFrameMaterial}
              geometry={nodes.windowFrame001.geometry}
              position={[0, 0, 0]}/>
        </group>
        <mesh
            castShadow={true}
            receiveShadow={true}
            material={materials.wallMaterial}
            geometry={nodes.Apartments_base.geometry}>
        </mesh>
        <mesh
            castShadow={true}
            receiveShadow={true}
            material={materials.baseboardMaterial}
            geometry={nodes.baseBoard.geometry}
            position={[0, 0, 0]}/>
        <mesh
            castShadow={true}
            receiveShadow={true}
            material={materials.baseboardMaterial}
            geometry={nodes.doorjamb.geometry}/>
        {/*<mesh*/}
        {/*    castShadow={true}*/}
        {/*    receiveShadow={true}*/}
        {/*    material={materials.floorMaterial}*/}
        {/*    geometry={nodes.apartment_floor.geometry}/>*/}
        <mesh
            castShadow={true}
            receiveShadow={true}
            material={materials.roofMaterial}
            geometry={nodes.apartment_roof.geometry}/>
        <mesh
            material={materials.backDropMaterial}
            geometry={nodes.backDrop.geometry}
            position={[4.2, 7.0, -60.0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[2.7, 2.7, 2.7]}
        />
      </group>
  );
};

const FurnitureChest = (props) => {
  const group = useRef();
  const {nodes, materials} = useGLTF('/apartment_chest.gltf');

  useMemo(() => {
    materials.furniture_white_polished_Material.color.set("#5a5352");
    materials.furniture_white_polished_Material.roughness = 0.1;

    materials.furniture_light_wood_Material.color.set("#a28e87");
  }, [materials]);


  return (
      <group ref={group} {...props} dispose={null}>
        <mesh
            castShadow={true}
            receiveShadow={true}
            material={materials.furniture_white_polished_Material}
            geometry={nodes.chest_white.geometry}
            position={[0, 0.2, 0.05]}
            scale={[2.54, 2.54, 2.54]}
        />
        <mesh
            castShadow={true}
            receiveShadow={true}
            material={materials.furniture_light_wood_Material}
            geometry={nodes.chest_wood.geometry}
            position={[-0.63, 0, 0.23]}
            scale={[2.54, 2.54, 2.54]}
        />
      </group>
  );
};


const Chair = (props) => {
  const group = useRef();
  const {nodes, materials} = useGLTF('/chair.gltf');

  const material = new THREE.MeshPhysicalMaterial({
    color: "#000000",
    specular: "#ffffff",
    roughness: 0.0,
    reflectivity: 1.0,
    shininess: 50,
    envMapIntensity: 10.0
  });

  useMemo(() => {
    materials.chair_leather_Material.color.set("#5a5352");
    materials.chair_leather_Material.roughness = 0.3;
    materials.chair_leather_Material.normalScale = new THREE.Vector2(1.0, 1.0);
  }, [materials]);

  return (
      <group ref={group} {...props} dispose={null}>
        <mesh
            castShadow={true}
            receiveShadow={true}
            material={material}
            geometry={nodes.chair_chrome.geometry}
            position={[-0.7, 0, 0]}/>
        <mesh
            material={materials.chair_leather_Material}
            geometry={nodes.chair_leather.geometry}
            position={[-0.7, 0, 0]}
        />
      </group>
  );
};


const Sofa = (props) => {
  const group = useRef();
  const {nodes} = useGLTF('/sofa.gltf');

  const material = new THREE.MeshPhysicalMaterial({
    color: "#000000",
    // specular: "#ffffff",
    roughness: 0.0,
    reflectivity: 1.0,
    // shininess: 50,
    envMapIntensity: 10.0
  });

  const leather = new THREE.MeshPhysicalMaterial({
    color: "#060606",
    roughness: 0.1,
    reflectivity: 0.1,
    envMapIntensity: 1.0
  });

  return (
      <group ref={group} {...props} dispose={null}>
        <mesh
            castShadow={true}
            receiveShadow={true}
            material={material}
            geometry={nodes.sofa_chrome.geometry}
            position={[-0.6, 0.09, 0.03]}
        />
        <mesh
            castShadow={true}
            receiveShadow={true}
            material={leather}
            geometry={nodes.sofa_Leather.geometry}
            position={[-0.6, 0.23, -0.14]}
        />
      </group>
  );
};


const Table = (props) => {
  const {scene, gl} = useThree();
  const group = useRef();
  const {nodes, materials} = useGLTF('/table.gltf');
  // // The cubeRenderTarget is used to generate a texture for the reflective sphere.
  // // It must be updated on each frame in order to track camera movement and other changes.
  // const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
  //   format: THREE.RGBFormat,
  //   generateMipmaps: true,
  //   minFilter: THREE.LinearMipmapLinearFilter
  // });
  // const cubeCamera = new THREE.CubeCamera(1, 100, cubeRenderTarget);
  // cubeCamera.position.set(2, 0, 0);
  // scene.add(cubeCamera);
  //
  // // Update the cubeCamera with current renderer and scene.
  // useFrame(() => cubeCamera.update(gl, scene));

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: "#060606",
    roughness: 0.0,
    reflectivity: 0.0,
    envMapIntensity: 8.0,
    refractionRatio: 0.9,
    transparent: true,
    opacity: 0.5
  });

  return (
      <group ref={group} {...props} dispose={null}>
        <mesh material={glassMaterial} geometry={nodes.table_glass.geometry} visible={true} position={[0, 0, 0]}>
          {/*<meshPhysicalMaterial*/}
          {/*    attach="material"*/}
          {/*    // envMap={cubeCamera.renderTarget.texture}*/}
          {/*    color={"#7f837c"}*/}
          {/*    roughness={0.0}*/}
          {/*    metalness={0.5}*/}
          {/*    // refractionRatio={0.9}*/}
          {/*    transparent={true}*/}
          {/*    opacity={0.8}*/}
          {/*/>*/}
        </mesh>
        <mesh material={materials.table_metal} geometry={nodes.table_metal.geometry}/>
        <mesh material={materials.table_black_metal} geometry={nodes.table_legs.geometry}/>
      </group>
  );
};

const WallLight = (props) => {
  const group = useRef();
  const {nodes, materials} = useGLTF('/light.gltf');

  useMemo(()=>{
    materials.light_lamp.emissive.set("#ffffff")
    materials.light_lamp.emissiveIntensity = 10.0
  }, [materials])

  return (
      <group ref={group} {...props} dispose={null}>
        <pointLight
            intensity={1}
            distance={1.0}
            color={"#ffe3d7"}
            position={[-0.2, 0.06, 0]}/>
        />
        <mesh
            material={materials.light_metal}
            geometry={nodes.light_metal.geometry}
            position={[0, 0.21, 0]}/>
        <mesh
            material={materials.light_lamp}
            geometry={nodes.light_lamp.geometry}
            position={[-0.09, 0.06, 0]}/>
      </group>
  );
};


// preload gltf
useGLTF.preload('/sofa.gltf');
useGLTF.preload('/chair.gltf');
useGLTF.preload('/table.gltf');
useGLTF.preload('/light.gltf');
useGLTF.preload('/apartment_chest.gltf');
useGLTF.preload('/apartments_base.gltf');


function Environment({background = false}) {
  const {gl, scene} = useThree();
  const [cubeMap] = useLoader(HDRCubeTextureLoader, [['px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr']], loader => {
    loader.setDataType(THREE.UnsignedByteType);
    loader.setPath('/hdri/');
  });
  useEffect(() => {
    const gen = new THREE.PMREMGenerator(gl);
    gen.compileEquirectangularShader();
    const hdrCubeRenderTarget = gen.fromCubemap(cubeMap);
    cubeMap.dispose();
    gen.dispose();
    if (background) scene.background = hdrCubeRenderTarget.texture;
    scene.environment = hdrCubeRenderTarget.texture;
    return () => (scene.environment = scene.background = null);
  }, [cubeMap]);
  return null;
}

const MyLight = ({intensity = 1}) => {
  // custom light object
  const light = new THREE.DirectionalLight(0xffffff, intensity, 10);

  // light settings
  light.position.set(20, 20, -40);
  light.castShadow = true;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  // fix self shadow artifacts
  light.shadow.bias = -0.0005;
  light.shadow.camera.near = 1;
  light.shadow.camera.far = 100;
  light.shadow.camera.top = -8;
  light.shadow.camera.right = 8;
  light.shadow.camera.left = -8;
  light.shadow.camera.bottom = 8;

  // visual light helper
  // const helper = new THREE.DirectionalLightHelper(light, 5);

  return (
      <>
        <primitive object={light}/>
        {/*<primitive object={helper}/>*/}
      </>
  );
};

const Logo = () => {

  // let font = null;
  // const loader = new THREE.FontLoader();
  // loader.load("Roboto_Medium_Regular.json", function (response) { font = response})

  // const [cubeMap] = useLoader(HDRCubeTextureLoader, [['px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr']], loader => {
  //   loader.setDataType(THREE.UnsignedByteType);
  //   loader.setPath('/hdri/');
  // });
  const logo = useRef();
  useFrame(() => {
    logo.current.rotation.x = logo.current.rotation.x += 0.01;
  });

  const font = new THREE.FontLoader().parse(Roboto);
  const geometry = new THREE.TextGeometry("GM", {
    font: font,
    size: 0.8,
    height: 0.2,
  });
  const material = new THREE.MeshStandardMaterial({
    color: "#000000",
    // envMap: cubeMap,
    // refractionRatio: 0.9
    roughness: 0.1
  });
  const textMesh = new THREE.Mesh(geometry, material);

  return (
      <primitive castShadow={true}
                 receiveShadow={true}
                 ref={logo}
                 position={[-2.94, -0.2, -2]} object={textMesh}/>
  );
};


const FlowBox = () => {
  const box = useRef();
  useFrame(() => {
    box.current.rotation.y = box.current.rotation.y += 0.01;
  });

  const geometry = new THREE.IcosahedronGeometry(0.4);
  const material = new THREE.MeshStandardMaterial({
    color: "#000000",
    metalness: 0.1,
    roughness: 0.0
  });
  const boxMesh = new THREE.Mesh(geometry, material);

  return (
      <primitive castShadow={true}
                 receiveShadow={true}
                 position={[0, -0.34, 0]}
                 ref={box} object={boxMesh}/>
  );
};

const MainScene = () => {

  const [meshRef, ReflectorMaterial, passes] = useReflector();
  usePostprocessing(passes);

  return (
      <scene>
        <hemisphereLight intensity={0.8}/>
        <MyLight intensity={8}/>
        <Apartments position={[0.5, -1.4, 0.4]}/>
        <Environment/>
        <FurnitureChest position={[0.2, -1.4, 0]}
                        rotation={[0, Math.PI / -2, 0]}
        />
        <Chair
            position={[-2.2, -1.4, -1.8]}
            rotation={[0, Math.PI / 4, 0]}
        />
        <Chair
            position={[-2.8, -1.4, 0.6]}
            rotation={[0, Math.PI / 2, 0]}
        />
        <Sofa
            position={[-0.2, -1.4, 1.4]}
            rotation={[0, Math.PI / -1.5, 0]}
        />
        <Table
            position={[-2.8, -1.4, 0.0]}
            rotation={[0, Math.PI / -2, 0]}
        />
        <WallLight
            position={[-3.17, 0.4, 1.6]}
            rotation={[0, Math.PI, 0]}
        />
        <WallLight
            position={[-3.17, 0.4, -1.8]}
            rotation={[0, Math.PI, 0]}
        />
        {/*<Logo/>*/}
        {/*<FlowBox/>*/}
        <Plane position={[0, -1.4, 0]}
               receiveShadow
               ref={meshRef}
               rotation-x={-Math.PI / 2}
               args={[12, 12, 12]}
        >
          <ReflectorMaterial
              metalness={0.5}
              roughness={0.5}
              clearcoat={0.1}
              reflectorOpacity={0.1}
          />
        </Plane>
      </scene>
  );
};


export const ApartmentCalcPostReflector = () => {
      return (
          <AparmentSceneWrapper>
            <Canvas
                concurrent
                shadowMap
                gl={{alpha: true, antialias: false}}
                camera={{fov: 65}}
            >
              <OrbitControls/>
              <Suspense fallback={null}>
                <MainScene/>
              </Suspense>
            </Canvas>
          </AparmentSceneWrapper>
      );
    }
;
