import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Speech from 'react-speech';
import Webcam from "react-webcam";
import drawRect from './utilities';
import './detection.css';

const DetectionModel = () => {
  const [activate, setActivate] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('Front');
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const predictions = useRef([]);
  const lastPredict = useRef([]);
  const combinedPredict = useRef('');

  // Main function
  const runCoco = async () => {
    // 3. TODO - Load network 
    const net = await cocossd.load();
    
    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 10);
  };

  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // 4. TODO - Make Detections
      const objs = await net.detect(video);

      // Predictions storage
      objs.forEach((obj) => {
        if(!predictions.current.includes(obj.class)){
          predictions.current.push(obj.class);
          console.log(predictions.current);
        }
      })

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");

      // 5. TODO - Update drawing utility
      drawRect(objs, ctx);
    }
  };

  const handleActivation = () => {
    setActivate(!activate)
  }

  const handleCamera = () => {
    if(cameraFacing === 'Front')
      setCameraFacing('Rear')
    else
      setCameraFacing('Front')
  }

  const result = () => {
    lastPredict.current = predictions.current;
    combinedPredict.current = '';
    for(let i = 0; i < lastPredict.current.length; i++){
      combinedPredict.current += lastPredict.current[i] + ' ';
    }
    predictions.current = [];
    setActivate(false);
  }

  const videoConstraints = {
    // width: 640,
    // height: 720,
    width: 640,
    height: 720,
    facingMode: cameraFacing === 'Front'? 'user' : { exact: 'environment' }
  };

  useEffect(() => {
    runCoco();
  });
  
  if(activate)
  return (
    <div className="model">
        <h2>Our Solution: Time to See the World</h2>
        <button className='activateBtn' onClick={handleActivation}>Deactivate Detection Model</button>
        <button className='cameraBtn' onClick={handleCamera}>{'Current: '+cameraFacing+' Camera'}</button>
        <button className='resultBtn' onClick={result}>Result</button>
        <br></br>
        {combinedPredict.current.length !== 0 && <div><Speech 
            text={combinedPredict.current} 
            textAsButton={true} 
            pitch="1"
            rate="0.5"
            volume="1"
            lang="en-GB"
            voice="Daniel" /></div>
        }
        <div className='list'>
        {lastPredict.current.map((obj) => {
            return <div><Speech 
            text={obj} 
            textAsButton={true} 
            pitch="1"
            rate="1"
            volume="1"
            lang="en-GB"
            voice="Daniel" /></div>
          })
        }
        </div>
        <br></br> 
          <Webcam
            ref={webcamRef}
            muted={true} 
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              textAlign: "center",
              zindex: 9,
            }}
            videoConstraints = {videoConstraints}
          />

          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              textAlign: "center",
              zindex: 8,
              // width: 640,
              // height: 480
              width: 640,
              height: 480
            }}
          />
    </div>
  );
  else
    return (
      <div className="model">
          <h2 className='topic'>Our Solution: Time to See the World</h2>
          <button className='activateBtn' onClick={handleActivation}>Activate Detection Model</button>
          <button className='cameraBtn' onClick={handleCamera}>{'Current: '+cameraFacing+' Camera'}</button>
          <button className='resultBtn' onClick={result}>Result</button>
          <br></br>
          {combinedPredict.current.length !== 0 && <div><Speech 
            text={combinedPredict.current} 
            textAsButton={true} 
            pitch="1"
            rate="0.5"
            volume="1"
            lang="en-GB"
            voice="Daniel" /></div>
          }
          <div className='list'>
            {lastPredict.current.map((obj) => {
                return <div><Speech 
                text={obj} 
                textAsButton={true} 
                pitch="1"
                rate="1"
                volume="1"
                lang="en-GB"
                voice="Daniel" /></div>
              })
            }
          </div>
      </div>
    );
}

export default DetectionModel;