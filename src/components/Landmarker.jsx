import vision from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3';
import { useState } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;

export default function Landmarker() {
  const imageRef = useRef();
  const canvasRef = useRef();

  const [faceBlendShapes, setFaceBlendShapes] = useState([]);
  const [isGuide, setIsGuide] = useState(true);

  let isDetect = false;
  let faceLandmarker;

  const detect = () => {
    if (isDetect) return;
    const faceLandmarkerResult = faceLandmarker.detect(imageRef.current);
    setFaceBlendShapes(faceLandmarkerResult.faceBlendshapes[0].categories);

    const ctx = canvasRef.current.getContext('2d');
    const drawingUtils = new DrawingUtils(ctx);
    for (const landmarks of faceLandmarkerResult.faceLandmarks) {
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
    setIsGuide(!isGuide);
  };

  useEffect(() => {
    void (async () => {
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
      isDetect = true;
    })();
  }, []);

  return (
    <>
      <div className="flex items-start">
        <div className="w-1/2 sticky top-0">
          <div className="relative">
            <img src={`/image1.jpg`} ref={imageRef} />
            <canvas
              ref={canvasRef}
              className={`absolute z-10 pointer-events-none w-full h-full top-0 left-0 ${!isGuide && 'hidden'} `}
            ></canvas>
          </div>
          <button className="mt-4" onClick={handleGuide}>
            ガイド表示／非表示
          </button>
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
