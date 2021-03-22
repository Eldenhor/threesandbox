import React, { Suspense, useEffect, useState, useMemo, useRef } from 'react';
import styled from "styled-components";
import { Canvas, extend, useFrame, useThree } from "react-three-fiber";
import { Box, OrbitControls, Plane, Reflector, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";
import { useReflector } from "../../hooks/useReflector";
import usePostprocessing from "../../hooks/usePostprocessing";

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
    materials.wallMaterial.color.set(props.buttonPressed ? "#3fa9c4" : "#ff7650");
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
    materials.backDropMaterial.emissiveIntensity = 1.5;

    // baseboard
    materials.baseboardMaterial.color.set("#262424");

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

// preload gltf
useGLTF.preload('/apartments_base.gltf');

const MyLight = () => {
  // custom light object
  const light = new THREE.DirectionalLight(0xffffff, 3, 10);

  // light settings
  light.position.set(20, 20, -40);
  light.castShadow = true;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  // fix self shadow artifacts
  light.shadow.bias = -0.002;
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

const MainScene = () => {

  const [meshRef, ReflectorMaterial, passes] = useReflector();
  usePostprocessing(passes);

  return (
      <scene>
        <hemisphereLight intensity={0.8}/>
        <MyLight/>
        <Apartments position={[0.5, -1.4, 0.4]}/>
        <Plane position={[0, -1.4, 0]}
               receiveShadow
               ref={meshRef}
               rotation-x={-Math.PI / 2}
               args={[12, 12, 12]}
        >
          <ReflectorMaterial
              metalness={0.5}
              roughness={0.5}
              clearcoat={0.5}
              reflectorOpacity={0.2}
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
