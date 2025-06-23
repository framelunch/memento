// ファイル: FaceMeshViewer.tsx
import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { FACEMESH_TRIANGLES } from '../../data/facemesh_triangles';
import { useEffect } from 'react';

// Props: landmarksとtextureImgは親コンポーネントから渡す
export default function FaceMeshViewer({
  landmarks, // [{x, y, z}, ...] in 0〜1 range
  textureImg, // HTMLImageElement or URL
}: {
  landmarks: { x: number; y: number; z: number }[];
  textureImg: HTMLImageElement | string;
}) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();

    // 頂点位置
    const positions = new Float32Array(landmarks.length * 3);
    const uvs = new Float32Array(landmarks.length * 2);

    const aspect = textureImg.naturalWidth / textureImg.naturalHeight; // アスペクト比
    const scale = 1.0;

    for (let i = 0; i < landmarks.length; i++) {
      const { x, y, z } = landmarks[i];
      positions[i * 3 + 0] = (x - 0.5) * scale * aspect * -1;
      positions[i * 3 + 1] = -(y - 0.5) * scale;
      positions[i * 3 + 2] = -z * scale;

      // UV（そのまま x, y を使う）
      uvs[i * 2 + 0] = x;
      uvs[i * 2 + 1] = 1 - y;
    }

    const indices = new Uint16Array(FACEMESH_TRIANGLES.length * 3);
    for (let i = 0; i < FACEMESH_TRIANGLES.length; i++) {
      const [a, b, c] = FACEMESH_TRIANGLES[i];
      indices.set([a, b, c], i * 3);
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(new THREE.BufferAttribute(indices, 1));
    geo.computeVertexNormals();

    return geo;
  }, [landmarks]);

  const texture = useMemo(() => {
    if (typeof textureImg === 'string') {
      return new THREE.TextureLoader().load(textureImg);
    } else {
      const tex = new THREE.Texture(textureImg);
      tex.needsUpdate = true;
      return tex;
    }
  }, [textureImg]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      texture.dispose?.();
    };
  }, []);

  return (
    <Canvas camera={{ position: [0, 0, 0.8], fov: 45 }}>
      <ambientLight />
      <mesh geometry={geometry}>
        <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
    </Canvas>
  );
}
