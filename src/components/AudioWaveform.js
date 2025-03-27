import React, { useState, useEffect, useContext, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import { FileContext } from '../contexts/fileContext';
import ToggleButton from './ToggleButton';

const AudioWaveform = () => {
	const wavesurferRef = useRef(null);
	const timelineRef = useRef(null);

	// fetch file url from the context
	const { fileURL } = useContext(FileContext);
    
	// crate an instance of the wavesurfer
	const [wavesurferObj, setWavesurferObj] = useState();

	const [playing, setPlaying] = useState(true); // to keep track whether audio is currently playing or not
	const [volume, setVolume] = useState(1); // to control volume level of the audio. 0-mute, 1-max
	const [zoom, setZoom] = useState(1); // to control the zoom level of the waveform
	const [duration, setDuration] = useState(0); // duration is used to set the default region of selection for trimming the audio

	// initialize plugins
	const regionsPlugin = RegionsPlugin.create();


	// create the waveform inside the correct component
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
					plugins: [
						TimelinePlugin.create({
							container: '#wave-timeline',
						}),
						regionsPlugin,
					],
				})
			);
		}
	}, [wavesurferRef, wavesurferObj, regionsPlugin]);

	// once the file URL is ready, load the file to produce the waveform
	useEffect(() => {
		if (fileURL && wavesurferObj) {
			wavesurferObj.load(fileURL);
		}
	}, [fileURL, wavesurferObj]);

	useEffect(() => {
		if (wavesurferObj) {
			wavesurferObj.on('ready', () => {
				wavesurferObj.play();
				regionsPlugin.enableDragSelection({});
				setDuration(Math.floor(wavesurferObj.getDuration()));
	
				console.log("wavesurferObj in ready:", wavesurferObj);
				console.log("regionsPlugin in ready:", regionsPlugin);
				console.log("wavesurferObj.isReady in ready:", wavesurferObj.isReady);
	
				setTimeout(() => {
					regionsPlugin.addRegion({
						start: Math.floor(wavesurferObj.getDuration() / 2) - Math.floor(wavesurferObj.getDuration()) / 5,
						end: Math.floor(wavesurferObj.getDuration() / 2),
						color: 'hsla(265, 100%, 86%, 0.4)',
					});
				}, 50); // Increased delay to 50 milliseconds
			});
	
			wavesurferObj.on('play', () => {
				setPlaying(true);
			});
	
			wavesurferObj.on('finish', () => {
				setPlaying(false);
			});
	
			wavesurferObj.on('region-updated', (region) => {
				const regions = region.wavesurfer.regions.list;
				const keys = Object.keys(regions);
				if (keys.length > 1) {
					regions[keys[0]].remove();
				}
			});
		}
	}, [wavesurferObj, regionsPlugin]);

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
	};

	const handleTrim = (e) => {
		if (wavesurferObj) {
			// get start and end points of the selected region
			const region =
				wavesurferObj.regions.list[
					Object.keys(wavesurferObj.regions.list)[0]
				];

			if (region) {
				const start = region.start;
				const end = region.end;

				// obtain the original array of the audio
				const original_buffer = wavesurferObj.backend.buffer;

				// create a temporary new buffer array with the same length, sample rate and no of channels as the original audio
				const new_buffer = wavesurferObj.backend.ac.createBuffer(
					original_buffer.numberOfChannels,
					original_buffer.length,
					original_buffer.sampleRate
				);

				// create 2 indices:
				// left & right to the part to be trimmed
				const first_list_index = start * original_buffer.sampleRate;
				const second_list_index = end * original_buffer.sampleRate;
				const second_list_mem_alloc =
					original_buffer.length - end * original_buffer.sampleRate;

				// create a new array upto the region to be trimmed
				const new_list = new Float32Array(parseInt(first_list_index));

				// create a new array of region after the trimmed region
				const second_list = new Float32Array(
					parseInt(second_list_mem_alloc)
				);

				// create an array to combine the 2 parts
				const combined = new Float32Array(original_buffer.length);

				// 2 channels: 1-right, 0-left
				// copy the buffer values for the 2 regions from the original buffer

				// for the region to the left of the trimmed section
				original_buffer.copyFromChannel(new_list, 1);
				original_buffer.copyFromChannel(new_list, 0);

				// for the region to the right of the trimmed section
				original_buffer.copyFromChannel(
					second_list,
					1,
					second_list_index
				);
				original_buffer.copyFromChannel(
					second_list,
					0,
					second_list_index
				);

				// create the combined buffer for the trimmed audio
				combined.set(new_list);
				combined.set(second_list, first_list_index);

				// copy the combined array to the new_buffer
				new_buffer.copyToChannel(combined, 1);
				new_buffer.copyToChannel(combined, 0);

				// load the new_buffer, to restart the wavesurfer's waveform display
				wavesurferObj.loadDecodedBuffer(new_buffer);
			}
		}
	};

	return (
		<section className='waveform-container'>
			<div ref={wavesurferRef} id='waveform' />
			<div ref={timelineRef} id='wave-timeline' />
			<div className='all-controls'>
				<div className='left-container'>
					<ToggleButton />
					<button
						title='play/pause'
						className='controls'
						onClick={handlePlayPause}>
						{playing ? (
							<i className='material-icons'>pause</i>
						) : (
							<i className='material-icons'>play_arrow</i>
						)}
					</button>
					<button
						title='reload'
						className='controls'
						onClick={handleReload}>
						<i className='material-icons'>replay</i>
					</button>
					<button className='trim' onClick={handleTrim}>
						<i
							style={{
								fontSize: '1.2em',
								color: 'white',
							}}
							className='material-icons'>
							content_cut
						</i>
						Trim
					</button>
				</div>
				<div className='right-container'>
					<div className='volume-slide-container'>
						<i className='material-icons zoom-icon'>
							remove_circle
						</i>
						<input
							type='range'
							min='1'
							max='1000'
							value={zoom}
							onChange={handleZoomSlider}
							className='slider zoom-slider'
						/>
						<i className='material-icons zoom-icon'>add_circle</i>
					</div>
					<div className='volume-slide-container'>
						{volume > 0 ? (
							<i className='material-icons'>volume_up</i>
						) : (
							<i className='material-icons'>volume_off</i>
						)}
						<input
							type='range'
							min='0'
							max='1'
							step='0.05'
							value={volume}
							onChange={handleVolumeSlider}
							className='slider volume-slider'
						/>
					</div>
				</div>
			</div>
		</section>
	);
};

export default AudioWaveform;