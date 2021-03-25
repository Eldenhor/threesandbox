import React from 'react';
import { Canvas, useFrame } from "react-three-fiber";
import styled from "styled-components";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const AparmentSceneWrapper = styled.div`
  width: 100%;
  height: 800px;
  background-color: rgb(52, 52, 52);

  position: relative;
`;

const Plane = () => {
  const geometry = new THREE.PlaneGeometry(10, 10);
  const material = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    roughness: 1.0
  });
  const planeMesh = new THREE.Mesh(geometry, material);

  return (
      <primitive
          castShadow={true}
          receiveShadow={true}
          position={[0, 0, 0]}
          rotation-x={-Math.PI / 2}
          object={planeMesh}
      />
  );
};

const Box = () => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    roughness: 1.0
  });
  const boxMesh = new THREE.Mesh(geometry, material);

  return (
      <primitive
          castShadow={true}
          receiveShadow={true}
          position={[0, 0.5, 0]}
          rotation-x={-Math.PI / 2}
          object={boxMesh}
      />
  );
};

const Scene = () => {
  return (
      <scene>
        <Plane/>
        <Box/>
      </scene>
  );
};


export const CubeCamera = () => {
  return (
      <AparmentSceneWrapper>
        <Canvas
            shadowMap
        >
          <OrbitControls/>
          <ambientLight intensity={0.1}/>
          <spotLight position={[1, 2, 1]}/>
          <Scene/>
        </Canvas>
      </AparmentSceneWrapper>
  );
};
