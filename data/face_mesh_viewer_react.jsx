import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function FaceMeshViewer({ landmarks, triangles }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!landmarks || landmarks.length === 0 || !triangles) return;

    // Setup scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Convert landmarks to geometry vertices
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array(
      landmarks.flatMap(({ x, y, z }) => [x * 2 - 1, -y * 2 + 1, z || 0])
    );
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    // Convert triangle indices
    const indices = new Uint16Array(triangles.flat());
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: 0x6699ff,
      wireframe: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 2);
    scene.add(light);

    camera.position.z = 2;

    const animate = () => {
      requestAnimationFrame(animate);
      mesh.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [landmarks, triangles]);

  return <div ref={mountRef} style={{ width: '100%', height: '500px' }} />;
} // 使用例:
// <FaceMeshViewer landmarks={landmarksArray} triangles={triangleArray} />
