import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

const AudioWaveform = (props) => {
    console.log('AudioWaveform component rendered');

    const waveformRef = useRef(null);
    const wavesurfer = useRef(null);
    const canvasRef = useRef(null);
    const canvasContext = useRef(null);
    const [waveformData, setWaveformData] = useState([]);
    const [duration, setDuration] = useState(0);
    const [isWaveSurferReady, setIsWaveSurferReady] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1); 

    useEffect(() => {
        console.log('First useEffect triggered, fileURL:', props.audioData, 'isWaveSurferReady:', isWaveSurferReady);
        if (!waveformRef.current) return;

        wavesurfer.current = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: window.getComputedStyle(document.body).getPropertyValue('--color-primary'),
            progressColor: window.getComputedStyle(document.body).getPropertyValue('--color-medium'),
            cursorColor: 'black',
            barWidth: 2,
            height: 80,
            responsive: true,
            hideScrollbar: true,
            plugins: []
        });

        wavesurfer.current.load(props.audioData);

        wavesurfer.current.on('ready', () => {
            console.log('wavesurfer.current in ready event:', wavesurfer.current);
            setDuration(Math.floor(wavesurfer.current.getDuration()));

            // Attempt to get waveform data *after* 'ready'
            try {
                const rawWaveformData = wavesurfer.current.exportPeaks(1024);
                setWaveformData(rawWaveformData);
                setIsWaveSurferReady(true);
                console.log('waveformData after export in ready:', rawWaveformData);
            } catch (error) {
                console.error("Error exporting Peaks in ready:", error);
            }
        });

        return () => {
            // eslint-disable-next-line no-lone-blocks
            {/*console.log('First useEffect cleanup, isWaveSurferReady:', isWaveSurferReady);
            if (wavesurfer.current && isWaveSurferReady) {
                wavesurfer.current.destroy();
            } else if (wavesurfer.current) {
                wavesurfer.current.stop();
                wavesurfer.current.un('ready');
            }
            setIsWaveSurferReady(false);*/}
        };
    }, [props.audioData, isWaveSurferReady]);

    useEffect(() => {
        console.log('Second useEffect triggered, waveformData length:', waveformData.length, 'duration:', duration, 'transcriptData:', props.transcriptData);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const width = canvas.width;
        const height = canvas.height;
        canvasContext.current = canvas.getContext('2d');
        const ctx = canvasContext.current;

        ctx.clearRect(0, 0, width, height);

        // Draw waveform manually
        if (waveformData.length > 0) {
            const middleY = height / 2;
            const samples = waveformData.length;
            let barWidth = 2; // Initial bar width
            
            ctx.strokeStyle = '#69207F';
            ctx.lineWidth = 1;

            for (let i = 0; i < samples; i++) {
                // Calculate x-coordinate with zoom
                const x = i * barWidth * zoomLevel;

                // Only draw if the bar is within the visible canvas - PERFORMANCE OPTIMIZATION
                if (x >= 0 && x < width) {
                    const amplitude = waveformData[i] * (height / 2);
                    ctx.beginPath();
                    ctx.moveTo(x, middleY - amplitude);
                    ctx.lineTo(x, middleY + amplitude);
                    ctx.stroke();
                }
            }
        }

        // Draw transcript if props.transcriptData is available
        if (props.transcriptData && props.transcriptData.length > 0 && duration > 0) {
            const transcriptLineY = height - 30;

            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, transcriptLineY);
            ctx.lineTo(width, transcriptLineY);
            ctx.stroke();

            const timeToX = (time) => {
                return (time / duration) * width;
            };

            ctx.fillStyle = '#007bff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';

            props.transcriptData.forEach((item) => {
                const x = timeToX(item.start);
                const pointRadius = 5;

                ctx.beginPath();
                ctx.arc(x, transcriptLineY, pointRadius, 0, 2 * Math.PI);
                ctx.fill();

                ctx.fillStyle = '#333';
                ctx.fillText(item.word, x, transcriptLineY - 10);
            });
        }

    }, [waveformData, duration, props.transcriptData, zoomLevel]); // zoomLevel dependency added

    return (
        <div className="waveform-container">
            <div ref={waveformRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }} /> {/*Crucial: waveformRef div*/}
            <canvas
                ref={canvasRef}
                width={800}
                height={150}
                style={{ border: '1px solid #ccc' }}
            />
            {/* Zoom Controls (Example) */}
            <div>
                <button onClick={() => setZoomLevel(zoomLevel * 1.2)}>Zoom In</button>
                <button onClick={() => setZoomLevel(zoomLevel / 1.2)}>Zoom Out</button>
            </div>
        </div>
    );
};

export default AudioWaveform;