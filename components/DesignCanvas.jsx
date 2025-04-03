import React, { useRef, useEffect } from 'react';
import App from '../core/app';

const DesignCanvas = () => {
	const canvasRef = useRef(null);
	const appRef = useRef(null); // Ref to hold the App instance

	useEffect(() => {
		// Ensure canvas exists before initializing
		if (canvasRef.current) {
			// Create and initialize the Three.js App
			const app = new App(canvasRef.current); // Pass canvas directly
			app.init();
			appRef.current = app; // Store the app instance
			console.log('Three.js App initialized');

			// Define resize handler using the app instance
			const handleResize = () => {
				if (appRef.current) {
					appRef.current.resize();
				}
			};

			// Add event listener for window resize
			window.addEventListener('resize', handleResize);

			// Clean up on component unmount
			return () => {
				console.log('Cleaning up Three.js App');
				window.removeEventListener('resize', handleResize);
				if (appRef.current) {
					appRef.current.destroy(); // Add a destroy method to App
				}
				appRef.current = null;
			};
		}
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className="fixed top-0 left-0 w-screen h-screen m-0 p-0 block"
			style={{ display: 'block' }} // style ensures it behaves like block
			id="design-canvas"
		/>
	);
};

export default DesignCanvas;
