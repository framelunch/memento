import vision from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3';
import React, { useState } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import FaceMeshViewer from './FaceMeshViewer';
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;

export default function Landmarker() {
  const imageRef = useRef();
  const canvasRef = useRef();

  const [imageUrl, setImageUrl] = useState(null);

  const [faceBlendShapes, setFaceBlendShapes] = useState([]);
  const [landmarks, setLandmarks] = useState([]);
  const [isGuide, setIsGuide] = useState(true);
  const [isShowBackground, setIsShowBackground] = useState(true);

  let faceLandmarker;

  const detect = () => {
    const faceLandmarkerResult = faceLandmarker.detect(imageRef.current);
    setFaceBlendShapes(faceLandmarkerResult.faceBlendshapes[0].categories);

    const ctx = canvasRef.current.getContext('2d');
    const drawingUtils = new DrawingUtils(ctx);
    for (const landmarks of faceLandmarkerResult.faceLandmarks) {
      setLandmarks(landmarks);

      // ★ インデックス番号を描画する処理を追加
      landmarks.forEach((landmark, index) => {
        const x = landmark.x * canvasRef.current.width;
        const y = landmark.y * canvasRef.current.height;

        console.log(x, y, index);
      });

      // シェーダー
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, {
        color: '#C0C0C070',
        lineWidth: 1,
      });

      // 右目
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, {
        color: '#FF3030',
      });

      // 右眉
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, {
        color: '#FF3030',
      });

      // 左目
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, {
        color: '#30FF30',
      });

      // 左眉
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, {
        color: '#30FF30',
      });

      // 輪郭
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, {
        color: '#E0E0E0',
      });

      // 口
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, {
        color: '#FFA500',
      });

      // 右目の瞳孔
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, {
        color: '#00FFFF',
      });

      // 左目の瞳孔
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, {
        color: '#FF00FF',
      });
    }
  };

  const handleGuide = () => {
    setIsGuide((prev) => {
      const newState = !prev;
      console.log(prev);
      if (canvasRef.current) {
        canvasRef.current.style.display = newState ? 'block' : 'none';
      }
      return newState;
    });
  };

  const handleLoadImage = async () => {
    if (canvasRef.current) {
      canvasRef.current.remove();
    }

    const img = imageRef.current;
    if (!img) return;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', imageRef.current.width + 'px');
    canvas.setAttribute('height', imageRef.current.height + 'px');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = `${imageRef.current.width}px`;
    canvas.style.height = `${imageRef.current.height}px`;
    canvas.style.zIndex = '10';
    canvas.style.pointerEvents = 'none';
    canvas.style.display = isGuide ? 'block' : 'none';

    imageRef.current.parentElement.appendChild(canvas);
    canvasRef.current = canvas;

    landmarker();
  };

  const handleSelectImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShowBackground = () => {
    setIsShowBackground(!isShowBackground);
  };

  const landmarker = async () => {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
    );
    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        delegate: 'GPU',
      },
      outputFaceBlendshapes: true,
      numFaces: 1,
    });

    detect();
  };

  return (
    <>
      <div className="flex items-start">
        <div className="w-1/2 sticky top-0">
          <input className="w-1/2" type="file" onChange={handleSelectImage} />
          <div className="relative">
            <img src={imageUrl} ref={imageRef} onLoad={handleLoadImage} />
          </div>
          <div className="mt-4 pb-6 flex items-center justify-center gap-4">
            {imageRef.current && (
              <button className="w-1/2" onClick={handleGuide}>
                ガイド表示／非表示
              </button>
            )}
          </div>
          <hr />
          {imageRef.current && landmarks.length ? (
            <>
              <div className="pt-6">
                <button className="mb-4" onClick={handleShowBackground}>
                  3Dモデルのみ／3Dモデル＋2D背景画像
                </button>
                <div className="h-[50vh] ">
                  <FaceMeshViewer
                    key={imageRef.current.src} // 再マウント
                    landmarks={landmarks}
                    textureImg={imageRef.current}
                    isBackgroundImage={isShowBackground}
                  />
                </div>
              </div>
            </>
          ) : (
            ''
          )}
        </div>
        <div className="w-1/2">
          <table className="w-full">
            <tbody>
              {faceBlendShapes.map((shape) => (
                <tr className="" key={shape.index}>
                  <th className="">{shape.categoryName || shape.displayName}</th>
                  <td className="py-1">
                    <div className="relative">
                      {shape.score.toFixed(4)}
                      <span
                        className={`bg-yellow-500 absolute top-0 left-0 h-full -z-[1]`}
                        style={{ width: `${shape.score * 100}%` }}
                      ></span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
