import React, { useState, useEffect, useContext, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { FileContext } from '../contexts/fileContext';
import ToggleButton from './ToggleButton';

const AudioWaveform = () => {
	const wavesurferRef = useRef(null);
    const canvasRef = useRef(null);

    const [canvasContext, setCanvasContext] = useState(null);
    const { fileURL } = useContext(FileContext);
	
    const [wavesurferObj, setWavesurferObj] = useState();
    const [playing, setPlaying] = useState(true);
    const [volume, setVolume] = useState(1);
    const [zoom, setZoom] = useState(100); // Initialize with 100
    const [duration, setDuration] = useState(0);
    const [waveformData, setWaveformData] = useState([]);

	useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            setCanvasContext(ctx);
            canvas.width = canvas.offsetWidth;
            canvas.height = 200;
        }
    }, []);
	
	useEffect(() => {
        if (wavesurferRef.current && !wavesurferObj) {
            setWavesurferObj(
                WaveSurfer.create({
                    container: '#waveform',
                    scrollParent: true,
                    autoCenter: true,
                    cursorColor: 'violet',
                    loopSelection: true,
                    waveColor: '#211027',
                    progressColor: '#69207F',
                    responsive: true,
                    plugins: [],
                })
            );
        }
    }, [wavesurferRef, wavesurferObj]);

	// once the file URL is ready, load the file to produce the waveform
	useEffect(() => {
        if (fileURL && wavesurferObj) {
            wavesurferObj.load(fileURL);
        }
    }, [fileURL, wavesurferObj]);

	useEffect(() => {
        if (wavesurferObj && wavesurferObj.decodedData) {
            const audioBuffer = wavesurferObj.decodedData;
            const channelData = audioBuffer.getChannelData(0);
            const canvasWidth = canvasRef.current ? canvasRef.current.width : 0;
            const zoomLevel = zoom / 100; // Normalize zoom (e.g., 1 is fully zoomed out, higher values zoom in)
            const numPeaks = Math.max(100, Math.floor(canvasWidth * zoomLevel * 5)); // Adjust multiplier as needed
            const step = Math.floor(channelData.length / numPeaks);
            const peaks = [];
    
            for (let i = 0; i < channelData.length; i += step) {
                let max = 0;
                for (let j = 0; j < step && i + j < channelData.length; j++) {
                    max = Math.max(max, Math.abs(channelData[i + j]));
                }
                peaks.push(max);
            }
    
            setWaveformData(peaks);
            console.log("Waveform Peaks (zoom changed):", peaks.length, zoomLevel, step);
        }
    }, [wavesurferObj, zoom]);
    
    useEffect(() => {
        if (wavesurferObj) {
            wavesurferObj.on('ready', () => {
                wavesurferObj.play();
                setDuration(Math.floor(wavesurferObj.getDuration()));
    
                // The waveform data should now be fetched in the other useEffect
            });
    
            wavesurferObj.on('play', () => {
                setPlaying(true);
            });
    
            wavesurferObj.on('finish', () => {
                setPlaying(false);
            });
        }
    }, [wavesurferObj]);

	useEffect(() => {
        if (canvasContext && waveformData.length > 0) {
            const canvas = canvasRef.current;
            const width = canvas.width;
            const height = canvas.height;
            const middleY = height / 2;
            const samples = waveformData.length;
            const barWidth = width / samples; // Might need adjustment
    
            canvasContext.clearRect(0, 0, width, height);
            canvasContext.strokeStyle = '#69207F';
            canvasContext.lineWidth = 1;
            canvasContext.beginPath();
            for (let i = 0; i < samples; i++) {
                const x = i * barWidth;
                const amplitude = waveformData[i] * (height / 2);
                canvasContext.moveTo(x, middleY - amplitude);
                canvasContext.lineTo(x, middleY + amplitude);
            }
            canvasContext.stroke();
        }
    }, [canvasContext, waveformData]);

	// set volume of the wavesurfer object, whenever volume variable in state is changed
	useEffect(() => {
        if (wavesurferObj) wavesurferObj.setVolume(volume);
    }, [volume, wavesurferObj]);

	// set zoom level of the wavesurfer object, whenever the zoom variable in state is changed
	useEffect(() => {
        if (wavesurferObj && wavesurferObj.backend && wavesurferObj.backend.isReady) {
            wavesurferObj.zoom(zoom);
        }
    }, [zoom, wavesurferObj]);

	const handlePlayPause = (e) => {
		wavesurferObj.playPause();
		setPlaying(!playing);
	};

	const handleReload = (e) => {
		// stop will return the audio to 0s, then play it again
		wavesurferObj.stop();
		wavesurferObj.play();
		setPlaying(true); // to toggle the play/pause button icon
	};

	const handleVolumeSlider = (e) => {
		setVolume(e.target.value);
	};

	const handleZoomSlider = (e) => {
		setZoom(e.target.value);
        console.log("Zoom Value:", e.target.value); // ADD THIS LINE
	};

	return (
		<section className='waveform-container'>
            <div ref={wavesurferRef} id='waveform' style={{ display: 'none' }} />
            <canvas ref={canvasRef} id='visualTranscriptCanvas' width={"100vw"} height={200} style={{ width: '100%', height: '200px', border: '1px solid #ccc' }} />
            <div className='all-controls'>
                <div className='left-container'>
                    <ToggleButton />
                    <button title='play/pause' className='controls' onClick={handlePlayPause}>
                        {playing ? <i className='material-icons'>pause</i> : <i className='material-icons'>play_arrow</i>}
                    </button>
                    <button title='reload' className='controls' onClick={handleReload}>
                        <i className='material-icons'>replay</i>
                    </button>
                </div>
                <div className='right-container'>
                    <div className='volume-slide-container'>
                        <i className='material-icons zoom-icon'>remove_circle</i>
                        <input type='range' min='1' max='1000' value={zoom} onChange={handleZoomSlider} className='slider zoom-slider' />
                        <i className='material-icons zoom-icon'>add_circle</i>
                    </div>
                    <div className='volume-slide-container'>
                        {volume > 0 ? <i className='material-icons'>volume_up</i> : <i className='material-icons'>volume_off</i>}
                        <input type='range' min='0' max='1' step='0.05' value={volume} onChange={handleVolumeSlider} className='slider volume-slider' />
                    </div>
                </div>
            </div>
        </section>
	);
};

export default AudioWaveform;