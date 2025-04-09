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
    //const { fileURL } = useContext(FileContext);

    useEffect(() => {
        console.log('First useEffect triggered, fileURL:', props.audioData, 'isWaveSurferReady:', isWaveSurferReady); // Log effect trigger and fileURL
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
            setDuration(Math.floor(wavesurfer.current.getDuration()));
            const rawWaveformData = wavesurfer.current.exportPCM(1024); // Export waveform data
            setWaveformData(rawWaveformData);
            setIsWaveSurferReady(true);
        });

        // TODO: what is this
        wavesurfer.current.on('waveform-ready', () => {
            // You can add any actions that need to happen after the waveform is visually ready here
        });

        return () => {
            console.log('First useEffect cleanup, isWaveSurferReady:', isWaveSurferReady); // Log cleanup
            if (wavesurfer.current && isWaveSurferReady) {
                wavesurfer.current.destroy();
            } else if (wavesurfer.current) {
                wavesurfer.current.stop();
                wavesurfer.current.un('ready');
            }
            setIsWaveSurferReady(false);
        };
    }, [props.audioData, isWaveSurferReady]);

    useEffect(() => {
        console.log('Second useEffect triggered, waveformData length:', waveformData.length, 'duration:', duration, 'transcriptData:', props.transcriptData); // Log second effect trigger
        const canvas = canvasRef.current;
        if (!canvas) return;

        const width = canvas.width;
        const height = canvas.height;
        canvasContext.current = canvas.getContext('2d');
        const ctx = canvasContext.current;

        ctx.clearRect(0, 0, width, height);

        if (waveformData.length > 0) {
            const middleY = height / 2;
            const samples = waveformData.length;
            const barWidth = width / samples;

            ctx.strokeStyle = '#69207F';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < samples; i++) {
                const x = i * barWidth;
                const amplitude = waveformData[i] * (height / 2);
                ctx.moveTo(x, middleY - amplitude);
                ctx.lineTo(x, middleY + amplitude);
            }
            ctx.stroke();
        }

        // Draw transcript if props.transcriptData is available
        if (props.transcriptData && props.transcriptData.length > 0 && duration > 0) {
            const transcriptLineY = height - 30; // Position the transcript line near the bottom

            // Draw the transcript line
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, transcriptLineY);
            ctx.lineTo(width, transcriptLineY);
            ctx.stroke();

            // Function to convert time to canvas x-coordinate
            const timeToX = (time) => {
                return (time / duration) * width;
            };

            // Draw transcript points and labels
            ctx.fillStyle = '#007bff'; // Point color
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';

            props.transcriptData.forEach((item) => {
                const x = timeToX(item.start);
                const pointRadius = 5;

                // Draw a point
                ctx.beginPath();
                ctx.arc(x, transcriptLineY, pointRadius, 0, 2 * Math.PI);
                ctx.fill();

                // Draw the word label
                ctx.fillStyle = '#333';
                ctx.fillText(item.word, x, transcriptLineY - 10);
            });
        }

    }, [waveformData, duration, props.transcriptData]);

    return (
        <div className="waveform-container">
            <div ref={waveformRef} style={{ marginBottom: '10px' }} />
            <canvas ref={canvasRef} width={800} height={150} style={{ border: '1px solid #ccc' }} />
        </div>
    );
};

export default AudioWaveform;