import '../styles/AudioWaveform.css';
import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

const AudioWaveform = (props) => {
    console.log('AudioWaveform component rendered');
    console.log('AudioWaveform props.audioData:', props.audioData);

    const waveformRef = useRef(null);
    const wavesurfer = useRef(null);
    const canvasRef = useRef(null);
    const canvasContext = useRef(null);
    const [waveformData, setWaveformData] = useState([]);
    const [duration, setDuration] = useState(0);
    const [isWaveSurferReady, setIsWaveSurferReady] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1); 

    useEffect(() => {
        console.log('First useEffect triggered, props.audioData:', props.audioData, 'isWaveSurferReady:', isWaveSurferReady);
        if (!waveformRef.current) return;

        wavesurfer.current = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: window.getComputedStyle(document.body).getPropertyValue('--color-primary'),
            progressColor: window.getComputedStyle(document.body).getPropertyValue('--color-medium'),
            cursorColor: 'black',
            barWidth: 2,
            height: 150,
            responsive: true,
            hideScrollbar: true,
            plugins: []
        });

        wavesurfer.current.load(props.audioData);

        wavesurfer.current.on('ready', () => {
            console.log('wavesurfer.current in ready event:', wavesurfer.current);
            setDuration(Math.floor(wavesurfer.current.getDuration()));
        
            try {
                const rawWaveformData = wavesurfer.current.exportPeaks(1024);
                setWaveformData(rawWaveformData);
                setIsWaveSurferReady(true);
            } catch (error) {
                console.error("Error exporting Peaks in ready:", error);
            }
        });

        return () => {
            console.log('First useEffect cleanup, isWaveSurferReady:', isWaveSurferReady);
            if (wavesurfer.current && isWaveSurferReady) {
                wavesurfer.current.destroy();
            } else if (wavesurfer.current) {
                wavesurfer.current.stop();
                wavesurfer.current.un('ready');
            }
            setIsWaveSurferReady(false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.audioData]);

    useEffect(() => {
        console.log('Second useEffect triggered, waveformData length:', waveformData.length, 'duration:', duration, 'transcriptData:', props.transcriptData);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    
        if (waveformData.length > 0 && duration > 0) {
            const width = canvas.width;
            const height = canvas.height;
            const barWidth = 2; // Adjust as needed
            const gap = 1; // Adjust as needed
            const zoom = zoomLevel;
    
            // Draw waveform (your existing drawing logic)
            ctx.beginPath();
            ctx.strokeStyle = '#4F4A85'; // Waveform color
            // Use fillRect for drawing bars, as in your previous code
            waveformData.forEach((value, i) => {
                const x = i * (barWidth + gap) * zoom;
                 // You might need to adjust how you scale the amplitude for drawing
                const amplitude = value * (height / 2); // Example scaling
                const y = height / 2 - amplitude; // Adjust Y position based on amplitude
    
                // Only draw if the bar is within the visible canvas - PERFORMANCE OPTIMIZATION
                if (x >= 0 && x < width) {
                   ctx.fillRect(x, height / 2 - amplitude, barWidth, amplitude * 2); // Draw centered bars
                }
            });
            // ctx.stroke(); // stroke is not needed for fillRect
    
            // --- Draw Transcript Line and Points ---
            if (props.transcriptData && props.transcriptData.length > 0) {
                const transcriptLineY = height - 30; // Constant Y-position for the transcript line
    
                // Draw the horizontal transcript line
                ctx.beginPath();
                ctx.strokeStyle = '#333'; // Color of the transcript line
                ctx.lineWidth = 2; // Thickness of the transcript line
                ctx.moveTo(0, transcriptLineY);
                // We need to draw the line potentially wider than the canvas for scrolling
                const waveformRenderedWidth = waveformData.length * (barWidth + gap) * zoom;
                ctx.lineTo(waveformRenderedWidth, transcriptLineY);
                ctx.stroke();
    
                // Draw points for each transcript item
                ctx.fillStyle = '#007bff'; // Color of the transcript points
                const pointRadius = 5; // Radius of the points
    
                props.transcriptData.forEach((item) => {
                     // Calculate the X-coordinate based on the timestamp
                    const x = (item.start / duration) * waveformRenderedWidth; // Position based on time and total rendered width
    
                    // Only draw if the point is within the potentially scrollable area
                    if (x >= 0 && x <= waveformRenderedWidth) {
                         ctx.beginPath();
                         ctx.arc(x, transcriptLineY, pointRadius, 0, 2 * Math.PI);
                         ctx.fill();
    
                         // Optional: Draw text label for each point (e.g., the word)
                         // You'll need to adjust text positioning and potentially add logic
                         // to avoid overlapping labels at high zoom levels.
                         // ctx.fillStyle = '#333';
                         // ctx.font = '12px Arial';
                         // ctx.textAlign = 'center';
                         // ctx.textBaseline = 'bottom';
                         // ctx.fillText(item.word, x, transcriptLineY - 10);
                    }
                });
            }
        }
    }, [waveformData, duration, props.transcriptData, zoomLevel]); // Dependencies remain the same

    return (
        <div className="waveform-container">
            <div className="canvas-wrapper">
                <div ref={waveformRef} className="waveform-wrapper" />
                <canvas
                    ref={canvasRef}
                    className="waveform-canvas"
                    width={900}
                    height={150}
                />
            </div>
            <div className="zoom-controls">
                <button onClick={() => setZoomLevel(zoomLevel * 1.2)}>Zoom In</button>
                <button onClick={() => setZoomLevel(zoomLevel / 1.2)}>Zoom Out</button>
            </div>
        </div>
    );
};

export default AudioWaveform;