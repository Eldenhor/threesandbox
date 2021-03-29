import React, { useState, Suspense } from "react";
import { Canvas} from "react-three-fiber";
import styled from "styled-components";
import * as THREE from 'three';
import { Html, OrbitControls, useProgress, useTexture } from "@react-three/drei";
import { SketchPicker } from "react-color";


const MaterialPickerWrapper = styled.div`
  width: 100%;
  height: 800px;
  background-color: rgb(52, 52, 52);
  position: relative;

  @media (max-width: 480px) {
    height: 280px;
  }
`;

const ColorPickerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
`

const ColorPicker = styled(SketchPicker)`
  margin: 20px;
`;

const Button = styled.button`
  padding: 8px;
  width: 220px;
`

const LoadingStatus = styled.p`
  display: flex;
  flex-direction: column;
  text-align: center;
  color: white
`

const BoxMesh = ({color}) => {

  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhysicalMaterial({
    color: color
  });

  const boxMesh = new THREE.Mesh(boxGeo, material);

  return (
      <primitive
          castShadow={true}
          receiveShadow={true}
          object={boxMesh}/>
  );
};


const PlaneMesh = ({color, textureName}) => {
  // useTexture.preload("/TexturesCom_Fabric_SilkMedieval_512_albedo.jpg")
  // useTexture.preload("/TexturesCom_Marble_TilesGeometric3_512_albedo.jpg")
  useTexture.preload("/checker.jpg")

  const loadingMap = useTexture(`/checker.jpg`)
  const colorMap = useTexture(`/${textureName}.jpg`)

  console.log(colorMap)

  const planeGeo = new THREE.PlaneGeometry(4, 4);
  const material = new THREE.MeshPhysicalMaterial({
    color: color,
    map: colorMap ? colorMap : loadingMap
  });

  const planeMesh = new THREE.Mesh(planeGeo, material);

  return (
      <primitive
          castShadow={true}
          receiveShadow={true}
          rotation={[Math.PI / -2, 0, 0]}
          position={[0, -1, 0]}
          object={planeMesh}
      />
  );
};

const Loader = () => {
  const {progress} = useProgress()
  return(
      <Html center>
        <LoadingStatus>
          <p>
            {progress}
          </p>
          <p>
            % loading
          </p>
        </LoadingStatus>
      </Html>
  )
}

export const MaterialPickerScene = () => {

  const [boxColor, setBoxColor] = useState("#ffffff");
  const [planeColor, setPlaneColor] = useState("#ffffff");
  const [textureName, setTextureName] = useState("TexturesCom_Marble_TilesGeometric3_512_albedo");

  const handleBoxPicker = (color) => {
    setBoxColor(color.hex);
  };
  const handlePlanePicker = (color) => {
    setPlaneColor(color.hex);
  };

  return (
      <MaterialPickerWrapper>
          <Canvas
              shadowMap
          >
            <Suspense fallback={null}>
              <React.Suspense fallback={<Loader/>}>
                <hemisphereLight intensity={0.1}/>
                <spotLight castShadow={true} position={[0.7, 2, 0.7]} intensity={0.4}/>
                <OrbitControls/>
                <BoxMesh color={boxColor}/>
                <PlaneMesh color={planeColor} textureName={textureName}/>
              </React.Suspense>
            </Suspense>
          </Canvas>
        <ColorPickerWrapper>
          <ColorPicker
              color={boxColor}
              onChangeComplete={handleBoxPicker}
          />
          <ColorPicker
              color={planeColor}
              onChangeComplete={handlePlanePicker}
          />
          <Button onClick={()=>setTextureName("TexturesCom_Fabric_SilkMedieval_512_albedo")}>
            Texture 1
          </Button>
          <Button onClick={()=>setTextureName("TexturesCom_Marble_TilesGeometric3_512_albedo")}>
            Texture 2
          </Button>
        </ColorPickerWrapper>
      </MaterialPickerWrapper>
  );
};