import * as THREE from "three";


// const lightMapTexture = new THREE.TextureLoader().load("lightmap_baked.jpg");

const texLoader = THREE.TextureLoader;

const marbleColor = texLoader.load("TexturesCom_Marble_TilesGeometric3_512_albedo.tif")

export const whiteTile = new THREE.MeshPhysicalMaterial({
  color: "#000000",
  colorMap: marbleColor,
  specular: "#ffffff",
  roughness: 0.0,
  reflectivity: 1.0,
  shininess: 50,
  envMapIntensity: 10.0
});